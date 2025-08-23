/**
 * Token service for handling JWT token operations
 */
export const tokenService = {
  /**
   * Get the stored access token
   * @returns {string|null} - The access token or null if not found
   */
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Set the access token in storage
   * @param {string} token - The access token to store
   */
  setToken: (token) => {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Remove the access token from storage
   */
  removeToken: () => {
    localStorage.removeItem('auth_token');
  },

  /**
   * Check if the token is expired
   * @param {string} token - The JWT token to check
   * @returns {boolean} - True if token is expired
   */
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      // Validate token format before decoding
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.error('Invalid token format');
        return true;
      }
      
      // Get the payload part of the JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Check if the token has expired
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  /**
   * Decode the JWT token
   * @param {string} token - The JWT token to decode
   * @returns {Object|null} - The decoded token payload or null if invalid
   */
  decodeToken: (token) => {
    if (!token) return null;
    
    try {
      // Validate token format before decoding
      if (!token.includes('.') || token.split('.').length !== 3) {
        console.error('Invalid token format');
        return null;
      }
      
      // Get the payload part of the JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
};