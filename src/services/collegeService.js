import apiService from './api.js';

class CollegeService {
  async getColleges(page = 1, limit = 10) {
    try {
      const response = await apiService.request(
        `/v1/colleges?page=${page}&limit=${limit}`,
        {
          method: 'GET',
        }
      );

      // Backend returns: { status: "SUCCESS", responseCode: "COLLEGES_FETCHED", payload: { colleges, total, page, limit, totalPages } }
      if (response.status === 'SUCCESS' && response.payload) {
        return {
          colleges: response.payload.colleges || [],
          total: response.payload.total || 0,
          page: response.payload.page || 1,
          limit: response.payload.limit || 10,
          totalPages: response.payload.totalPages || 1,
        };
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }
  }

  async getCollegeById(id) {
    try {
      const response = await apiService.request(`/v1/colleges/${id}`, {
        method: 'GET',
      });

      if (response.status === 'SUCCESS' && response.payload) {
        return response.payload;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching college by ID:', error);
      throw error;
    }
  }

  async createCollege(collegeData) {
    try {
      const response = await apiService.request('/v1/colleges', {
        method: 'POST',
        body: JSON.stringify(collegeData),
      });

      if (response.status === 'SUCCESS' && response.payload) {
        return response.payload;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error creating college:', error);
      throw error;
    }
  }

  async updateCollege(collegeId, collegeData) {
    try {
      const response = await apiService.request('/v1/colleges', {
        method: 'PATCH',
        body: JSON.stringify({
          college_id: collegeId,
          ...collegeData,
        }),
      });

      if (response.status === 'SUCCESS' && response.payload) {
        return response.payload;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error updating college:', error);
      throw error;
    }
  }

  async deleteCollege(id) {
    try {
      const response = await apiService.request(`/v1/colleges/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 'SUCCESS') {
        return response.payload || { message: 'College deleted successfully' };
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error deleting college:', error);
      throw error;
    }
  }
}

export default new CollegeService();
