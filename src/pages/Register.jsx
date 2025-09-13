import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function Register() {
  return (
    <AnimatedBackground className='min-h-[calc(100vh-4rem)]'>
      <div className='min-h-[calc(100vh-4rem)] py-8 pb-20'>
        <div className='w-full px-4'>
          <div className='flex justify-center items-center min-h-[calc(100vh-8rem)]'>
            <div className='w-1/2 min-w-[600px] max-w-4xl'>
              {/* Register Header */}
              <div className='mb-8'>
                <h3 className='mb-2 text-4xl font-bold text-secondary-900 dark:text-secondary-50'>
                  Create Account
                </h3>
                <p className='text-lg text-secondary-600 dark:text-secondary-300'>
                  Join ExamEntra today
                </p>
              </div>

              {/* Form Box */}
              <Card className='p-12 border-2 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-secondary-800/90 border-primary-200 dark:border-secondary-700/40'>
                <form className='space-y-8'>
                  <div className='space-y-3'>
                    <Label htmlFor='fullName' required>
                      Full Name
                    </Label>
                    <Input
                      id='fullName'
                      type='text'
                      placeholder='Enter your full name'
                    />
                  </div>

                  <div className='space-y-3'>
                    <Label htmlFor='email' required>
                      Email Address
                    </Label>
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
                    <Label htmlFor='password' required>
                      Password
                    </Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='Create a password'
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

                  <div className='space-y-3'>
                    <Label htmlFor='role' required>
                      Role
                    </Label>
                    <select
                      id='role'
                      className='block w-full rounded-lg border-2 border-primary-200 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:ring-offset-0 transition-all duration-200 py-4 px-6 text-lg'
                    >
                      <option value=''>Select your role</option>
                      <option value='student'>Student</option>
                      <option value='admin'>Admin</option>
                      <option value='superadmin'>SuperAdmin</option>
                    </select>
                  </div>

                  <Button
                    type='submit'
                    variant='primary'
                    color='primary'
                    shadowColor='primary'
                    className='w-full py-4 text-xl'
                  >
                    Create Account
                  </Button>
                </form>

                <div className='mt-8 text-center'>
                  <p className='text-base text-secondary-500 dark:text-secondary-400'>
                    Already have an account?{' '}
                    <Link
                      to='/login'
                      className='font-medium transition-colors text-primary-600 hover:text-primary-500'
                    >
                      Sign in here
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
