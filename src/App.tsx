import React, { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { NotificationProvider } from './components/NotificationProvider';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { TopNavigation } from './components/TopNavigation';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { ProfileManagement } from './components/ProfileManagement';
import { ExamPortal } from './components/ExamPortal';
import { ComprehensiveExamFlow } from './components/ComprehensiveExamFlow';
import { StudentExamResults } from './components/StudentExamResults';
import { ModernEntityManagement } from './components/ModernEntityManagement';
import { ExamCreationForm } from './components/ExamCreationForm';
import { EnhancedExamCreationForm } from './components/EnhancedExamCreationForm';
import { RoleAwareExamManagement } from './components/RoleAwareExamManagement';
import { EntityListPage } from './components/EntityListPage';
import { EntityDetailPage } from './components/EntityDetailPage';
import { ExamDetailPage } from './components/ExamDetailPage';
import { PasswordReset } from './components/PasswordReset';

interface NavigationState {
  view: string;
  entityId?: string;
  entityName?: string;
  examId?: string;
  examName?: string;
  editMode?: boolean;
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [navigationState, setNavigationState] = useState<NavigationState>({ view: 'dashboard' });
  const [showLogin, setShowLogin] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);
  const [activeExam, setActiveExam] = useState<string | null>(null);
  const [showExamCreation, setShowExamCreation] = useState(false);
  const [viewingResults, setViewingResults] = useState<string | null>(null);

  // Check for password reset token in URL (in real app this would be handled by router)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('reset_token');
    if (token) {
      setResetToken(token);
      setShowPasswordReset(true);
    }
  }, []);

  if (!isAuthenticated) {
    // Show password reset page if reset token is present
    if (showPasswordReset) {
      return (
        <div className="min-h-screen flex flex-col">
          <PasswordReset 
            onBackToLogin={() => {
              setShowPasswordReset(false);
              setResetToken(undefined);
              setShowLogin(true);
            }}
            resetToken={resetToken}
          />
        </div>
      );
    }
    
    if (showLogin) {
      return (
        <div className="min-h-screen flex flex-col">
          <LoginForm onBackToHome={() => setShowLogin(false)} />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col">
        <LandingPage onLoginClick={() => setShowLogin(true)} />
        <Footer />
      </div>
    );
  }

  const handleExamSave = (examData: any) => {
    // Here you would typically save to your backend
    console.log('Saving exam:', examData);
    setShowExamCreation(false);
    // Navigate back to appropriate view
    if (navigationState.entityId) {
      setNavigationState({ view: 'entity-detail', entityId: navigationState.entityId, entityName: navigationState.entityName });
    } else {
      setNavigationState({ view: 'dashboard' });
    }
  };

  const handleNavigationChange = (view: string) => {
    if (view === 'dashboard') {
      setNavigationState({ view: 'dashboard' });
    } else if (view === 'administration') {
      // For ADMIN role, skip entity selection and go directly to their entity
      if (user?.role === 'ADMIN') {
        setNavigationState({ 
          view: 'entity-detail', 
          entityId: 'user-entity', 
          entityName: user?.entityName || 'Your Entity' 
        });
      } else {
        // For SUPERADMIN, show entity list
        setNavigationState({ view: 'entities' });
      }
    } else if (view === 'profile') {
      setNavigationState({ view: 'profile' });
    }
  };

  const handleExploreEntity = (entityId: string, entityName: string) => {
    setNavigationState({ view: 'entity-detail', entityId, entityName });
  };

  const handleEditEntity = (entityId: string, entityName: string) => {
    setNavigationState({ view: 'entity-detail', entityId, entityName, editMode: true });
  };

  const handleExploreExam = (examId: string, examName: string) => {
    setNavigationState({ 
      view: 'exam-detail', 
      entityId: navigationState.entityId,
      entityName: navigationState.entityName,
      examId, 
      examName 
    });
  };

  const handleBackToDashboard = () => {
    setNavigationState({ view: 'dashboard' });
  };

  const handleBackToEntities = () => {
    setNavigationState({ view: 'entities' });
  };

  const handleBackToEntity = () => {
    setNavigationState({ 
      view: 'entity-detail', 
      entityId: navigationState.entityId, 
      entityName: navigationState.entityName 
    });
  };

  const renderContent = () => {
    // If student is taking an exam, show the comprehensive exam flow
    if (activeExam) {
      return (
        <ComprehensiveExamFlow 
          examId={activeExam} 
          onComplete={() => setActiveExam(null)}
          onCancel={() => setActiveExam(null)}
        />
      );
    }

    // If viewing exam results
    if (viewingResults) {
      return (
        <StudentExamResults 
          examId={viewingResults}
          onBack={() => setViewingResults(null)}
        />
      );
    }

    // If creating an exam
    if (showExamCreation) {
      return (
        <EnhancedExamCreationForm
          onSave={handleExamSave}
          onCancel={() => setShowExamCreation(false)}
          currentEntity={navigationState.entityId || ''}
        />
      );
    }

    // Handle different views based on navigation state
    switch (navigationState.view) {
      case 'dashboard':
        return (
          <Dashboard 
            currentEntity={navigationState.entityId} 
            onNavigateToAdministration={() => handleNavigationChange('administration')}
            onViewExamDetails={(examId: string, examName: string) => {
              // Navigate to exam details if we have an entity context
              if (navigationState.entityId) {
                setNavigationState({
                  view: 'exam-detail',
                  entityId: navigationState.entityId,
                  entityName: navigationState.entityName,
                  examId,
                  examName
                });
              } else {
                // For SUPERADMIN without entity context, go to administration
                handleNavigationChange('administration');
              }
            }}
            onStartExam={(examId: string) => {
              setActiveExam(examId);
            }}
            onViewResults={(examId: string) => {
              setViewingResults(examId);
            }}
          />
        );
      
      case 'entities':
        return (
          <ModernEntityManagement 
            onBackToDashboard={handleBackToDashboard}
            onViewEntity={handleExploreEntity}
            onEditEntity={handleEditEntity}
          />
        );
      
      case 'entity-detail':
        return (
          <EntityDetailPage 
            entityId={navigationState.entityId!}
            entityName={navigationState.entityName!}
            editMode={navigationState.editMode}
            onBackToEntities={handleBackToEntities}
            onBackToDashboard={handleBackToDashboard}
            onExploreExam={handleExploreExam}
            onEditExam={(examId: string, examName: string) => {
              setNavigationState({
                view: 'exam-detail',
                entityId: navigationState.entityId,
                entityName: navigationState.entityName,
                examId,
                examName,
                editMode: true
              });
            }}
          />
        );
      
      case 'exam-detail':
        return (
          <ExamDetailPage 
            examId={navigationState.examId!}
            examName={navigationState.examName!}
            entityId={navigationState.entityId!}
            entityName={navigationState.entityName!}
            editMode={navigationState.editMode}
            onBackToEntity={handleBackToEntity}
            onBackToEntities={handleBackToEntities}
            onBackToDashboard={handleBackToDashboard}
          />
        );
      
      case 'my-exams':
        return <ExamPortal />;
      
      case 'exam-management':
        return (
          <RoleAwareExamManagement
            currentEntity={navigationState.entityId}
            onCreateExam={() => setShowExamCreation(true)}
            onViewExamDetails={(examId: string, examName: string) => {
              setNavigationState({
                view: 'exam-detail',
                entityId: navigationState.entityId,
                entityName: navigationState.entityName,
                examId,
                examName
              });
            }}
          />
        );
      
      case 'profile':
        return <ProfileManagement />;
      
      default:
        return <Dashboard currentEntity={navigationState.entityId} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation 
        currentView={navigationState.view} 
        setCurrentView={handleNavigationChange}
      />
      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}