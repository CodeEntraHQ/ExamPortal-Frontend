import apiService from './api.js';

class CollegeService {
  async getColleges() {
    return apiService.request('/v1/colleges', {
      method: 'GET',
    });
  }

  async getCollegeById(id) {
    return apiService.request(`/v1/colleges/${id}`, {
      method: 'GET',
    });
  }

  async createCollege(collegeData) {
    return apiService.request('/v1/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData),
    });
  }

  async updateCollege(id, collegeData) {
    return apiService.request(`/v1/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collegeData),
    });
  }

  async deleteCollege(id) {
    return apiService.request(`/v1/colleges/${id}`, {
      method: 'DELETE',
    });
  }
}

export default new CollegeService();
