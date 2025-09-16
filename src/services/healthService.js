import apiService from './api.js';

class HealthService {
  async checkHealth() {
    return apiService.request('/v1/checks/health', {
      method: 'GET',
    });
  }

  async checkDatabaseHealth() {
    return apiService.request('/v1/checks/db', {
      method: 'GET',
    });
  }
}

export default new HealthService();
