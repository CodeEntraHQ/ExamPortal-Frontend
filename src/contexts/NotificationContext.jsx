import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const addSuccess = useCallback(message => {
    setSuccess(message);
    setError(null);
  }, []);

  const addError = useCallback(message => {
    setError(message);
    setSuccess(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <NotificationContext.Provider
      value={{ success, error, addSuccess, addError, clearSuccess, clearError }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
