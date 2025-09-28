import apiService from './api.js';

class UserService {
  async getUsers() {
    return apiService.request('/v1/users', {
      method: 'GET',
    });
  }

  async getUserById(id) {
    return apiService.request(`/v1/users/${id}`, {
      method: 'GET',
    });
  }

  async updateUser(id, userData) {
    return apiService.request(`/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return apiService.request(`/v1/users/${id}`, {
      method: 'DELETE',
    });
  }

  async inviteUser(userData) {
    return apiService.request('/v1/users/invite', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email) {
    return apiService.request('/v1/users/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return apiService.request('/v1/users/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword }),
    });
  }

  async updateUserProfile(formData) {
    return apiService.request('/v1/users', {
      method: 'PATCH',
      body: formData,
    });
  }
}

export default new UserService();
