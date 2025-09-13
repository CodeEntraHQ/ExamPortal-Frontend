import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function Home() {
  const navigate = useNavigate();

  return (
    <AnimatedBackground className='h-[calc(100vh-4rem)]'>
      {/* Content Container */}
      <div className='w-full'>
        <div className='flex justify-between items-center'>
          {/* Left Column - Main Content */}
          <div className='flex-1 max-w-2xl pl-24'>
            <h1 className='mb-8 text-6xl font-extrabold leading-tight text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text'>
              Welcome to Exam Portal
            </h1>
            <p className='mb-12 text-xl text-secondary-600 dark:text-secondary-300 leading-relaxed'>
              A secure and modern platform for conducting scholarship exams
              online. Simple, reliable, and designed to keep the focus on
              learning.
            </p>
            <div className='w-full'>
              <Button
                onClick={() => navigate('/login')}
                variant='primary'
                color='primary'
                shadowColor='primary'
                className='w-full text-xl py-4'
              >
                Login
              </Button>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className='flex-1 flex justify-end pr-24'>
            <div className='p-12 rounded-3xl bg-white/70 dark:bg-secondary-800/70 backdrop-blur-sm border border-white/40 dark:border-secondary-700/40 shadow-xl'>
              <div className='grid grid-cols-2 gap-12'>
                <div className='text-center'>
                  <div className='text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2'>
                    1000+
                  </div>
                  <div className='text-lg text-secondary-600 dark:text-secondary-400 font-medium'>
                    Students
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2'>
                    50+
                  </div>
                  <div className='text-lg text-secondary-600 dark:text-secondary-400 font-medium'>
                    Colleges
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2'>
                    500+
                  </div>
                  <div className='text-lg text-secondary-600 dark:text-secondary-400 font-medium'>
                    Exams
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2'>
                    99.9%
                  </div>
                  <div className='text-lg text-secondary-600 dark:text-secondary-400 font-medium'>
                    Uptime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
