import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          <Link 
            to="/" 
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
          >
            EduSpace
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              to="/courses" 
              className="text-gray-600 hover:text-violet-600 font-medium transition text-sm sm:text-base"
            >
              Courses
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-600 hover:text-violet-600 font-medium transition text-sm sm:text-base"
                  >
                    Manage
                  </Link>
                )}
                {user.role === 'student' && (
                  <Link 
                    to="/my-courses" 
                    className="text-gray-600 hover:text-violet-600 font-medium transition text-sm sm:text-base"
                  >
                    My Courses
                  </Link>
                )}
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium hidden md:block text-sm sm:text-base">{user.name}</span>
                    <svg className="w-4 h-4 text-gray-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      <Link 
                        to="/change-password" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm"
                        onClick={() => setShowDropdown(false)}
                      >
                        Change Password
                      </Link>
                      <button 
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }} 
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-violet-600 font-medium transition text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all text-sm sm:text-base"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
