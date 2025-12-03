/**
 * Main routing configuration
 * Handles all application routes with role-based access control
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedLayout } from './RoleBasedLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginForm } from '../features/auth/components/LoginForm';
import { PasswordReset } from '../features/auth/components/PasswordReset';
import { ResetPasswordConfirm } from '../features/auth/components/ResetPasswordConfirm';
import { UserRegistration } from '../features/auth/components/UserRegistration';
import { SetPassword } from '../features/auth/components/SetPassword';
import { Footer } from '../shared/components/layout/Footer';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentExamPortal } from '../pages/student/StudentExamPortal';
import { StudentResultsPage } from '../pages/student/StudentResultsPage';
import { StudentExamFlow } from '../pages/student/StudentExamFlow';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminEntityManagement } from '../pages/admin/AdminEntityManagement';

// SuperAdmin Pages
import { SuperAdminDashboard } from '../pages/superadmin/SuperAdminDashboard';
import { SuperAdminEntityManagement } from '../pages/superadmin/SuperAdminEntityManagement';
import { SuperAdminEntityDetail } from '../pages/superadmin/SuperAdminEntityDetail';

// Representative Pages
import { RepresentativeDashboard } from '../pages/representative/RepresentativeDashboard';
import { AdmissionFormViewPage } from '../pages/representative/AdmissionFormViewPage';

// Shared Pages
import { ProfilePage } from '../pages/shared/ProfilePage';
import { ExamDetailPageWrapper } from '../pages/shared/ExamDetailPageWrapper';
import { ExamCreationWrapper } from '../pages/shared/ExamCreationWrapper';
import { QuestionCreationPage } from '../pages/shared/QuestionCreationPage';
import { AdmissionFormBuilderPage } from '../pages/shared/AdmissionFormBuilderPage';
import { NotFoundPage } from '../pages/shared/NotFoundPage';
import { ErrorPage } from '../pages/shared/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: (
      <div className="min-h-screen flex flex-col">
        <ErrorPage />
      </div>
    ),
    children: [
      // Public routes
      {
        path: '/',
        element: (
          <div className="min-h-screen flex flex-col">
            <LandingPage />
            <Footer />
          </div>
        ),
      },
  {
    path: '/login',
    element: (
      <div className="min-h-screen flex flex-col">
        <LoginForm />
      </div>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <div className="min-h-screen flex flex-col">
        <PasswordReset />
      </div>
    ),
  },
  {
    path: '/password-reset',
    element: (
      <div className="min-h-screen flex flex-col">
        <PasswordReset />
      </div>
    ),
  },
  {
    path: '/password-reset/confirm',
    element: (
      <div className="min-h-screen flex flex-col">
        <ResetPasswordConfirm />
      </div>
    ),
  },
  {
    path: '/password-reset/confirm/:token',
    element: (
      <div className="min-h-screen flex flex-col">
        <ResetPasswordConfirm />
      </div>
    ),
  },
  {
    path: '/register',
    element: (
      <div className="min-h-screen flex flex-col">
        <UserRegistration />
      </div>
    ),
  },
  {
    path: '/register/:token',
    element: (
      <div className="min-h-screen flex flex-col">
        <UserRegistration />
      </div>
    ),
  },
  {
    path: '/set-password',
    element: (
      <div className="min-h-screen flex flex-col">
        <SetPassword />
      </div>
    ),
  },

  // Protected routes - Student
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <RoleBasedLayout role="STUDENT" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/student/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <StudentDashboard />,
      },
      {
        path: 'exams',
        element: <StudentExamPortal />,
      },
      {
        path: 'exam/:examId',
        element: <StudentExamFlow />,
      },
      {
        path: 'results/:examId',
        element: <StudentResultsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },

  // Protected routes - Admin
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <RoleBasedLayout role="ADMIN" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/entity" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'entity',
        element: <AdminEntityManagement />,
      },
      {
        path: 'entity/:entityId',
        element: <AdminEntityManagement />,
      },
      {
        path: 'exam/:examId',
        element: <ExamDetailPageWrapper />,
      },
      {
        path: 'exam/create',
        element: <ExamCreationWrapper />,
      },
      {
        path: 'exam/:examId/admission-form',
        element: <AdmissionFormBuilderPage />,
      },
      {
        path: 'exam/:examId/question/create',
        element: <QuestionCreationPage />,
      },
      {
        path: 'exam/:examId/question/:questionId/edit',
        element: <QuestionCreationPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },

  // Protected routes - SuperAdmin
  {
    path: '/superadmin',
    element: (
      <ProtectedRoute allowedRoles={['SUPERADMIN']}>
        <RoleBasedLayout role="SUPERADMIN" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/superadmin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SuperAdminDashboard />,
      },
      {
        path: 'entities',
        element: <SuperAdminEntityManagement />,
      },
      {
        path: 'entities/:entityId',
        element: <SuperAdminEntityDetail />,
      },
      {
        path: 'exam/:examId',
        element: <ExamDetailPageWrapper />,
      },
      {
        path: 'exam/create',
        element: <ExamCreationWrapper />,
      },
      {
        path: 'exam/:examId/admission-form',
        element: <AdmissionFormBuilderPage />,
      },
      {
        path: 'exam/:examId/question/create',
        element: <QuestionCreationPage />,
      },
      {
        path: 'exam/:examId/question/:questionId/edit',
        element: <QuestionCreationPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },

  // Protected routes - Representative
  {
    path: '/representative',
    element: (
      <ProtectedRoute allowedRoles={['REPRESENTATIVE']}>
        <RoleBasedLayout role="REPRESENTATIVE" />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/representative/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <RepresentativeDashboard />,
      },
      {
        path: 'exam/:examId/form',
        element: <AdmissionFormViewPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },

      // Catch all - 404 page for unknown routes
      {
        path: '*',
        element: (
          <div className="min-h-screen flex flex-col">
            <NotFoundPage />
          </div>
        ),
      },
    ],
  },
]);

