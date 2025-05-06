import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Snackbar, Alert, Tabs, Tab, Box, Typography } from '@mui/material';
import axios from 'axios'; // Import axios
import CourseArchive from './CourseArchive';

axios.defaults.baseURL = 'http://localhost:8080'; // Set the base URL for axios
axios.defaults.withCredentials = true; // Enable cross-origin requests with credentials

function CourseDetail({ onLogout }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const token = localStorage.getItem('token');
  const validTabs = ['archive', 'grades', 'gallery'];
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tabFromPath = location.pathname.split('/').pop();
  const [activeTab, setActiveTab] = useState(validTabs.includes(tabFromPath) ? tabFromPath : 'grades');
  const [grades, setGrades] = useState(() => {
    const savedGrades = localStorage.getItem(`grades_${courseId}`);
    return savedGrades ? JSON.parse(savedGrades) : [];
  });

  // Retrieve course details from location state
  const course = location.state?.course;

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(`/course/${courseId}/${newValue}`, { state: { course, grades } }); // Pass course and grades details as state
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`/api/grade/getallgradesbycourse/${courseId}`,
        {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      })
      if (response.status !== 200) {
        showSnackbar('Failed to load grades.', 'error');
        return;
      }

      const grades = response.data;
      console.log('Grades details:', grades);
      setGrades(grades); // Update grades state
      localStorage.setItem(`grades_${courseId}`, JSON.stringify(grades)); // Save grades to local storage
    } catch (error) {
      console.error('Error fetching grades:', error);
      showSnackbar('An error occurred while loading grades.', 'error');
    }
  };

  const handleGradesChange = async () => {
    await fetchGrades();
  };

  useEffect(() => {
    if (course) {
      setCourseName(course.courseName);
      setCourseCode(course.code);
    } else {
      const fetchCourseDetails = async () => {
        try {
          const response = await axios.get(`/api/course/${courseId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.status !== 200) {
            showSnackbar('Failed to load course details.', 'error');
            return;
          }

          const course = response.data;
          console.log('Course details:', course);
          setCourseName(course.courseName);
          setCourseCode(course.code);
        } catch (error) {
          console.error('Error fetching course details:', error);
          showSnackbar('An error occurred while loading course details.', 'error');
        }
      };

      fetchCourseDetails();
    }
  }, [courseId, course]);

  useEffect(() => {
    if (activeTab === 'grades') {
      fetchGrades();
    }
  }, [activeTab, courseId]);

  useEffect(() => {
    if (activeTab === 'grades') {
      const savedGrades = localStorage.getItem(`grades_${courseId}`);
      if (savedGrades) {
        setGrades(JSON.parse(savedGrades)); // Load grades from local storage
      } else {
        fetchGrades(); // Fetch grades if not found in local storage
      }
    }
  }, [activeTab, courseId]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <Sidebar onLogout={onLogout} activeTab="courses" setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {courseName || 'Loading Course Name...'}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {courseCode || 'Loading Course Code...'}
          </Typography>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ marginTop: '10px' }}
          >
            {/* <Tab value="notes" label="Notes" /> */}
            <Tab value="grades" label="Grades" />
            <Tab value="archive" label="Archive" />
            <Tab value="gallery" label="Gallery" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box mt={1.5}>
          {activeTab === 'archive' && <CourseArchive courseId={course.courseId} />}
          {activeTab === 'grades' && (
            <Box sx={{ marginLeft: '-250px' }}>
              <Grades onLogout={onLogout} onGradesChange={handleGradesChange} />
            </Box>
          )}
          {activeTab === 'gallery' && <Gallery courseId={course.courseId}/>}
        </Box>
      </main>

      {/* Snackbar (Toast) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CourseDetail;
