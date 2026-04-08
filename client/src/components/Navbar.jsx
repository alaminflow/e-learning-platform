import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = memo(() => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = "text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition duration-200 text-sm sm:text-base";
  const mobileNavLinkClass = "block w-full text-left px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition duration-200";

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0 flex items-center group"
          >
            <img 
              src="/logo.png" 
              alt="Bipul's Classroom" 
              className="h-7 sm:h-9 md:h-10 w-auto group-hover:opacity-80 transition"
            />
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-expanded={showMobileMenu}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            <Link 
              to="/courses" 
              className={navLinkClass}
            >
              Courses
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin" 
                      className={navLinkClass}
                    >
                      Manage
                    </Link>
                    <Link 
                      to="/admin/tracking" 
                      className={navLinkClass}
                    >
                      Tracking
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link 
                      to="/my-courses" 
                      className={navLinkClass}
                    >
                      My Courses
                    </Link>
                    <Link 
                      to="/profile" 
                      className={navLinkClass}
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button 
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none ml-2"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                <div className="relative ml-2">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-expanded={showUserDropdown}
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-gray-700 dark:text-gray-300 font-medium">{user.name}</span>
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                      <Link 
                        to="/change-password" 
                        className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm rounded-lg mx-2 hover:text-violet-600 dark:hover:text-violet-400 transition"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Change Password
                      </Link>
                      <button 
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleLogout();
                        }} 
                        className="block w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm rounded-lg mx-2 transition"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link 
                  to="/login" 
                  className={navLinkClass}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <div className="px-4 py-4 space-y-2">
            <Link 
              to="/courses" 
              className={mobileNavLinkClass}
              onClick={() => setShowMobileMenu(false)}
            >
              Courses
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin" 
                      className={mobileNavLinkClass}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Manage
                    </Link>
                    <Link 
                      to="/admin/tracking" 
                      className={mobileNavLinkClass}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Tracking
                    </Link>
                  </>
                )}
                {user.role === 'student' && (
                  <>
                    <Link 
                      to="/my-courses" 
                      className={mobileNavLinkClass}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      My Courses
                    </Link>
                    <Link 
                      to="/profile" 
                      className={mobileNavLinkClass}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Profile
                    </Link>
                  </>
                )}
                <button 
                  onClick={() => {
                    toggleTheme();
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition duration-200"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <hr className="my-2 border-gray-100 dark:border-gray-700" />
                <Link 
                  to="/change-password" 
                  className={mobileNavLinkClass}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Change Password
                </Link>
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }} 
                  className="block w-full text-left px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition duration-200 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={mobileNavLinkClass}
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block w-full text-left px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:shadow-lg transition duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
