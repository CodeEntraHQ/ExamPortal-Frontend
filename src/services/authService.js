import apiService from './api.js';

class AuthService {
  async login(email, password) {
    return apiService.request('/v1/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async renewToken() {
    return apiService.request('/v1/users/renew', {
      method: 'POST',
    });
  }

  async logout() {
    apiService.logout();
  }

  // Token management
  setToken(token) {
    apiService.setToken(token);
  }

  getToken() {
    return apiService.getToken();
  }

  setUser(user) {
    apiService.setUser(user);
  }

  getUser() {
    return apiService.getUser();
  }

  setTokenExpiry(expiryTime) {
    apiService.setTokenExpiry(expiryTime);
  }

  getTokenExpiry() {
    return apiService.getTokenExpiry();
  }

  isTokenExpired() {
    return apiService.isTokenExpired();
  }

  isAuthenticated() {
    return apiService.isAuthenticated();
  }
}

export default new AuthService();
