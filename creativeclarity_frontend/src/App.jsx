import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SuccessPage from './pages/SuccessPage';
import ForgotPage1 from './pages/ForgotPage1';
import ForgotPage2 from './pages/ForgotPage2';
import ForgotSuccess from './pages/ForgotSuccess';
import DashboardPage from './pages/DashboardPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfileSuccessPage from './pages/ProfileSuccessPage';
import Course from './page/Course';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import ErrorPage from './pages/ErrorPage';
import UserProfile from './pages/UserProfile';
import NotesPage from './pages/NotesPage';
import Timer from './pages/Timer';
import CourseDetail from './page/CourseDetail';
import NewStudySession from './pages/NewStudySession';
import { Toaster } from 'sonner';

// Custom 404 component
const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || {
    type: 'Not Found',
    status: 404,
    message: 'The requested page could not be found.'
  };
  useEffect(() => {
    document.title = 'Error 404';
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <img src="/src/assets/images/ff5f832e40cf3ec7787d1c539bf02ce7.gif" alt="404" className="h-48 w-48 mx-auto mb-8" />
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

const App = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already authenticated (e.g., from localStorage)
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Auth handlers
  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Protected Route wrapper component
  const ProtectedRoute = ({ children }) => {
    ProtectedRoute.propTypes = {
      children: PropTypes.node.isRequired,
    };
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Public Route wrapper component (redirects to dashboard if already authenticated)
  const PublicRoute = ({ children }) => {
    PublicRoute.propTypes = {
      children: PropTypes.node.isRequired,
    };
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path=""
            element={
              <PublicRoute>
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              </PublicRoute>
            }
          />

          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              </PublicRoute>
            } 
          />
          
          <Route
            path="/signup"
            element={
              <PublicRoute>
                  <SignupPage onSignupSuccess={handleLoginSuccess} />
                </PublicRoute>
            }
          />

          <Route 
            path="/oauth2/redirect" 
            element={
              <OAuth2RedirectHandler 
              />
            }
          />

          
          <Route 
            path="/success" 
            element={
              <ProtectedRoute>
                <SuccessPage />
              </ProtectedRoute>
              } 
          />

          <Route
            path="/forgot1"
            element={
              <PublicRoute>
                <ForgotPage1 />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot2"
            element={
              <PublicRoute>
                <ForgotPage2 />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-success"
            element={
              <PublicRoute>
                <ForgotSuccess />
              </PublicRoute>
            }
          />

          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetupPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/setup-success"
            element={
              <ProtectedRoute>
                <ProfileSuccessPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfile onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage onLogout={handleLogout}/>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Course onLogout={handleLogout}/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timer"
            element={
              <ProtectedRoute>
                <Timer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/new-study-session"
            element={
              <ProtectedRoute>
                <NewStudySession />
              </ProtectedRoute>
            }
          />
          {/* Root route */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}  // Always redirect to login
          />
          <Route
            path="/course/:courseId/*"
            element={
              <ProtectedRoute>
                <CourseDetail onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          {/* Error route */}
          <Route path="/error" element={<ErrorPage />} />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;