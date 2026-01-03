import React, { createContext, useContext, useState, useEffect } from 'react';
import { BackendExam } from '../../../services/api/exam';
import { useAuth } from '../../auth/providers/AuthProvider';
import { getToken } from '../../../services/api/core';

interface ExamContextType {
  currentExam: BackendExam | null;
  setCurrentExam: (exam: BackendExam | null) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const loadExamFromStorage = (): BackendExam | null => {
  try {
    const storedExam = sessionStorage.getItem('currentExam');
    const token = getToken();
    
    // If no token, clear exam data (token is source of truth)
    if (!token) {
      if (storedExam) {
        sessionStorage.removeItem('currentExam');
      }
      return null;
    }
    
    return storedExam ? JSON.parse(storedExam) : null;
  } catch (error) {
    console.error('Failed to load exam from sessionStorage:', error);
    return null;
  }
};

const saveExamToStorage = (exam: BackendExam | null) => {
  try {
    if (exam) {
      sessionStorage.setItem('currentExam', JSON.stringify(exam));
    } else {
      sessionStorage.removeItem('currentExam');
    }
  } catch (error) {
    console.error('Failed to save exam to sessionStorage:', error);
  }
};

export function ExamContextProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [currentExam, setCurrentExamState] = useState<BackendExam | null>(() => loadExamFromStorage());

  // Clear exam when user logs out or changes
  useEffect(() => {
    const token = getToken();
    if (!isAuthenticated || !token) {
      setCurrentExamState(null);
      saveExamToStorage(null);
    }
  }, [isAuthenticated, user?.id]);

  const setCurrentExam = (exam: BackendExam | null) => {
    setCurrentExamState(exam);
    saveExamToStorage(exam);
  };

  return (
    <ExamContext.Provider value={{
      currentExam,
      setCurrentExam,
    }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExamContext() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExamContext must be used within ExamContextProvider');
  }
  return context;
}

