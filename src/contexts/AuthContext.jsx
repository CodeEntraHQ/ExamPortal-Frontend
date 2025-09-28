import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../hooks';
import { authService } from '../services';
import { ROLE_MAPPING } from '../utils/constants';
import { tokenManager } from '../utils/tokenManager';
import { useUserActivity } from '../hooks/useUserActivity';
import { TokenRenewalPopup } from '../components/TokenRenewalPopup';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const { addSuccess } = useNotification();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRenewalPopup, setShowRenewalPopup] = useState(false);
  const [popupTimeRemaining, setPopupTimeRemaining] = useState(0);
  const navigate = useNavigate();

  // User activity tracking
  const { isActive, isIdle, forceActive } = useUserActivity();

  // Token management
  const popupTimerRef = useRef(null);

  // Define logout function first
  const logout = useCallback(() => {
    setLoading(true);
    authService.logout();
    setUser(null);
    setShowRenewalPopup(false);
    setLoading(false);
    navigate('/');
  }, [navigate]);

  // Token renewal function
  const renewToken = useCallback(async () => {
    try {
      const response = await authService.renewToken();
      if (response.status === 'SUCCESS') {
        const { token } = response.payload;
        authService.setToken(token);
        setShowRenewalPopup(false);
        console.log('Token renewed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token renewal failed:', error);
      return false;
    }
  }, []);

  // Handle renewal popup actions
  const handleRenewSession = useCallback(async () => {
    const success = await renewToken();
    if (!success) {
      logout();
    }
  }, [renewToken, logout]);

  const handleRenewalPopupLogout = useCallback(() => {
    setShowRenewalPopup(false);
    logout();
  }, [logout]);

  const dismissRenewalPopup = useCallback(() => {
    setShowRenewalPopup(false);
    forceActive(); // Force user back to active state
  }, [forceActive]);

  const processAndSetUser = userData => {
    if (
      userData &&
      userData.profile_picture &&
      userData.profile_picture.type === 'Buffer'
    ) {
      const buffer = new Uint8Array(userData.profile_picture.data);
      const blob = new Blob([buffer], { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.onload = () => {
        const processedUser = {
          ...userData,
          profile_picture: reader.result,
        };
        setUser(processedUser);
        authService.setUser(processedUser);
      };
      reader.readAsDataURL(blob);
    } else {
      setUser(userData);
      if (userData) {
        authService.setUser(userData);
      }
    }
  };

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = () => {
      if (authService.isAuthenticated()) {
        const userData = authService.getUser();
        processAndSetUser(userData);
      } else {
        authService.logout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Activity-based token management
  useEffect(() => {
    if (!user) return;

    const checkTokenStatus = () => {
      const token = authService.getToken();
      if (!token) {
        logout();
        return;
      }

      const tokenConfig = tokenManager.getTokenConfig(token);

      // If token is expired, logout immediately
      if (tokenConfig.isExpired) {
        console.log('Token expired, logging out user');
        logout();
        return;
      }

      // If token should be renewed
      if (tokenConfig.shouldRenew) {
        if (isActive && !showRenewalPopup) {
          // User is active and popup is not shown - auto renew
          console.log('User is active, auto-renewing token');
          renewToken();
        } else if (isIdle && !showRenewalPopup) {
          // User is idle and popup is not shown - show renewal popup
          console.log('User is idle, showing renewal popup');
          setShowRenewalPopup(true);
          setPopupTimeRemaining(tokenConfig.timeUntilExpiry);

          // Set timer for popup auto-logout
          if (popupTimerRef.current) {
            clearTimeout(popupTimerRef.current);
          }
          popupTimerRef.current = setTimeout(() => {
            logout();
          }, tokenConfig.timeUntilExpiry);
        }
        // Note: Once popup is shown (!showRenewalPopup = false), auto-renewal is blocked
        // User must manually choose to renew or logout via the popup
      }
    };

    // Check token status immediately
    checkTokenStatus();

    // Set up periodic checking
    const config = tokenManager.getTokenConfig(authService.getToken());
    const interval = setInterval(
      checkTokenStatus,
      config?.checkInterval || 30000
    );

    return () => {
      clearInterval(interval);
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, [user, isActive, isIdle, showRenewalPopup, logout, renewToken]);

  // Listen for token expiry events from API calls
  useEffect(() => {
    const handleTokenExpiry = () => {
      console.log('Token expired during API call, logging out user');
      logout();
    };

    window.addEventListener('tokenExpired', handleTokenExpiry);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiry);
    };
  }, [logout]);

  const login = async (email, password, captcha, captchaToken) => {
    try {
      setLoading(true);
      const response = await authService.login(
        email,
        password,
        captcha,
        captchaToken
      );

      if (response.status === 'SUCCESS') {
        const { token, user: userData } = response.payload;

        // Store token and user data
        authService.setToken(token); // This will automatically extract and set the correct expiry
        processAndSetUser(userData);

        addSuccess('Login successful!');

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

  const register = async userData => {
    try {
      setLoading(true);
      // const response = await authService.register(userData);
      // For now, we'll simulate a successful registration
      const response = {
        status: 'SUCCESS',
        payload: {
          token: 'fake-token',
          user: { ...userData, id: 'fake-id' },
        },
      };

      if (response.status === 'SUCCESS') {
        const { token, user: newUserData } = response.payload;

        // Store token and user data
        authService.setToken(token);
        authService.setUser(newUserData);

        setUser(newUserData);

        // Navigate based on role
        const rolePath =
          ROLE_MAPPING[newUserData.role] || newUserData.role.toLowerCase();
        navigate(`/dashboard/${rolePath}`);

        return { success: true };
      } else {
        return {
          success: false,
          error: 'Registration failed. Please try again.',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = updatedUser => {
    processAndSetUser(updatedUser);
  };

  const value = {
    user,
    updateUser,
    loading,
    register,
    login,
    logout,
    renewToken,
    isAuthenticated: !!user,
    isActive,
    isIdle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <TokenRenewalPopup
        isVisible={showRenewalPopup}
        timeRemaining={popupTimeRemaining}
        onRenew={handleRenewSession}
        onLogout={handleRenewalPopupLogout}
        onDismiss={dismissRenewalPopup}
      />
    </AuthContext.Provider>
  );
};
