import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExamSessionContextType {
  isExamActive: boolean;
  isFullscreen: boolean;
  setExamActive: (active: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
}

const ExamSessionContext = createContext<ExamSessionContextType | undefined>(undefined);

export function ExamSessionProvider({ children }: { children: ReactNode }) {
  const [isExamActive, setIsExamActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const setExamActive = (active: boolean) => {
    setIsExamActive(active);
    // If exam is no longer active, also reset fullscreen
    if (!active) {
      setIsFullscreen(false);
    }
  };

  const setFullscreen = (fullscreen: boolean) => {
    setIsFullscreen(fullscreen);
  };

  return (
    <ExamSessionContext.Provider value={{
      isExamActive,
      isFullscreen,
      setExamActive,
      setFullscreen,
    }}>
      {children}
    </ExamSessionContext.Provider>
  );
}

export function useExamSession() {
  const context = useContext(ExamSessionContext);
  if (!context) {
    throw new Error('useExamSession must be used within ExamSessionProvider');
  }
  return context;
}

