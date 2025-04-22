import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { EyeClosed, Eye } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };
  const handleGithubLogin = async () => {
    try {
        // Redirect to GitHub OAuth2 authorization endpoint
        window.location.href = 'http://localhost:8080/oauth2/authorization/github';
    } catch (error) {
        console.error('GitHub login error:', error);
    }
  };
  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
  };
  useEffect(() => {
    document.title = 'Creative Clarity | Login';
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessages([]);

    try {
      const response = await fetch('http://localhost:8080/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // This is important to tell the server what content type we accept
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success case
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }

        const storedToken = localStorage.getItem('token');
        console.log('Stored token:', storedToken);
        
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessages([error.message || 'Invalid email or password']);
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

        {/* Right side with login form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-md">
            <img
              src="/src/assets/images/logoCreativeClarity.png"
              alt="Logo"
              className="h-24 mx-auto mb-3"
            />

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600">Enter your login details.</p>
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
                  type="text"
                  name="email"
                  value={formData.email}
                  autoComplete='email'
                  onChange={handleInputChange}
                  placeholder="Email/Phone Number"
                  className={inputClasses}
                  style={{
                    '::placeholder': {
                      color: 'rgb(156, 163, 175)',
                      opacity: '0.8'
                    }
                  }}
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src="/src/assets/images/lockIcon2.png"
                    alt="Password"
                    className="h-4 w-4 opacity-60"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete='current-password'
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className={inputClasses}
                  style={{
                    '::placeholder': {
                      color: 'rgb(156, 163, 175)',
                      opacity: '0.8'
                    }
                  }}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(prev => !prev)}>
                  
                  {showPassword ? <Eye className="h-4 w-4 opacity-60" /> : <EyeClosed className="h-4 w-4 opacity-60" />}
              
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot1"
                  className="text-sm text-blue-600 hover:text-blue-500 transition duration-200"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 transition duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
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
                    Or Login With:
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
              <button 
                onClick={handleFacebookLogin}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
              >
                <img
                  src="/src/assets/images/facebookIcon2.png"
                  alt="Facebook"
                  className="h-7 w-7"
                />
              </button>
                <button 
                  onClick={handleGithubLogin}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
                >
                  <img
                    src="/src/assets/images/github.png"
                    alt="Github"
                    className="h-7 w-7"
                  />
                </button>
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
                >
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
                to="/signup"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Don&apos;t have an account? Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
LoginPage.propTypes = {
  onLoginSuccess: PropTypes.func,
};

export default LoginPage;