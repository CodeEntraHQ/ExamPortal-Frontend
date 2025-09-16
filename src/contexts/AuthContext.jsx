import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { ROLE_MAPPING } from '../utils/constants';
import { AuthContext } from './AuthContext';

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
      const response = await authService.login(email, password);

      if (response.status === 'SUCCESS') {
        const { token, user: userData } = response.payload;

        // Store token and user data
        authService.setToken(token);
        authService.setUser(userData);

        // Calculate token expiry (5 minutes from now - matching backend)
        const expiryTime = Date.now() + 5 * 60 * 1000;
        authService.setTokenExpiry(expiryTime);

        setUser(userData);

        // Navigate based on role
        const rolePath =
          ROLE_MAPPING[userData.role] || userData.role.toLowerCase();
        navigate(`/dashboard/${rolePath}`);

        return { success: true };
      } else {
        return {
          success: false,
          error: 'Login failed. Please try again.',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    authService.logout();
    setUser(null);
    setLoading(false);
    navigate('/');
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
