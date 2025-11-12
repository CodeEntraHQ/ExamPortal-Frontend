import React, { useState } from 'react';
import { ThemeProvider } from './shared/providers/ThemeProvider';
import { AuthProvider, useAuth } from './features/auth/providers/AuthProvider';
import { NotificationProvider } from './shared/providers/NotificationProvider';
import { LandingPage } from './pages/LandingPage';
import { LoginForm } from './features/auth/components/LoginForm';
import { TopNavigation } from './shared/components/layout/TopNavigation';
import { Footer } from './shared/components/layout/Footer';
import { Dashboard } from './features/dashboard/components/Dashboard';
import { ProfileManagement } from './features/users/components/ProfileManagement';
import { ExamPortal } from './features/exams/components/ExamPortal';
import { ComprehensiveExamFlow } from './features/exams/components/student/ComprehensiveExamFlow';
import { StudentExamResults } from './features/exams/components/student/StudentExamResults';
import { EntityManagement, Entity } from './features/entities/components/EntityManagement';
import { ExamCreationForm } from './features/exams/components/ExamCreationForm';
import { EnhancedExamCreationForm } from './features/exams/components/EnhancedExamCreationForm';
import { RoleAwareExamManagement } from './features/exams/components/RoleAwareExamManagement';
import { EntityListPage } from './features/entities/components/EntityListPage';
import { EntityDetailPage } from './features/entities/components/EntityDetailPage';
import { ExamDetailPage } from './features/exams/components/ExamDetailPage';
import { PasswordReset } from './features/auth/components/PasswordReset';
import { ResetPasswordConfirm } from './features/auth/components/ResetPasswordConfirm';
import { Toaster } from './shared/components/ui/sonner';
import { ExamContextProvider } from './features/exams/providers/ExamContextProvider';

interface NavigationState {
  view: string;
  entity?: Entity;
  examId?: string;
  examName?: string;
  editMode?: boolean;
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [navigationState, setNavigationState] = useState<NavigationState>({ view: 'dashboard' });
  const [showLogin, setShowLogin] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);
  const [activeExam, setActiveExam] = useState<string | null>(null);
  const [showExamCreation, setShowExamCreation] = useState(false);
  const [viewingResults, setViewingResults] = useState<string | null>(null);

  // Check for password reset token in URL (in real app this would be handled by router)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setShowResetPasswordConfirm(true);
    }
  }, []);

  if (!isAuthenticated) {
    if (showResetPasswordConfirm) {
      return (
        <div className="min-h-screen flex flex-col">
          <ResetPasswordConfirm
            onPasswordResetSuccess={() => {
              setShowResetPasswordConfirm(false);
              setResetToken(undefined);
              setShowLogin(true);
            }}
          />
        </div>
      );
    }
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
    if (navigationState.entity) {
      setNavigationState({ view: 'entity-detail', entity: navigationState.entity });
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
          entity: { id: 'user-entity', name: user?.entityName || 'Your Entity' } as Entity
        });
      } else {
        // For SUPERADMIN, show entity list
        setNavigationState({ view: 'entities' });
      }
    } else if (view === 'profile') {
      setNavigationState({ view: 'profile' });
    }
  };

  const handleExploreEntity = (entity: Entity) => {
    setNavigationState({ view: 'entity-detail', entity });
  };

  const handleEditEntity = (entity: Entity) => {
    setNavigationState({ view: 'entity-detail', entity, editMode: true });
  };

  const handleExploreExam = (examId: string, examName: string) => {
    setNavigationState({
      view: 'exam-detail',
      entity: navigationState.entity,
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
      entity: navigationState.entity
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
          currentEntity={navigationState.entity?.id || ''}
        />
      );
    }

    // Handle different views based on navigation state
    switch (navigationState.view) {
      case 'dashboard':
        return (
          <Dashboard
            currentEntity={navigationState.entity?.id}
            onNavigateToAdministration={() => handleNavigationChange('administration')}
            onViewExamDetails={(examId: string, examName: string) => {
              // Navigate to exam details if we have an entity context
              if (navigationState.entity) {
                setNavigationState({
                  view: 'exam-detail',
                  entity: navigationState.entity,
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
          <EntityManagement 
            onBackToDashboard={handleBackToDashboard}
            onViewEntity={handleExploreEntity}
            onEditEntity={handleEditEntity}
          />
        );
      
      case 'entity-detail':
        return (
          <EntityDetailPage
            entity={navigationState.entity!}
            editMode={navigationState.editMode}
            onBackToEntities={handleBackToEntities}
            onBackToDashboard={handleBackToDashboard}
            onExploreExam={handleExploreExam}
            onEditExam={(examId: string, examName: string) => {
              setNavigationState({
                view: 'exam-detail',
                entity: navigationState.entity,
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
            entityId={navigationState.entity?.id!}
            entityName={navigationState.entity?.name!}
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
            currentEntity={navigationState.entity?.id}
            onCreateExam={() => setShowExamCreation(true)}
            onViewExamDetails={(examId: string, examName: string) => {
              setNavigationState({
                view: 'exam-detail',
                entity: navigationState.entity,
                examId,
                examName
              });
            }}
          />
        );
      
      case 'profile':
        return <ProfileManagement />;
      
      default:
        return <Dashboard currentEntity={navigationState.entity?.id} />;
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
          <ExamContextProvider>
          <AppContent />
          <Toaster />
          </ExamContextProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
