import apiService from './api.js';

class EntityService {
  async getEntities(page = 1, limit = 10) {
    try {
      const response = await apiService.request(
        `/v1/entities?page=${page}&limit=${limit}`,
        {
          method: 'GET',
        }
      );

      // Backend returns: { status: "SUCCESS", responseCode: "ENTITIES_FETCHED", payload: { entities, total, page, limit, totalPages } }
      if (response.status === 'SUCCESS' && response.payload) {
        return {
          entities: response.payload.entities || [],
          total: response.payload.total || 0,
          page: response.payload.page || 1,
          limit: response.payload.limit || 10,
          totalPages: response.payload.totalPages || 1,
        };
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching entities:', error);
      throw error;
    }
  }

  async getEntityById(id) {
    try {
      const response = await apiService.request(`/v1/entities/${id}`, {
        method: 'GET',
      });

      if (response.status === 'SUCCESS' && response.payload) {
        return response.payload;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error fetching entity by ID:', error);
      throw error;
    }
  }

  async createEntity(entityData) {
    try {
      const response = await apiService.request('/v1/entities', {
        method: 'POST',
        body: JSON.stringify(entityData),
      });

      if (response.status === 'SUCCESS' && response.payload) {
        return response.payload;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error creating entity:', error);
      throw error;
    }
  }

  async updateEntity(entityData) {
    try {
      const response = await apiService.request('/v1/entities', {
        method: 'PATCH',
        body: JSON.stringify(entityData),
      });

      if (response.status === 'SUCCESS' && response.payload) {
        return response.payload;
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error updating entity:', error);
      throw error;
    }
  }

  async deleteEntity(id) {
    try {
      const response = await apiService.request(`/v1/entities/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 'SUCCESS') {
        return response.payload || { message: 'Entity deleted successfully' };
      }

      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw error;
    }
  }
}

export default new EntityService();
