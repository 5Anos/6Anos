// API client communicating strictly with the server backend and Firebase Firestore.
// No localStorage or browser-based fallback storage for pedagogical data.

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
  const url = buildApiUrl(endpoint);
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Include Bearer authorization token if present for cross-device authentication
  if (typeof window !== 'undefined' && !headers.has('Authorization')) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
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
    console.error(`[API Network Error] ${endpoint}:`, netErr);
    throw new Error('Não foi possível guardar os dados. Verifique a ligação ao servidor.');
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
}

export async function downloadFile(url: string, defaultFilename: string) {
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
    console.error(`[Download Network Error] ${url}:`, err);
    throw new Error('Não foi possível transferir o ficheiro. Verifique a ligação ao servidor.');
  }

  if (!response.ok) {
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
