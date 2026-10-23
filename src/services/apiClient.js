/**
 * AURA Event Gear — Central HTTP API Client
 * Clean fetch wrapper with error normalization, headers, and mock detection.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Standard HTTP request wrapper
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {}, token } = {}) {
  const url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const requestHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  const activeToken =
    token ||
    (typeof window !== 'undefined' &&
      (localStorage.getItem('aura_auth_token') || sessionStorage.getItem('aura_auth_token')));

  if (activeToken) {
    requestHeaders['Authorization'] = `Bearer ${activeToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof responseData === 'object' && (responseData.message || responseData.error)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or connection failure
    throw new ApiError(
      `Network Error: Failed to reach backend API at ${url}. ${error.message}`,
      0,
      { originalError: error.message }
    );
  }
}

export default {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
  USE_MOCK_DATA,
};
