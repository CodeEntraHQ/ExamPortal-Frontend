import { useAuth } from '../../hooks';
import Card from '../../components/ui/Card';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-secondary-900 dark:text-secondary-50'>
              Student Dashboard
            </h1>
            <p className='mt-2 text-secondary-600 dark:text-secondary-300'>
              Welcome back, {user?.name}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center'>
                <svg
                  className='w-6 h-6'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M9 12h6m-6 4h6m-9 5h12a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414l-4.828-4.828A2 2 0 0 0 13.172 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                My Exams
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              View and take your scheduled exams
            </p>
          </Card>

          <Card>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-lg bg-success-100 text-success-700 flex items-center justify-center'>
                <svg
                  className='w-6 h-6'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                My Results
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Check your exam results and grades
            </p>
          </Card>

          <Card>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-lg bg-info-100 text-info-700 flex items-center justify-center'>
                <svg
                  className='w-6 h-6'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                My Profile
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Manage your profile and settings
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
