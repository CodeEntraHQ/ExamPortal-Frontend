const API_BASE_URL = 'http://localhost:8000/v1';

/**
 * Stores the authentication token in localStorage.
 * @param token The JWT token to store.
 */
export const storeToken = (token: string): void => {
  try {
    localStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Failed to store token in localStorage:', error);
  }
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns The stored token or null if not found.
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.error('Failed to retrieve token from localStorage:', error);
    return null;
  }
};

/**
 * Removes the authentication token from localStorage.
 */
export const removeToken = (): void => {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Failed to remove token from localStorage:', error);
  }
};

/**
 * A wrapper around the fetch API to automatically include the Authorization header.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns The fetch response.
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Auto-logout on 401 Unauthorized
    if (response.status === 401) {
      removeToken();
      // Optionally redirect to login page
      window.location.href = '/login'; 
    }
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.responseMessage || errorData.message);
  }
  
  return response;
};

export const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export * from './user';
export * from './auth';
export * from './twoFactorAuth';
export * from './entities';
