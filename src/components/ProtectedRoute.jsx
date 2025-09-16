import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_MAPPING } from '../utils/constants';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
          <p className='mt-4 text-secondary-600 dark:text-secondary-300'>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const rolePath = ROLE_MAPPING[user?.role] || user?.role?.toLowerCase();
    return <Navigate to={`/dashboard/${rolePath}`} replace />;
  }

  return children;
}
