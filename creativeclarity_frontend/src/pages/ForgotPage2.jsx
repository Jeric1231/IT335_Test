import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPage2 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errorMessages, setErrorMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get email from localStorage that was stored in ForgotPage1
    const resetEmail = localStorage.getItem('resetEmail');
    if (!resetEmail) {
      // If no email is found, redirect back to forgot1
      navigate('/forgot1');
      return;
    }
    setFormData(prev => ({ ...prev, email: resetEmail }));
  }, [navigate]);

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
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessages(['Passwords do not match']);
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      setErrorMessages(['Password must be at least 6 characters long']);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/user/forgot2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      // Clear the stored email
      localStorage.removeItem('resetEmail');
      
      // If successful, redirect to success page
      navigate('/forgot-success');
    } catch (error) {
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

        {/* Right side with new password form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          <img
            src="/src/assets/images/logoCreativeClarity.png"
            alt="Logo"
            className="h-24 mx-auto mb-3"
          />
          <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 text-center" style={{ marginTop: '-20px' }}>Reset Password</h2>
            <p className="text-[0.90rem] text-gray-600 text-center" style={{ marginBottom: '30px' }}>Enter your new password below</p>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ marginTop: '20px' }}>
                <img
                  src="/src/assets/images/lockIcon1.png"
                  alt="Password"
                  className="h-4 w-4 opacity-60"
                />
              </div>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                style={{ marginTop: '20px' }}
                className={inputClasses}
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ marginTop: '-10px' }}>
                <img
                  src="/src/assets/images/lockIcon2.png"
                  alt="Password"
                  className="h-4 w-4 opacity-60"
                />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={inputClasses}
                style={{ marginTop: '-10px' }}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>

            {errorMessages.length > 0 && (
              <div className="text-red-500 text-center">
                {errorMessages.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ marginTop: '34px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
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

export default ForgotPage2;