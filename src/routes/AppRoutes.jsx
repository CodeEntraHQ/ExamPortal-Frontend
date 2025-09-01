import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import Admin from '../pages/Admin.jsx';
import Student from '../pages/Student.jsx';
import AboutUs from '../pages/AboutUs.jsx';
import ContactUs from '../pages/ContactUs.jsx';
import Layout from '../components/Layout.jsx';
import { useAuth } from '../hooks/useAuth';

// Protected route component
function ProtectedRoute({ children, allowedRoles, redirectPath = '/login' }) {
  const { user, loading } = useAuth();
  console.log('from routes -> ', user);

  // Show loading state or spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // If roles are specified and user's role is not allowed, redirect
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />
    );
  }

  // If authenticated and authorized, render the children
  return children;
}

// Public route that redirects authenticated users to their role-specific page
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading state or spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (user) {
    return (
      <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />
    );
  }

  // If not authenticated or allowLanding is true, render the children
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute allowLanding={true}>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <Student />
              </ProtectedRoute>
            }
          />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
