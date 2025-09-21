import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ErrorPane from '../ui/notifications/ErrorPane';
import SuccessPane from '../ui/notifications/SuccessPane';
import { useNotification } from '../../contexts/NotificationContext';

export default function Layout({ children }) {
  const { success, error, clearSuccess, clearError } = useNotification();
  const location = useLocation();
  const noHeaderFooterPaths = ['/login', '/register'];
  const showHeaderFooter = !noHeaderFooterPaths.includes(location.pathname);

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-100 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800'>
      {showHeaderFooter && <Header />}
      <main className={showHeaderFooter ? 'pt-16' : ''}>{children}</main>
      {showHeaderFooter && <Footer />}
      <ErrorPane message={error} onClose={clearError} />
      <SuccessPane message={success} onClose={clearSuccess} />
    </div>
  );
}
