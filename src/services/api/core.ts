/**
 * Core API utilities
 * Provides authenticated fetch wrapper and API URL helper
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Get the full API URL for an endpoint
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Get authentication token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Set authentication token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Remove authentication token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('token');
}

/**
 * Authenticated fetch wrapper that automatically adds Authorization header
 */
export async function authenticatedFetch(
  url: string | Request,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Set default content type for JSON requests
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    try {
      JSON.parse(options.body);
      headers.set('Content-Type', 'application/json');
    } catch {
      // Not JSON, don't set content type
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for CORS
  });

  // Handle non-2xx responses
  if (!response.ok) {
    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
    let errorData: any = null;
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.responseMessage || errorMessage;
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData: errorData
      });
    } catch (e) {
      // If response is not JSON, use default error message
      console.error('❌ API Error - Non-JSON response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
    }
    
    throw new Error(errorMessage);
  }

  return response;
}

