import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { EyeClosed, Eye } from 'lucide-react';

const SignupPage = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errorMessages, setErrorMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      // Check if input contains only numbers
      if (!/^\d*$/.test(value)) {
        setPhoneError('Please enter numbers only');
      } else {
        setPhoneError('');
      }
    }
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessages([]);

    if (!/^\d+$/.test(formData.phoneNumber)) {
      setErrorMessages(['Phone number must contain only numbers']);
      setIsLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessages(['Passwords do not match']);
      setIsLoading(false);
      return;
    }
  
    const requestBody = {
      username: formData.email,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      created_at: new Date()
    };
    
    try {
      const response = await fetch('http://localhost:8080/api/user/postuserrecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody), 
      });

      // Get response text first
      const responseText = await response.text();

      if (!response.ok) {
        // Check for specific SQL error patterns
        if (responseText.includes('Duplicate entry') && responseText.includes('uk_email')) {
          throw new Error('An account with this email already exists.');
        }
        
        // For other SQL errors, provide a generic message
        if (responseText.includes('could not execute statement')) {
          throw new Error('Unable to create account. Please try again later.');
        }

        // For any other errors
        throw new Error(responseText || 'An unexpected error occurred. Please try again.');
      }

      // Try to parse successful response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing response:', e);
        data = {};
      }

      // Handle successful signup
      localStorage.setItem('isAuthenticated', 'true');
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('signupEmail', formData.email);
      localStorage.setItem('signupPassword', formData.password);
      if (onSignupSuccess) {
        onSignupSuccess();
      }
      
      navigate('/success');
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessages([error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-500 placeholder:opacity-60";

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left side with video and logo */}
        <div className="hidden md:flex md:w-1/2 relative bg-gray-100">
          <div className="w-full h-full">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/src/assets/CreativeClarityVideo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="absolute inset-0 flex items-center justify-center" 
                 style={{
                   background: 'linear-gradient(rgba(0, 0, 128, 0.4), rgba(0, 0, 128, 0.6))'
                 }}>
              <img
                src="/src/assets/images/whiteWordsLogo.png"
                alt="Creative Clarity"
                className="w-2/3 max-w-md"
              />
            </div>
          </div>
        </div>

        {/* Right side with signup form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-md">
            <img
              src="/src/assets/images/logoCreativeClarity.png"
              alt="Logo"
              className="h-16 mx-auto mb-3"
            />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Let&apos;s get started!</h2>
              <p className="text-gray-600">Enter necessary details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/src/assets/images/userIcon.png"
                    alt="User"
                    className="h-4 w-4 opacity-60"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className={inputClasses}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/src/assets/images/phoneIcon.png"
                    alt="Phone"
                    className="h-5 w-5 opacity-60"
                  />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className={inputClasses}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/src/assets/images/lockIcon1.png"
                    alt="Password"
                    className="h-5 w-5 opacity-60"
                  />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className={inputClasses}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(prev => !prev)}>
                  
                  {showPassword ? <Eye className="h-4 w-4 opacity-60" /> : <EyeClosed className="h-4 w-4 opacity-60" />}
              
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/src/assets/images/lockIcon2.png"
                    alt="Confirm Password"
                    className="h-5 w-5 opacity-60"
                  />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className={inputClasses}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword(prev => !prev)}>
                  
                  {showConfirmPassword ? <Eye className="h-4 w-4 opacity-60" /> : <EyeClosed className="h-4 w-4 opacity-60" />}
              
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 transition duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>

              {errorMessages.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {errorMessages.map((message, index) => (
                    <p key={index} className="text-sm">{message}</p>
                  ))}
                </div>
              )}
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or Sign Up With:
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50">
                  <img
                    src="/src/assets/images/facebookIcon2.png"
                    alt="Facebook"
                    className="h-7 w-7"
                  />
                </button>
                <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50">
                  <img
                    src="/src/assets/images/github.png"
                    alt="Github"
                    className="h-7 w-7"
                  />
                </button>
                <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50">
                  <img
                    src="/src/assets/images/googleIcon2.png"
                    alt="Google"
                    className="h-7 w-7"
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
SignupPage.propTypes = {
  onSignupSuccess: PropTypes.func
};

export default SignupPage;