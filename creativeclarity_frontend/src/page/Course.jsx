import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Snackbar, 
  Alert, 
  Menu, 
  MenuItem, 
  IconButton,
  Select,
  FormControl,
  InputLabel 
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded'; // Import LeaderboardRoundedIcon
import axios from 'axios';
import SideBar from '../components/Sidebar';
import '../components/css/Course.css';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import {Plus} from 'lucide-react';
import { lineWobble } from 'ldrs'
axios.defaults.baseURL = 'http://localhost:8080'; // Ensure this line is present to set the base URL for axios
function LoadingComponent({loading}){
  useEffect(() => {
    lineWobble.register()
  }, []);
  if(loading){
    return (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <l-line-wobble
            size="80"
            stroke="5"
            bg-opacity="0.1"
            speed="1.75" 
            color="black" 
          ></l-line-wobble>
        </Box>
    )
  }else{
    return null
  }
}
function Course({onLogout}) {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const [courses, setCourses] = useState([]); // Ensure initial state is an empty array
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState({
    courseName: '',
    code: '',
    semester: '',
    academicYear: '',
    user: {userId: currentUser.userId}
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [courseGridVisible, setCourseGridVisible] = useState(true); // New state for course grid visibility
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  // Define semester options
  const semesterOptions = [
    { value: '1st Semester', label: '1st Semester', period:'August-December' },
    { value: '2nd Semester', label: '2nd Semester', period:'January-May' },
    { value: 'Summer', label: 'Summer', period:'June-July' }
  ];
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching courses...');
      const response = await axios.get('/api/course/getcourse/' + currentUser.userId, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      console.log('Courses fetched:', response.data);
      setCourses(Array.isArray(response.data) ? response.data : []); // Ensure response data is an array
      setCourseGridVisible(true); // Ensure course grid is visible after fetching courses
    } catch (error) {
      console.error('Error fetching courses:', error);
      showSnackbar('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Courses';
    console.log("User: ", currentUser.userId);
    fetchCourses();
  }, [fetchCourses, location]);

  const handleOpen = (course = null) => {
    if (course) {
      setSelectedCourse(course);
      setCourseDetails({
        courseName: course.courseName,
        code: course.code,
        semester: course.semester,
        academicYear: course.academicYear,
      });
    } else {
      setSelectedCourse(null);
      setCourseDetails({
        courseName: '',
        code: '',
        semester: '',
        academicYear: '',
        user: null
      });
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedCourse(null);
    setCourseDetails({
      courseName: '',
      code: '',
      semester: '',
      academicYear: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // const { courseName, code, semester, academicYear, user = { userId: currentUser.userId } } = courseDetails;
      // const courseData = { courseName, code, semester, academicYear, user };
      const courseData = {
        courseName: courseDetails.courseName,
        code: courseDetails.code,
        semester: courseDetails.semester,
        academicYear: courseDetails.academicYear,
        user: { userId: currentUser.userId } // Always include the user object
      };

      if (selectedCourse) {
        // Update existing course
        await axios.put(`/api/course/putcoursedetails/${selectedCourse.courseId}`, courseData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        showSnackbar('Course updated successfully');
      } else {
        // Create new course
        console.log(courseData);
        await axios.post('/api/course/postcourserecord', courseData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        showSnackbar('Course created successfully');
      }

      console.log('Fetching courses after course submit');
      await fetchCourses(); // Fetch courses after creating or updating
      handleClose();
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'An unknown error occurred';
      showSnackbar(`Failed to ${selectedCourse ? 'update' : 'create'} course: ${errorMessage}`, 'error');
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) {
      showSnackbar('Invalid course ID', 'error');
      return;
    }
    try {
      await axios.delete(`/api/course/deletecoursedetails/${courseToDelete}`,{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      await fetchCourses();
      showSnackbar('Course deleted successfully');
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      showSnackbar(`Failed to delete course: ${error.response?.data || error.message}`, 'error');
      setDeleteDialogOpen(false);
    }
  };

  const handleMenuClick = (event, course) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditCourse = () => {
    handleOpen(selectedCourse);
    handleMenuClose();
  };

  const handleDeleteConfirmation = () => {
    setCourseToDelete(selectedCourse?.courseId);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // New Function for submitting course to archive - Jeric
  const handleArchiveCourse = () => {
    if (!selectedCourse) {
      showSnackbar('No course selected for archiving', 'error');
      return;
    }

    // Open the archive confirmation dialog
    setArchiveDialogOpen(true);
  };

  // New Function for submitting course to archive - Jeric
  const handleConfirmArchive = async () => {
    if (!selectedCourse) {
      showSnackbar('No course selected for archiving', 'error');
      return;
    }
  
    try {
      const response = await axios.put(`/api/course/archive/${selectedCourse.courseId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        showSnackbar('Course archived successfully');
        setCourses((prevCourses) =>
          prevCourses.filter(course => course.courseId !== selectedCourse.courseId)
        );
      } else {
        showSnackbar('Failed to archive course', 'error');
      }
    } catch (error) {
      showSnackbar('Error archiving course', 'error');
      console.error('Error archiving course:', error);
    }
  
    setArchiveDialogOpen(false); // Close the dialog after archiving
  };
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <SideBar
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        />
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '240px', overflow:'auto' }}>
        <Box>
          <div className="title-container">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-8 w-2 bg-blue-600 rounded-full"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Courses
              </h1>
            </div>
            <div className='flex space-x-2'>
              <button
                  onClick={() => handleOpen()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-5 w-5" />
                <span>Add Course</span>
              </button>
            </div>
            
          </div>
          {loading ? ( <LoadingComponent loading={loading} />) : (
            courseGridVisible && (
              <div className="course-grid">
                {courses.length === 0 ? (
                  <div className="flex items-center p-4">
                    No courses found
                  </div>
                ) : (
                  courses.map((course) => (
                  <div 
                    key={course.courseId}
                    className="course-card" 
                    style={{
                      position: 'relative',
                      height: '150px',
                      padding: '20px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      margin: '8px',
                    }}
                  >
                    {/* Wrap most of the card content in Link, excluding the menu */}
                    <Link
                      to={`/notes`}
                      state={{ course }} // Pass course details as state
                      style={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        display: 'block',
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                    >
                      {/* Course Details */}
                      <div className="course-content">
                        <h3>{course.courseName}</h3>
                        <p>{course.code}</p>
                        <p>{course.semester} - {course.academicYear}</p>
                        <p>{course.subject}</p>
                      </div>
                    </Link>
  
                    {/* Menu Icon outside of Link */}
                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                      <IconButton 
                        onClick={(event) => handleMenuClick(event, course)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </div>
                ))
                )}
              </div>
            )
          )}
          
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEditCourse}>Edit</MenuItem>
          <MenuItem onClick={handleDeleteConfirmation}>Delete</MenuItem>
          <MenuItem onClick={handleArchiveCourse}>Archive</MenuItem>
        </Menu>

        <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
          <DialogContent>
            <TextField 
              name="courseName" 
              label="Course Name" 
              value={courseDetails.courseName} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              required 
            />
            <TextField 
              name="code" 
              label="Course Code" 
              value={courseDetails.code} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              required 
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="semester-label">Semester</InputLabel>
              <Select
                labelId="semester-label"
                name="semester"
                value={courseDetails.semester}
                onChange={handleChange}
                label="Semester"
              >
                {semesterOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Replaced TextField with Select for Academic Year */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="academic-year-label">Academic Year</InputLabel>
              <Select
                labelId="academic-year-label"
                name="academicYear"
                value={courseDetails.academicYear}
                onChange={handleChange}
                label="Academic Year"
              >
                {/* Only two academic year options available */}
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
                <MenuItem value="2026-2027">2026-2027</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              color="primary" 
              variant="contained"
            >
              {selectedCourse ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this course?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteCourse} 
              sx={{ 
                backgroundColor: 'red', 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'darkred',
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Archive Confirmation Dialog */}
        <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
          <DialogTitle>Confirm Archive</DialogTitle>
          <DialogContent>
            Are you sure you want to archive this course?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setArchiveDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmArchive}
              sx={{
                backgroundColor: 'orange',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'darkorange',
                },
              }}
            >
              Archive
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>

  );
}

export default Course;