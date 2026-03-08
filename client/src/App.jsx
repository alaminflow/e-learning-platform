import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Courses = lazy(() => import('./pages/Courses'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const VideoPlayer = lazy(() => import('./pages/VideoPlayer'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RegisterWithOTP = lazy(() => import('./pages/RegisterWithOTP'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminCourseForm = lazy(() => import('./pages/AdminCourseForm'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const CourseStudents = lazy(() => import('./pages/CourseStudents'));
const PendingEnrollments = lazy(() => import('./pages/PendingEnrollments'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/:courseId/videos/:videoId" element={<VideoPlayer />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-otp" element={<RegisterWithOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses/new" element={<AdminCourseForm />} />
              <Route path="/admin/courses/:id/edit" element={<AdminCourseForm />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/courses/:id/students" element={<CourseStudents />} />
              <Route path="/admin/enrollments" element={<PendingEnrollments />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
