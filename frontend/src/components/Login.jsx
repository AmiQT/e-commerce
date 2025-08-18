import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { buildApiUrl, getEndpoint } from '../config/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const { handleLogin } = useUser();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationErrors({
      ...validationErrors,
      [e.target.name]: null // Clear error when user types
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(formData.email)) {
      errors.email = 'Invalid email format.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(buildApiUrl(getEndpoint('LOGIN')), formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data.user) {
        handleLogin(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-[#ea2a33]">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-[#1b0e0e]">Welcome back to StyleHub</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#994d51]">
            Sign in to your account to continue shopping
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#1b0e0e] mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 sm:px-4 py-3 sm:py-4 text-base border ${validationErrors.email ? 'border-red-500' : 'border-[#f3e7e8]'} placeholder-[#994d51] text-[#1b0e0e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent focus:z-10 bg-white`}
                placeholder="Enter your email"
              />
              {validationErrors.email && <p className="mt-2 text-xs sm:text-sm text-red-500">{validationErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#1b0e0e] mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 sm:px-4 py-3 sm:py-4 text-base border ${validationErrors.password ? 'border-red-500' : 'border-[#f3e7e8]'} placeholder-[#994d51] text-[#1b0e0e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent focus:z-10 bg-white`}
                placeholder="Enter your password"
              />
              {validationErrors.password && <p className="mt-2 text-xs sm:text-sm text-red-500">{validationErrors.password}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 sm:py-4 px-4 border border-transparent text-base sm:text-lg font-medium rounded-lg text-white bg-[#ea2a33] hover:bg-[#d4252e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ea2a33] disabled:bg-[#f3e7e8] disabled:text-[#994d51] disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-[#994d51]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-[#ea2a33] hover:text-[#d4252e] transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
