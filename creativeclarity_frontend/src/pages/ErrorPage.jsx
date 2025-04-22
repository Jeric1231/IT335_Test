
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || {
    type: 'Not Found',
    status: 404,
    message: 'The requested page could not be found.'
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Error {error.status}</h1>
        <p className="text-gray-600 mb-2">{error.type}</p>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go back home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;