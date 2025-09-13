import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';

export default function Login() {
  return (
    <AnimatedBackground className='min-h-[calc(100vh-4rem)]'>
      <div className='min-h-[calc(100vh-4rem)] py-8 pb-20'>
        <div className='w-full px-4'>
          <div className='flex justify-center items-center min-h-[calc(100vh-8rem)]'>
            {/* Login Container - Takes 50% of screen width */}
            <div className='w-1/2 min-w-[600px] max-w-4xl'>
              {/* Sign In Header */}
              <div className='mb-8'>
                <h3 className='mb-2 text-4xl font-bold text-primary-600 dark:text-primary-400'>
                  Sign In
                </h3>
                <p className='text-lg text-secondary-600 dark:text-secondary-300'>
                  Enter your credentials to continue
                </p>
              </div>

              {/* Form Box - Large and spacious */}
              <Card className='p-12 border-2 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-secondary-800/90 border-primary-200 dark:border-secondary-700/40'>
                <form className='space-y-8'>
                  <div className='space-y-3'>
                    <Label htmlFor='email'>Email Address</Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='Enter your email'
                      rightIcon={
                        <svg
                          className='w-6 h-6 text-secondary-400'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                        >
                          <path
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M3 8l7.89 4.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z'
                          />
                        </svg>
                      }
                    />
                  </div>

                  <div className='space-y-3'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='Enter your password'
                      rightIcon={
                        <svg
                          className='w-6 h-6 text-secondary-400'
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
                      }
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        className='w-5 h-5 bg-white border-2 rounded text-primary-600 dark:bg-secondary-700 border-primary-200 dark:border-secondary-600 focus:ring-primary-500 dark:focus:ring-primary-600 focus:ring-2'
                      />
                      <span className='ml-3 text-base text-secondary-600 dark:text-secondary-400'>
                        Remember me
                      </span>
                    </label>
                    <a
                      href='#'
                      className='text-base font-medium transition-colors text-primary-600 hover:text-primary-500'
                    >
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type='submit'
                    variant='primary'
                    color='primary'
                    shadowColor='primary'
                    className='w-full py-4 text-xl'
                  >
                    Sign In
                  </Button>
                </form>

                <div className='mt-8 text-center'>
                  <p className='text-base text-secondary-500 dark:text-secondary-400'>
                    Need help?{' '}
                    <Link
                      to='/contact'
                      className='font-medium transition-colors text-primary-600 hover:text-primary-500'
                    >
                      Contact Support
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
}
