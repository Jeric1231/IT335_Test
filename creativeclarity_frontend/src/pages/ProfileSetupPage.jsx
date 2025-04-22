import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    institution: '',
    role: '',
    academicLevel: '',
    majorField: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // ProfileSetupPage.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Log the form data being sent
    console.log('Sending form data:', formData);
    
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      const response = await fetch('http://localhost:8080/api/user/setup-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the Authorization header
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to save profile');
      }
  
      const userData = await response.json();
      console.log('Received user data:', userData);
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      navigate('/setup-success');
    } catch (error) {
      console.error('Profile setup error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder:text-gray-500 placeholder:opacity-60";
  const iconClasses = "h-5 w-5 opacity-60";
  
  // Function to get select classes based on individual field's value
  const getSelectClasses = (value) => `w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none ${
    value ? 'text-gray-900' : 'text-gray-400/60'
  }`;

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

        {/* Right side with form */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <img
              src="/src/assets/images/logoCreativeClarity.png"
              alt="Logo"
              className="h-16 mx-auto mb-2 mt-2"
            />

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile Setup</h2>
              <p className="text-gray-600 mt-1 -mb-1">Let&apos;s get to know you better</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="relative col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src="/src/assets/images/firstname.png" alt="User" className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="relative col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src="/src/assets/images/lastname.png" alt="User" className={iconClasses} />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className={inputClasses}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/src/assets/images/mortarboard.png" alt="Institution" className={iconClasses} />
                  </div>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="Institution Name"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/src/assets/images/group.png" alt="Role" className={iconClasses} />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={getSelectClasses(formData.role)}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="researcher">Researcher</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Academic Level */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/src/assets/images/volume.png" alt="Level" className={iconClasses} />
                  </div>
                  <select
                    name="academicLevel"
                    value={formData.academicLevel}
                    onChange={handleInputChange}
                    className={getSelectClasses(formData.academicLevel)}
                    required
                  >
                    <option value="">Select your academic level</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="elementary">Elementary</option>
                    <option value="junior-highschool">Junior Highschool</option>
                    <option value="senior-highschool">Senior Highschool</option>
                    <option value="masters">Masters</option>
                    <option value="doctorate">Doctorate</option>
                    <option value="others">Others</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Major Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/src/assets/images/open-book.png" alt="Major" className={iconClasses} />
                  </div>
                  <select
                    name="majorField"
                    value={formData.majorField}
                    onChange={handleInputChange}
                    className={getSelectClasses(formData.majorField)}
                    required
                  >
                    <option value="">Select your field of study</option>
                    <option value="information-technology">Information Technology</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="business">Business Administration</option>
                    <option value="engineering">Engineering</option>
                    <option value="psychology">Psychology</option>
                    <option value="nursing">Nursing</option>
                    <option value="biology">Biology</option>
                    <option value="education">Education</option>
                    <option value="economics">Economics</option>
                    <option value="communications">Communications</option>
                    <option value="accounting">Accounting</option>
                    <option value="political-science">Political Science</option>
                    <option value="sociology">Sociology</option>
                    <option value="law">Law</option>
                    <option value="arts">Fine Arts</option>
                    <option value="history">History</option>
                    <option value="english">English Literature</option>
                    <option value="medicine">Medicine</option>
                    <option value="environmental-science">Environmental Science</option>
                    <option value="others">Others</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;