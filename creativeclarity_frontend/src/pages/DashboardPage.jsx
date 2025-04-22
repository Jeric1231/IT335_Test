import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, CheckSquare, User, LogOut, FileText, Bell, Clock, X, ChevronRight, ChevronLeft} from 'lucide-react';
import { toast } from 'sonner';
import SideBar from '../components/Sidebar';
import { formatDate } from '../utils/dateUtils';
import axios from 'axios';
import { Toaster } from 'sonner';

const DashboardPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showImageModal, setShowImageModal] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageForCourses, setPageForCourses] = useState(1);
  const itemsPerPage = 3;

  const [activeTab, setActiveTab] = useState('overview');
  const token = localStorage.getItem('token');

  const handleProfileImageUpdate = async (imageUrl) => {
    setIsUpdatingImage(true);
    setImageError('');

    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : {};

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8080/api/user/update-profile?userId=${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...user,
          profilePicture: imageUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }

      const updatedUser = await response.json();
      const finalUserData = {
        ...updatedUser,
        profilePicture: imageUrl || 'http://localhost:8080/uploads/default-profile.png'
      };

      localStorage.setItem('user', JSON.stringify(finalUserData));
      setShowImageModal(false);
    } catch (error) {
      console.error('Profile image update error:', error);
      setImageError(error.message || 'Failed to update profile picture');
    } finally {
      setIsUpdatingImage(false);
  }
  };

  const ImageUploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Update Profile Picture</h3>
          <button
            onClick={() => setShowImageModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {imageError && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {imageError}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleProfileImageUpdate('http://localhost:8080/uploads/default-profile.png')}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isUpdatingImage}
          >
            {isUpdatingImage ? 'Updating...' : 'Upload New Picture'}
          </button>
        </div>
      </div>
    </div>
  );
  

  const currentUser = JSON.parse(localStorage.getItem('user'));


  const getCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await axios.get('/api/course/getcourse/' + currentUser.userId, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      console.log('Courses fetched:', response.data);
      const courseData = Array.isArray(response.data) ? response.data : [];
      console.log(courseData)
      setCourses(courseData);
      console.log('Courses names:', courseData.map(course => course.courseName));
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    }
  }
  useEffect(() => {
    document.title = 'Home';
    console.log('User logged in', localStorage.getItem('token'));
    getCourses();
  }, []);

  const indexOfLastCourse = pageForCourses * itemsPerPage;
  const indexOfFirstCourse = (pageForCourses - 1) * itemsPerPage;
  const currentCourses = courses.length > 0 ? courses.slice(indexOfFirstCourse, indexOfLastCourse) : [];
  const totalPagesForCourses = Math.ceil(courses.length / itemsPerPage);
  // const courses = [
  //   { id: 1, name: 'History 101', progress: 75 },
  //   { id: 2, name: 'Calculus II', progress: 60 },
  //   { id: 3, name: 'Physics 201', progress: 85 }
  // ];

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { firstName: 'Student' };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {showImageModal && <ImageUploadModal />}
      {/* Sidebar */}

      <SideBar 
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab} />

      <Toaster richColors position="bottom-right" closeButton/>
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="h-full p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-600">Here&apos;s your academic overview</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* <button className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow hover:shadow-md transition">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button> */}

              {/* Profile Picture with Redirect to UserProfile */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-2 bg-white p-1 rounded-full shadow hover:shadow-md transition"
                  onClick={() => navigate('/user-profile')}
                >
                  <div className="h-8 w-8 rounded-full overflow-hidden relative">
                    <img 
                      src={user.profilePicture || "/src/assets/images/default-profile.png"} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', e);
                        console.log('Attempted image URL:', user.profilePicture);
                        e.target.src = '/src/assets/images/default-profile.png';
                      }} 
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="pb-6">
            <div className="mb-6 flex justify-between">
              <div className='flex items-center space-x-2'>
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Courses
                </h2>
              </div>
                  
              <div className="flex justify-between items-center ">
                <button
                  onClick={() => setPageForCourses(prev => Math.max(prev - 1, 1))}
                  disabled={pageForCourses <= 1}
                  className="px-1 py-1 text-blue-600 mr-1 rounded-md disabled:opacity-50"
                >
                  <ChevronLeft/>
                </button>
                <span className="text-sm text-gray-600">
                  {courses.length > 0 ? pageForCourses : 0}
                </span>
                <button
                  onClick={() => setPageForCourses(prev => Math.min(prev + 1, totalPages))}
                  disabled={pageForCourses >= totalPagesForCourses}
                  className="px-1 py-1 text-blue-600 ml-1 rounded-md disabled:opacity-50"
                >
                  <ChevronRight/>
                </button>
              </div>
            </div>
            <div className="w-auto bg-white rounded-lg shadow-sm h-full">
              <div className="p-6">
                <div className="space-y-6">
                  {currentCourses.length === 0 ? (
                    <div className="text-gray-600 text-center">
                      <BookOpen className="h-6 w-6 mx-auto" />
                      <p className="text-md font-semibold">No courses available</p>
                      <button className='my-2'>
                        <a href="/courses" className="text-blue-600">Create a new course</a>
                      </button>
                    </div>
                  ): (
                    currentCourses.map(course => (
                      <div key={course.courseId} className="space-y-2">
                        <div 
                          onClick={() => navigate(`/course/${course.courseId}`)}
                          className="flex flex-col justify-between items-start bg-gray-50 p-2 rounded-md">
                          <span className="h-7 font-medium text-gray-900">
                            {course.courseName}
                          </span>
                          <p className="text-sm text-gray-600">
                            {course.code}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button 
                  onClick={() => navigate('/courses')}
                  className="mt-6 w-full py-2 px-4 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition duration-200">
                  View All Courses
                </button>
              </div>
            </div>
          </div>
          
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Course Progress Card */}
            

            {/* Quick Actions Card */}
            <div className="col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 flex flex-col items-center justify-center space-y-2" onClick={() => navigate('/timer')}>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Start Timer</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 flex flex-col items-center justify-center space-y-2" onClick={()=>navigate('/new-study-session')}>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">New Study Session</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 flex flex-col items-center justify-center space-y-2" onClick={()=> navigate('/reminder')}>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Set Reminder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardPage.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default DashboardPage;