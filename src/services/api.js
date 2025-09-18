const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = sessionStorage.getItem('token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(
          `Server returned non-JSON response: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiry (401 Unauthorized)
        if (response.status === 401) {
          this.logout();
          // Dispatch custom event for token expiry
          window.dispatchEvent(new CustomEvent('tokenExpired'));
          throw new Error('Session expired. Please login again.');
        }

        // Handle backend error format
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

      // Check if backend returned a failure status even with 200 OK
      if (data.status === 'FAILURE') {
        throw new Error(
          data.responseMessage || data.responseCode || 'Request failed'
        );
      }

      return data;
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
