// API client communicating strictly with the server backend and Firebase Firestore.
// Official persistent storage is Firebase Firestore.
import { clientDispatch } from './lib/clientDispatcher';
import {
  buildSafeAttemptSummary,
  emitSimulatorMistake,
  getSimulatorMeta,
} from './lib/simulatorHints';

function notifySimulatorMistakeIfNeeded(endpoint: string, options: RequestInit, responseData: any): void {
  try {
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'POST' || !endpoint.includes('/api/pedagogical/activities/complete')) {
      return;
    }
    if (!options.body || typeof options.body !== 'string') return;
    const parsedBody = JSON.parse(options.body);
    const activityId = typeof parsedBody?.activityId === 'string' ? parsedBody.activityId.trim() : '';
    if (!activityId.startsWith('sim-')) return;

    const scoreCandidate =
      typeof responseData?.score === 'number'
        ? responseData.score
        : typeof parsedBody?.score === 'number'
          ? parsedBody.score
          : null;

    if (scoreCandidate === null || scoreCandidate >= 100) return;

    const worldId = Number(parsedBody?.worldId) || 1;
    const meta = getSimulatorMeta(activityId, worldId);
    const attemptSummary = buildSafeAttemptSummary(
      activityId,
      parsedBody?.payload || parsedBody?.answers || parsedBody,
      scoreCandidate
    );

    emitSimulatorMistake({
      simulatorId: activityId,
      simulatorTitle: meta.title,
      worldId: meta.worldId,
      topic: meta.topic,
      score: scoreCandidate,
      attemptSummary,
      timestamp: Date.now(),
    });
  } catch {
    // Non-blocking notification
  }
}

export function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname.endsWith('github.io') ||
    hostname.includes('pages.dev') ||
    hostname.includes('netlify.app') ||
    hostname.includes('vercel.app') ||
    window.location.protocol === 'file:'
  );
}

/**
 * Resolves the backend base URL dynamically.
 * Priority:
 * 1. Build-time Vite env: import.meta.env.VITE_API_URL or import.meta.env.VITE_API_BASE_URL
 * 2. Runtime global window override: (window as any).__API_URL__
 * 3. Fallback: empty string (uses relative paths for same-origin dev / unified deployment)
 */
export function getApiBaseUrl(): string {
  const meta = import.meta as any;
  const envUrl = meta?.env?.VITE_API_URL || meta?.env?.VITE_API_BASE_URL;

  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && (window as any).__API_URL__) {
    const winUrl = String((window as any).__API_URL__).trim();
    if (winUrl.length > 0) {
      return winUrl.replace(/\/+$/, '');
    }
  }
  return '';
}

/**
 * Builds the complete URL for an API endpoint.
 */
export function buildApiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (!baseUrl) {
    return cleanEndpoint;
  }

  return `${baseUrl}${cleanEndpoint}`;
}

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If running on GitHub Pages or static host without backend URL, dispatch directly to client dispatcher
  if (isStaticHost() && !getApiBaseUrl()) {
    try {
      const staticRes = await clientDispatch<T>(endpoint, options);
      notifySimulatorMistakeIfNeeded(endpoint, options, staticRes);
      return staticRes;
    } catch (clientErr: any) {
      console.error(`[Client Firestore Error] ${endpoint}:`, clientErr);
      throw clientErr;
    }
  }

  const isAiEndpoint = endpoint.includes('/api/ai/');
  const url = buildApiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include Bearer authorization token if present for cross-device authentication
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const directUserId = localStorage.getItem('auth_user_id') || localStorage.getItem('user_id');
    if (directUserId && !headers.has('x-user-id')) {
      headers.set('x-user-id', directUserId);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (netErr: any) {
    if (isAiEndpoint) {
      throw new Error('Não foi possível contactar o Robo-Guia. Verifica a tua ligação e tenta novamente.');
    }
    console.warn(`[API Network Error] ${endpoint}, attempting direct Firebase Firestore access:`, netErr);
    try {
      const fallbackRes = await clientDispatch<T>(endpoint, options);
      notifySimulatorMistakeIfNeeded(endpoint, options, fallbackRes);
      return fallbackRes;
    } catch (fallbackErr: any) {
      throw new Error(fallbackErr.message || 'Não foi possível guardar os dados. Verifique a ligação.');
    }
  }

  // If server returns 405 (Method Not Allowed - static hosting like GitHub Pages), 404, or 401 with local fallback
  // Never silently mask real AI server errors with static fallback.
  if (
    !isAiEndpoint &&
    (response.status === 405 ||
      response.status === 404 ||
      (response.status === 401 &&
        typeof window !== 'undefined' &&
        (localStorage.getItem('auth_user_id') || localStorage.getItem('user_id'))))
  ) {
    console.warn(`[API HTTP ${response.status}] ${endpoint}, executing directly against Firebase Firestore...`);
    try {
      const fallbackRes = await clientDispatch<T>(endpoint, options);
      notifySimulatorMistakeIfNeeded(endpoint, options, fallbackRes);
      return fallbackRes;
    } catch (fallbackErr: any) {
      throw new Error(fallbackErr.message || `Erro ${response.status}: ${response.statusText}`);
    }
  }

  if (!response.ok) {
    let errorMsg = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // not json
    }
    throw new Error(errorMsg);
  }

  // Handle CSV/text responses
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('text/csv') || contentType.includes('text/plain'))) {
    return (await response.text()) as any;
  }

  if (contentType && !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Resposta inesperada do servidor (${contentType}): ${text.slice(0, 100)}`);
  }

  const data = await response.json();
  notifySimulatorMistakeIfNeeded(endpoint, options, data);
  return data;
}

export async function downloadFile(url: string, defaultFilename: string) {
  if (isStaticHost() && !getApiBaseUrl()) {
    const { clientDownloadExport } = await import('./lib/clientDispatcher');
    return await clientDownloadExport(url, defaultFilename);
  }

  const fullUrl = buildApiUrl(url);
  const headers = new Headers();

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, { headers, credentials: 'include' });
  } catch (err: any) {
    console.warn(`[Download Network Error] ${url}, falling back to direct export:`, err);
    try {
      const { clientDownloadExport } = await import('./lib/clientDispatcher');
      return await clientDownloadExport(url, defaultFilename);
    } catch {
      throw new Error('Não foi possível transferir o ficheiro. Verifique a ligação ao servidor.');
    }
  }

  if (!response.ok) {
    try {
      const { clientDownloadExport } = await import('./lib/clientDispatcher');
      return await clientDownloadExport(url, defaultFilename);
    } catch {}
    let msg = `Erro ${response.status}: ${response.statusText}`;
    try {
      const err = await response.json();
      if (err.error) msg = err.error;
    } catch {}
    throw new Error(msg);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition');
  let filename = defaultFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match?.[1]) filename = match[1];
  }
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}
