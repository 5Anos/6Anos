// API client relying strictly on HttpOnly session cookies in fullstack mode,
// or seamless client-side persistent storage on static hosts like GitHub Pages.

import { executeClientRequest } from './services/clientBackend';

export function isStaticDeployment(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('github.pages') ||
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
  const baseUrl = getApiBaseUrl();

  // If hosted on GitHub Pages and no external backend URL is specified, execute via client backend
  if (!baseUrl && isStaticDeployment()) {
    return executeClientRequest(endpoint, options);
  }

  const url = buildApiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include Bearer authorization token if saved in localStorage (guarantees cross-device & cross-browser access)
  if (typeof window !== 'undefined' && !headers.has('Authorization')) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // If static server returns 405 Method Not Allowed or 404 Not Found, seamlessly fallback to client backend
    if ((response.status === 405 || response.status === 404) && !baseUrl) {
      console.info(`[API] Static server returned ${response.status}, executing client backend for ${endpoint}`);
      return executeClientRequest(endpoint, options);
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

    return response.json();
  } catch (err: any) {
    // If fetch failed completely (network error / static host) and no external API URL is configured, fallback to clientBackend
    if (!baseUrl && (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError') || err?.name === 'TypeError')) {
      console.info(`[API] Fetch failed on static host, fallback to client backend for ${endpoint}`);
      return executeClientRequest(endpoint, options);
    }
    throw err;
  }
}

export async function downloadFile(url: string, defaultFilename: string) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl && isStaticDeployment()) {
    const content = await executeClientRequest(url, { method: 'GET' });
    const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], {
      type: 'text/csv;charset=utf-8;',
    });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
    return;
  }

  const fullUrl = buildApiUrl(url);
  const headers = new Headers();

  try {
    const response = await fetch(fullUrl, { headers, credentials: 'include' });
    if (!response.ok) {
      if ((response.status === 405 || response.status === 404) && !baseUrl) {
        const content = await executeClientRequest(url, { method: 'GET' });
        const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], {
          type: 'text/csv;charset=utf-8;',
        });
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = defaultFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        return;
      }
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
  } catch (err) {
    if (!baseUrl) {
      const content = await executeClientRequest(url, { method: 'GET' });
      const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], {
        type: 'text/csv;charset=utf-8;',
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      return;
    }
    throw err;
  }
}

