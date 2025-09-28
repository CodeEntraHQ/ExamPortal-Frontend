import { API_CONFIG } from '../utils/constants.js';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = sessionStorage.getItem('token');

    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          if (data.status === 'FAILURE') {
            throw new Error(
              data.responseMessage ||
                data.responseCode ||
                `Request failed with status ${response.status}`
            );
          }
          throw new Error(
            data.message || `Request failed with status ${response.status}`
          );
        }

        if (data.status === 'FAILURE') {
          throw new Error(
            data.responseMessage || data.responseCode || 'Request failed'
          );
        }

        return data;
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(
            text || `Request failed with status ${response.status}`
          );
        }
        return text;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async requestPublic(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (!response.ok) {
          if (data.status === 'FAILURE') {
            throw new Error(
              data.responseMessage ||
                data.responseCode ||
                `Request failed with status ${response.status}`
            );
          }
          throw new Error(
            data.message || `Request failed with status ${response.status}`
          );
        }

        if (data.status === 'FAILURE') {
          throw new Error(
            data.responseMessage || data.responseCode || 'Request failed'
          );
        }

        return data;
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(
            text || `Request failed with status ${response.status}`
          );
        }
        return text;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('tokenExpiry');
  }

  // Token management
  setToken(token) {
    sessionStorage.setItem('token', token);
    // Extract expiry from JWT token
    this.setTokenExpiryFromJWT(token);
  }

  getToken() {
    return sessionStorage.getItem('token');
  }

  setUser(user) {
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setTokenExpiry(expiryTime) {
    sessionStorage.setItem('tokenExpiry', expiryTime.toString());
  }

  getTokenExpiry() {
    const expiry = sessionStorage.getItem('tokenExpiry');
    return expiry ? parseInt(expiry) : null;
  }

  // Extract expiry time from JWT token
  setTokenExpiryFromJWT(token) {
    try {
      if (!token) return;

      // Decode JWT payload (without verification since we just need the expiry)
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.exp) {
        // Convert from seconds to milliseconds
        const expiryTime = payload.exp * 1000;
        this.setTokenExpiry(expiryTime);
      }
    } catch (error) {
      console.error('Failed to extract token expiry:', error);
      // Fallback to current time + 30 minutes if extraction fails
      const fallbackExpiry = Date.now() + 30 * 60 * 1000;
      this.setTokenExpiry(fallbackExpiry);
    }
  }

  isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return token && user && !this.isTokenExpired();
  }
}

export default new ApiService();
