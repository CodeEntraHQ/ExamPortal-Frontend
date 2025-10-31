import React, { createContext, useContext, useState } from 'react';
import { BackendExam } from '../services/api/exam';

interface ExamContextType {
  currentExam: BackendExam | null;
  setCurrentExam: (exam: BackendExam | null) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const loadExamFromStorage = (): BackendExam | null => {
  try {
    const storedExam = localStorage.getItem('currentExam');
    return storedExam ? JSON.parse(storedExam) : null;
  } catch (error) {
    console.error('Failed to load exam from localStorage:', error);
    return null;
  }
};

const saveExamToStorage = (exam: BackendExam | null) => {
  try {
    if (exam) {
      localStorage.setItem('currentExam', JSON.stringify(exam));
    } else {
      localStorage.removeItem('currentExam');
    }
  } catch (error) {
    console.error('Failed to save exam to localStorage:', error);
  }
};

export function ExamContextProvider({ children }: { children: React.ReactNode }) {
  const [currentExam, setCurrentExamState] = useState<BackendExam | null>(() => loadExamFromStorage());

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

