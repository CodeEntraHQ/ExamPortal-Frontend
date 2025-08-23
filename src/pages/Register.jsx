import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setRegisterError('');
      setRegisterSuccess(false);

      try {
        const response = await authService.register(formData);

        if (response.status === 'SUCCESS') {
          setRegisterSuccess(true);
          // Clear form data
          setFormData({
            name: '',
            email: '',
            password: '',
          });
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/login', { state: { registrationSuccess: true } });
          }, 2000);
        } else {
          setRegisterError(
            response.responseMsg === 'USER_ALREADY_EXISTS'
              ? 'Email is already registered'
              : 'Registration failed. Please try again.',
          );
        }
      } catch (error) {
        console.error('Registration error:', error);
        setRegisterError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg p-1">
        <button
          onClick={() => navigate('/')}
          className="absolute -top-12 left-0 px-4 py-2 text-sm font-semibold text-primary bg-white
            border-2 border-primary
            shadow-[3px_3px_0px_0px] shadow-primary
            transition-all duration-200
            hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px]
            active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          ← Back to Home
        </button>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full gap-6 p-12 border-2 rounded-lg bg-neutral border-primary/20
            transition-all duration-300 ease-in-out
            hover:shadow-[8px_8px_0px_0px_rgba(79,70,229,0.6)]
            transform hover:translate-y-[-2px]"
        >
          <h2
            className="mb-4 text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-primary to-indigo-600 bg-clip-text
            relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-16 after:h-1 after:bg-primary"
          >
            Register
          </h2>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className={`px-5 py-4 border-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.name ? 'border-error' : 'border-gray-300 focus:border-primary'}`}
            />
            {errors.name && <p className="text-sm text-error">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`px-5 py-4 border-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.email ? 'border-error' : 'border-gray-300 focus:border-primary'}`}
            />
            {errors.email && (
              <p className="text-sm text-error">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`px-5 py-4 border-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.password ? 'border-error' : 'border-gray-300 focus:border-primary'}`}
            />
            {errors.password && (
              <p className="text-sm text-error">{errors.password}</p>
            )}
          </div>

          {/* Role dropdown removed as per requirement */}

          {registerError && (
            <div className="p-3 text-sm font-medium text-white bg-error rounded-md">
              {registerError}
            </div>
          )}

          {registerSuccess && (
            <div className="p-3 text-sm font-medium text-white bg-green-600 rounded-md">
              Registration successful! Redirecting to login...
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || registerSuccess}
            className="px-6 py-4 mt-2 text-lg font-semibold text-white bg-primary 
              border-2 border-primary/20
              transition-all duration-300 
              hover:shadow-[6px_6px_0px_0px] hover:shadow-indigo-600
              hover:translate-y-[-2px]
              active:translate-y-[0px] active:shadow-[2px_2px_0px_0px] active:shadow-indigo-600
              disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
          >
            <span className="relative inline-block transition-transform group-hover:translate-x-1">
              {isLoading ? 'Registering...' : 'Register'}
            </span>
          </button>

          <div className="mt-4 text-sm text-center">
            <Link
              to="/login"
              className="relative font-medium text-primary group"
            >
              <span className="relative z-10">Already have an account?</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
