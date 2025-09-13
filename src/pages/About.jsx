import Card from '../components/ui/Card';

export default function About() {
  return (
    <div className='min-h-[calc(100vh-4rem)] p-8 pb-20'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-secondary-900 dark:text-secondary-50 mb-4'>
            About ExamEntra
          </h1>
          <p className='text-lg text-secondary-600 dark:text-secondary-300'>
            A modern platform for scholarship exams
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-primary-600 dark:text-primary-400'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2'>
              Secure
            </h3>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Advanced security measures to ensure exam integrity
            </p>
          </div>

          <div className='text-center'>
            <div className='w-16 h-16 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-success-600 dark:text-success-400'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2'>
              Fast
            </h3>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Lightning-fast performance for seamless exam experience
            </p>
          </div>

          <div className='text-center'>
            <div className='w-16 h-16 bg-info-100 dark:bg-info-900 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-info-600 dark:text-info-400'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <path
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-secondary-900 dark:text-secondary-50 mb-2'>
              Reliable
            </h3>
            <p className='text-secondary-600 dark:text-secondary-300'>
              Built for reliability with 99.9% uptime guarantee
            </p>
          </div>
        </div>

        <Card>
          <h2 className='text-2xl font-bold text-secondary-900 dark:text-secondary-50 mb-4'>
            Our Mission
          </h2>
          <p className='text-secondary-600 dark:text-secondary-300 leading-relaxed'>
            ExamEntra is dedicated to providing a secure, efficient, and
            user-friendly platform for conducting scholarship exams. We believe
            in making education accessible and fair for all students, ensuring
            that the examination process is transparent, reliable, and focused
            on learning outcomes.
          </p>
        </Card>
      </div>
    </div>
  );
}
