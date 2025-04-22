import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom error types for more specific error handling
class OAuth2Error extends Error {
  constructor(message, statusCode, errorDetails) {
    super(message);
    this.name = 'OAuth2Error';
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
  }
}

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthResponse = async () => {
      try {
        setIsLoading(true);
        
        // Add timeout to handle potential network issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

        const response = await fetch('http://localhost:8080/api/user/oauth2/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // More comprehensive error handling
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            // Fallback if response is not JSON
            errorData = {
              error: 'Unknown error occurred',
              statusCode: response.status
            };
          }

          throw new OAuth2Error(
            errorData.error || 'Authentication failed', 
            response.status, 
            errorData
          );
        }

        const data = await response.json();

        // Validate essential data before storing
        if (!data.token || !data.user) {
          throw new OAuth2Error('Invalid authentication response');
        }

        // Secure storage with some basic validation
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Optional profile picture storage with validation
        if (data.user.picture && typeof data.user.picture === 'string') {
          localStorage.setItem('userPicture', data.user.picture);
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        setIsLoading(false);

        // Specific error handling
        if (error instanceof OAuth2Error) {
          console.error('OAuth2 Authentication Error:', {
            message: error.message,
            statusCode: error.statusCode,
            details: error.errorDetails
          });

          // More granular error handling based on status code
          switch (error.statusCode) {
            case 401:
              setError('Authentication failed. Please try logging in again.');
              break;
            case 403:
              setError('Access forbidden. You may not have the required permissions.');
              break;
            case 404:
              setError('Authentication service not found. Please contact support.');
              break;
            default:
              setError(error.message || 'An unexpected error occurred during authentication');
          }
        } else if (error instanceof TypeError) {
          // Network errors or fetch-related issues
          console.error('Network Error:', error);
          setError('Network error. Please check your internet connection.');
        } else {
          console.error('Unexpected OAuth2 redirect error:', error);
          setError('An unexpected error occurred. Please try again.');
        }

        // Redirect to login with error state
        navigate('/login', { 
          state: { 
            error: error instanceof OAuth2Error ? error.message : 'Authentication failed' 
          } 
        });
      }
    };

    handleOAuthResponse();
  }, [navigate]);

  // Enhanced loading and error state rendering
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Logging you in...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Fallback render (should not typically be reached)
  return null;
};

export default OAuth2RedirectHandler;