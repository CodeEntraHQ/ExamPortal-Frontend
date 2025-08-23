import { tokenService } from './tokenService';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Makes a fetch request with the given options
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  const token = tokenService.getToken();
  if (token) {
    // Check if token is expired
    if (tokenService.isTokenExpired(token)) {
      // Handle token expiration - could redirect to login or try to refresh token
      console.warn('Token expired, redirecting to login');
      window.location.href = '/login';
      return { status: 'FAILURE', responseMsg: 'SESSION_EXPIRED' };
    }

    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Include cookies in requests
  };

  try {
    const response = await fetch(url, config);

    // Handle unauthorized responses (e.g., token rejected by server)
    if (response.status === 401) {
      // Clear auth data and redirect to login
      tokenService.removeToken();
      localStorage.removeItem('user_data');
      window.location.href = '/login';
      return { status: 'FAILURE', responseMsg: 'AUTHENTICATION_FAILED' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * HTTP request methods
 */
export const api = {
  get: (endpoint, options = {}) => {
    return fetchApi(endpoint, { ...options, method: 'GET' });
  },
  post: (endpoint, data, options = {}) => {
    return fetchApi(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  put: (endpoint, data, options = {}) => {
    return fetchApi(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: (endpoint, options = {}) => {
    return fetchApi(endpoint, { ...options, method: 'DELETE' });
  },
};
