// ============================================================
// IHM Platform - Base HTTP Client
// ============================================================
// Wraps fetch with auth headers, error handling, and timeout.
// All API service modules should use this client.

import { API_CONFIG } from '../config/api.config';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(`${API_CONFIG.BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('ihm_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function httpClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(buildUrl(path, params), {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: response.statusText })) as Record<string, unknown>;
      const message = (body.error as Record<string, unknown>)?.message as string
        || body.message as string
        || 'Request failed';
      throw new ApiError(response.status, message, body);
    }

    // Handle 204 No Content
    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(408, 'Request timed out');
    }
    throw new ApiError(0, 'Network error — please check your connection');
  }
}

// Convenience wrappers
export const api = {
  get: <T>(path: string, params?: RequestOptions['params']) =>
    httpClient<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body: unknown) =>
    httpClient<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    httpClient<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    httpClient<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) =>
    httpClient<T>(path, { method: 'DELETE' }),

  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: getAuthHeaders(), // no Content-Type — browser sets multipart boundary
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: response.statusText })) as Record<string, unknown>;
        const message = (body.error as Record<string, unknown>)?.message as string || 'Upload failed';
        throw new ApiError(response.status, message, body);
      }
      return response.json() as Promise<T>;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof ApiError) throw err;
      throw new ApiError(0, 'Upload failed — check your connection');
    }
  },
};
