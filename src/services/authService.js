import { api } from './api';
import { tokenService } from './tokenService';

// Mock user data for testing
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN'
  },
  {
    id: '2',
    name: 'Student User',
    email: 'student@example.com',
    password: 'student123',
    role: 'STUDENT'
  }
];

// eslint-disable-next-line no-unused-vars
const mockAuthApi = {
  /**
   * Mock login implementation
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} - Response with token and user data
   */
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = MOCK_USERS.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (user) {
      // Generate a mock JWT token
      const token = `mock_jwt_token_${user.id}_${Date.now()}`;
      
      return {
        status: 'SUCCESS',
        responseMsg: 'LOGIN_SUCCESSFUL',
        payload: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      };
    } else {
      return {
        status: 'FAILURE',
        responseMsg: 'AUTHENTICATION_FAILED'
      };
    }
  },
  
  /**
   * Mock register implementation
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Response with user ID and role
   */
  register: async (userData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      return {
        status: 'FAILURE',
        responseMsg: 'USER_ALREADY_EXISTS'
      };
    }
    
    // Create new user
    const newUser = {
      id: `${MOCK_USERS.length + 1}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'STUDENT' // Only students can register
    };
    
    // Add to mock database
    MOCK_USERS.push(newUser);
    
    return {
      status: 'SUCCESS',
      responseMsg: 'STUDENT_REGISTERED',
      payload: {
        id: newUser.id,
        role: newUser.role
      }
    };
  }
};

/**
 * Authentication service
 */
export const authService = {
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} - Response with token and user data
   */
  login: async (credentials) => {
    try {
      // Use real API for both development and production
      return await api.post('/v1/users/login', credentials);
    } catch (error) {
      console.error('Login failed:', error);
      return {
        status: 'FAILURE',
        responseMsg: 'INTERNAL_SERVER_ERROR'
      };
    }
  },
  
  /**
   * Register user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Response with user ID and role
   */
  register: async (userData) => {
    try {
      // Use real API for both development and production
      return await api.post('/v1/users/register', userData);
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        status: 'FAILURE',
        responseMsg: 'INTERNAL_SERVER_ERROR'
      };
    }
  },
  
  /**
   * Logout user
   */
  logout: () => {
    tokenService.removeToken();
    localStorage.removeItem('user_data');
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    const token = tokenService.getToken();
    return !!token && !tokenService.isTokenExpired(token);
  },
  
  /**
   * Get current user data
   * @returns {Object|null} - User data or null if not authenticated
   */
  getCurrentUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
  
  /**
   * Set authentication data
   * @param {string} token - JWT token
   * @param {Object} user - User data
   */
  setAuthData: (token, user) => {
    tokenService.setToken(token);
    localStorage.setItem('user_data', JSON.stringify(user));
  }
};