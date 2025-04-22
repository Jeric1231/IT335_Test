import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ProfileSuccessPage = () => {
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

        {/* Right side with success message */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-md text-center">
            {/* Logo and Check Container */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <img
                src="/src/assets/images/logoCreativeClarity.png"
                alt="Logo"
                className="h-24"
              />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Profile Setup Success!
            </h1>

            <div className="flex justify-center mb-8">
              <CheckCircle 
                className="w-12 h-12 text-green-500 animate-draw-check"
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: 100,
                  animation: 'drawCheck 1.4s ease forwards'
                }}
              />
            </div>

            <p className="text-gray-600 mb-8">
              You have successfully setup your profile.
              <br />
              You can now access all the features of Creative Clarity.
            </p>

            <Link
              to="/dashboard"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSuccessPage;