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

// Shared Pages
import { ProfilePage } from '../pages/shared/ProfilePage';
import { ExamDetailPageWrapper } from '../pages/shared/ExamDetailPageWrapper';
import { ExamCreationWrapper } from '../pages/shared/ExamCreationWrapper';
import { AdmissionFormBuilderPage } from '../pages/shared/AdmissionFormBuilderPage';

export const router = createBrowserRouter([
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
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },

  // Catch all - redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

