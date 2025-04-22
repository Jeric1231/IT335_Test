import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPage1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Sending request to /api/forgot1 with email:', formData.email);
      
      const response = await fetch('http://localhost:8080/api/user/forgot1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email
        })
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.status === 404) {
        throw new Error('Email not found. Please check your email address.');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Email verification failed');
      }
      
      // If we get here, email exists in database
      localStorage.setItem('resetEmail', formData.email);
      navigate('/forgot2');
      
    } catch (error) {
      console.error('Email verification error:', error);
      setErrorMessages([`Error: ${error.message}`]);
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

        {/* Right side with forgot password form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <img
            src="/src/assets/images/logoCreativeClarity.png"
            alt="Logo"
            className="h-24 mx-auto mb-3"
          />
          <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 text-center" style={{ marginTop: '-20px' }}>Forgot Password</h2>
            <p className="text-[0.90rem] text-gray-600 text-center" style={{ marginBottom: '-25px' }}>Enter your email address and we will</p>
            <p className="text-[0.90rem] text-gray-600 text-center" style={{ marginBottom: '50px' }}>send you a link to reset your password</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img
                  src="/src/assets/images/emailIcon.png"
                  alt="Email"
                  className="h-4 w-4 opacity-60"
                />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClasses}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            {errorMessages.length > 0 && (
              <div className="text-red-500">
                {errorMessages.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPage1;