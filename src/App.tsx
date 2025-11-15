/**
 * Main App Component
 * Now uses React Router for navigation
 */

import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './shared/providers/ThemeProvider';
import { AuthProvider } from './features/auth/providers/AuthProvider';
import { NotificationProvider } from './shared/providers/NotificationProvider';
import { ExamContextProvider } from './features/exams/providers/ExamContextProvider';
import { Toaster } from './shared/components/ui/sonner';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ExamContextProvider>
            <RouterProvider router={router} />
            <Toaster />
          </ExamContextProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
