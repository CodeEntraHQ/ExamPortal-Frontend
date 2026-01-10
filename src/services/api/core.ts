/**
 * Core API utilities
 * Provides authenticated fetch wrapper and API URL helper
 */

import { envConfig } from '@/config/env';

const API_BASE_URL = envConfig.apiBaseUrl;

/**
 * Get the full API URL for an endpoint
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Get authentication token from sessionStorage
 * sessionStorage is cleared when browser tab/window is closed
 */
export function getToken(): string | null {
  return sessionStorage.getItem('token');
}

/**
 * Set authentication token in sessionStorage
 * sessionStorage is cleared when browser tab/window is closed
 */
export function setToken(token: string): void {
  sessionStorage.setItem('token', token);
}

/**
 * Remove authentication token from sessionStorage
 */
export function removeToken(): void {
  sessionStorage.removeItem('token');
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
    // Handle 401 Unauthorized - token is invalid or expired
    if (response.status === 401) {
      // Clear authentication data
      removeToken();
      sessionStorage.removeItem('user');
      
      // Only redirect if we're not already on the login/landing page
      // This prevents infinite redirect loops
      if (!window.location.pathname.includes('login') && window.location.pathname !== '/') {
        // Dispatch a custom event that AuthProvider can listen to
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    
    let errorMessage = `Server error: ${response.status} ${response.statusText}`;
    let errorData: any = null;
    
    // Log request details for debugging
    let requestBody: BodyInit | any | null = null;
    if (options.body) {
      try {
        requestBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      } catch (e) {
        requestBody = options.body;
      }
    }
    
    console.error('❌ API Error - Request Details:', {
      url: typeof url === 'string' ? url : url.url,
      method: options.method || 'GET',
      requestBody: requestBody,
      headers: Object.fromEntries(new Headers(options.headers).entries()),
    });
    
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.responseMessage || errorMessage;
      
      // Preserve error code for subscription expired errors
      // Backend sends responseCode as "SUBSCRIPTION_EXPIRED" in error response
      if (errorData.responseCode === 'SUBSCRIPTION_EXPIRED' || 
          errorData.code === 'SUBSCRIPTION_EXPIRED' || 
          errorMessage.toLowerCase().includes('subscription has expired')) {
        const customError: any = new Error(errorMessage);
        customError.code = 'SUBSCRIPTION_EXPIRED';
        customError.subscriptionExpired = true;
        throw customError;
      }
      
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData: errorData
      });
    } catch (e: any) {
      // If it's already our custom error, re-throw it
      if (e && (e.code === 'SUBSCRIPTION_EXPIRED' || e.subscriptionExpired)) {
        throw e;
      }
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

