import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth, useNotification } from '../hooks';
import { getCaptcha } from '../services/captchaService';
import { ROLE_MAPPING } from '../utils/constants';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';

export default function Login() {
  const { login, loading, isAuthenticated, user } = useAuth();
  const { addError } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captcha: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const rolePath = ROLE_MAPPING[user.role] || user.role.toLowerCase();
      navigate(`/dashboard/${rolePath}`, { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  const fetchCaptcha = async () => {
    try {
      const { captchaData, captchaToken } = await getCaptcha();
      setCaptchaData(captchaData);
      setCaptchaToken(captchaToken);
    } catch {
      addError('Failed to load captcha. Please refresh the page.');
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
          <p className='mt-4 text-secondary-600 dark:text-secondary-300'>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render login page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(
      formData.email,
      formData.password,
      formData.captcha,
      captchaToken
    );

    if (!result.success) {
      addError(result.error);
    }

    setIsSubmitting(false);
  };
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
                <form className='space-y-8' onSubmit={handleSubmit}>
                  <div className='space-y-3'>
                    <Label htmlFor='email'>Email Address</Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='Enter your email'
                      value={formData.email}
                      onChange={handleChange}
                      required
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
                      name='password'
                      type='password'
                      placeholder='Enter your password'
                      value={formData.password}
                      onChange={handleChange}
                      required
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
                    <Label htmlFor='captcha'>Captcha</Label>
                    <div className='flex items-center space-x-4'>
                      <div className='w-1/2 h-16 bg-gray-200 rounded-lg flex items-center justify-center'>
                        {captchaData ? (
                          <img
                            src={`data:image/svg+xml;base64,${captchaData}`}
                            alt='Captcha'
                            className='h-full w-full object-cover rounded-lg'
                          />
                        ) : (
                          <p className='text-gray-500'>Loading...</p>
                        )}
                      </div>
                      <Input
                        id='captcha'
                        name='captcha'
                        type='text'
                        placeholder='Enter captcha'
                        value={formData.captcha}
                        onChange={handleChange}
                        required
                        className='flex-grow'
                        rightIcon={
                          <button
                            type='button'
                            onClick={fetchCaptcha}
                            className='p-2 rounded-lg text-white hover:text-gray-200 focus:outline-none transition-colors duration-200'
                            aria-label='Refresh captcha'
                            title='Refresh captcha'
                          >
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
                                d='M21 12a9 9 0 11-3.89-7.43M21 4v4h-4'
                              />
                            </svg>
                          </button>
                        }
                      />
                    </div>
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
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
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
