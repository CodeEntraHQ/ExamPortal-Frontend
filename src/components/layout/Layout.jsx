import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-100 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800'>
      <Header />
      <main className='pt-16'>{children}</main>
      <Footer />
    </div>
  );
}
