import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { ROLE_MAPPING } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getUser();
        setUser(userData);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Starting login process...');
      const response = await authService.login(email, password);
      console.log('Login response:', response);

      if (response.status === 'SUCCESS') {
        const { token, user: userData } = response.payload;
        console.log('Login successful, user data:', userData);

        // Store token and user data
        authService.setToken(token);
        authService.setUser(userData);

        // Calculate token expiry (5 minutes from now - matching backend)
        const expiryTime = Date.now() + 5 * 60 * 1000;
        authService.setTokenExpiry(expiryTime);

        // Log token received with expiry time
        const expiryDate = new Date(expiryTime);
        console.log('🎫 Token received:', {
          token: `${token.substring(0, 20)}...`,
          expiryTime,
          expiryDate: expiryDate.toLocaleString(),
          expiresIn: '5 minutes',
        });

        setUser(userData);

        // Navigate based on role
        const rolePath =
          ROLE_MAPPING[userData.role] || userData.role.toLowerCase();
        console.log('Navigating to:', `/dashboard/${rolePath}`);
        navigate(`/dashboard/${rolePath}`);

        return { success: true };
      } else {
        console.error(
          'Login failed - unexpected response status:',
          response.status
        );
        return {
          success: false,
          error: 'Login failed. Please try again.',
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
