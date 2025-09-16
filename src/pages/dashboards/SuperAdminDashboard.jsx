import { useAuth } from '../../hooks';
import Card from '../../components/ui/Card';

export default function SuperAdminDashboard() {
  const { user } = useAuth();

  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-secondary-900 dark:text-secondary-50'>
              Super Admin Dashboard
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
                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                Manage Admins
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Create and manage admin accounts
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
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                System Overview
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Monitor system performance and usage
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
                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                  />
                  <path
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-secondary-900 dark:text-secondary-50'>
                System Settings
              </h3>
            </div>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Configure system-wide settings
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
