/**
 * Admin Dashboard Page
 * Dashboard for admin users (redirects to entity management)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/providers/AuthProvider';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Admin should be redirected to their entity management
    if (user?.role === 'ADMIN') {
      navigate('/admin/entity', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to entity management...</p>
      </div>
    </div>
  );
}

