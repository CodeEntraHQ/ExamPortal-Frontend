import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

const ErrorContext = createContext();

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const addError = useCallback(message => {
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <ErrorContext.Provider value={{ error, addError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};
