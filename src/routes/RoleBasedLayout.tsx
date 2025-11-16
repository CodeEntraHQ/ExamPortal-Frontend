/**
 * Role-Based Layout Component
 * Provides layout wrapper with navigation for authenticated users
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TopNavigation } from '../shared/components/layout/TopNavigation';
import { Footer } from '../shared/components/layout/Footer';
import { useAuth } from '../features/auth/providers/AuthProvider';
import { useEffect } from 'react';

interface RoleBasedLayoutProps {
  role: 'STUDENT' | 'ADMIN' | 'SUPERADMIN' | 'REPRESENTATIVE';
}

export function RoleBasedLayout({ role }: RoleBasedLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verify user role matches layout role
  useEffect(() => {
    if (user && user.role !== role) {
      // Redirect to correct role-based route
      const rolePath = {
        STUDENT: '/student/dashboard',
        ADMIN: '/admin/entity',
        SUPERADMIN: '/superadmin/dashboard',
        REPRESENTATIVE: '/representative/dashboard',
      }[user.role];

      navigate(rolePath, { replace: true });
    }
  }, [user, role, navigate]);

  const handleNavigationChange = (view: string) => {
    const rolePrefix = {
      STUDENT: '/student',
      ADMIN: '/admin',
      SUPERADMIN: '/superadmin',
      REPRESENTATIVE: '/representative',
    }[role];

    switch (view) {
      case 'dashboard':
        navigate(`${rolePrefix}/dashboard`);
        break;
      case 'administration':
        if (role === 'ADMIN') {
          navigate(`${rolePrefix}/entity`);
        } else if (role === 'SUPERADMIN') {
          navigate(`${rolePrefix}/entities`);
        }
        break;
      case 'profile':
        navigate(`${rolePrefix}/profile`);
        break;
      case 'my-exams':
        if (role === 'STUDENT') {
          navigate(`${rolePrefix}/exams`);
        }
        break;
      default:
        break;
    }
  };

  // Calculate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const items: Array<{ label: string; onClick?: () => void; isActive?: boolean }> = [];
    const pathParts = location.pathname.split('/').filter(Boolean);

    if (pathParts.length > 1) {
      items.push({
        label: 'Dashboard',
        onClick: () => navigate(`/${pathParts[0]}/dashboard`),
      });

      if (pathParts[1] === 'entities' || pathParts[1] === 'entity') {
        items.push({
          label: 'Administration',
          onClick: () => navigate(`/${pathParts[0]}/${pathParts[1] === 'entities' ? 'entities' : 'entity'}`),
        });

        if (pathParts[2]) {
          items.push({ label: 'Entity Details', isActive: true });
        } else {
          items[items.length - 1].isActive = true;
        }
      } else if (pathParts[1] === 'exam') {
        items.push({ label: 'Exam Details', isActive: true });
      } else if (pathParts[1] === 'profile') {
        items.push({ label: 'Profile', isActive: true });
      } else if (pathParts[1] === 'exams') {
        items.push({ label: 'My Exams', isActive: true });
      } else if (pathParts[1] === 'results') {
        items.push({ label: 'Exam Results', isActive: true });
      }
    }

    return items;
  };

  const getBackHandler = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Must have at least role prefix
    if (pathParts.length === 0) {
      return undefined;
    }
    
    const rolePrefix = pathParts[0]; // 'admin', 'superadmin', 'student', or 'representative'
    
    // Validate role prefix to prevent navigation to invalid routes
    if (!['admin', 'superadmin', 'student', 'representative'].includes(rolePrefix)) {
      return undefined;
    }
    
    // Handle routes with 3+ parts (e.g., /superadmin/entities/:entityId, /admin/exam/:examId)
    if (pathParts.length > 2) {
      // If we're on an entity detail page, go back to entity list
      if (pathParts[1] === 'entities' || pathParts[1] === 'entity') {
        if (rolePrefix === 'admin') {
          return () => navigate('/admin/entity', { replace: false });
        } else if (rolePrefix === 'superadmin') {
          return () => navigate('/superadmin/entities', { replace: false });
        }
      }
      // If we're on an exam detail page, go back to the entity or dashboard
      if (pathParts[1] === 'exam') {
        // Try to get entity from location state, otherwise go to dashboard
        const state = (location.state as any);
        if (state?.entityId) {
          if (rolePrefix === 'admin') {
            return () => navigate('/admin/entity', { replace: false });
          } else if (rolePrefix === 'superadmin') {
            return () => navigate(`/superadmin/entities/${state.entityId}`, { replace: false });
          }
        }
        // Fallback to dashboard
        return () => navigate(`/${rolePrefix}/dashboard`, { replace: false });
      }
      // For other nested routes (like /student/exam/:examId), go back one level
      return () => navigate(`/${pathParts[0]}/${pathParts[1]}`, { replace: false });
    }
    
    // Handle routes with 2 parts (e.g., /admin/entity, /superadmin/entities, /student/exams)
    if (pathParts.length === 2) {
      // If we're on entity management, go to dashboard
      if (pathParts[1] === 'entity' || pathParts[1] === 'entities') {
        return () => navigate(`/${rolePrefix}/dashboard`, { replace: false });
      }
      // For other pages (exams, profile, etc.), go to dashboard
      if (pathParts[1] !== 'dashboard') {
        return () => navigate(`/${rolePrefix}/dashboard`, { replace: false });
      }
    }
    
    // No back button for dashboard or root pages
    return undefined;
  };

  // Get current view from pathname
  const getCurrentView = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      return pathParts[1];
    }
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavigation
        currentView={getCurrentView()}
        setCurrentView={handleNavigationChange}
        breadcrumbItems={getBreadcrumbItems()}
        onBack={getBackHandler()}
      />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

