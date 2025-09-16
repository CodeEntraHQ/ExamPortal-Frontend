import { useAuth } from '../../hooks';
import Card from '../../components/ui/Card';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-secondary-900 dark:text-secondary-50'>
              Admin Dashboard
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
                    d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                Manage Exams
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Create and manage exam schedules
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
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                Manage Students
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              View and manage student accounts
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
                    d='M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                View Results
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Monitor and analyze exam results
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
