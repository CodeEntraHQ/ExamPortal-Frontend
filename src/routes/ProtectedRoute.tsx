/**
 * Protected Route Component
 * Wraps routes that require authentication and role-based access
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'ADMIN' | 'SUPERADMIN')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const rolePath = {
      STUDENT: '/student/dashboard',
      ADMIN: '/admin/entity',
      SUPERADMIN: '/superadmin/dashboard',
    }[user.role];

    return <Navigate to={rolePath} replace />;
  }

  return <>{children}</>;
}

