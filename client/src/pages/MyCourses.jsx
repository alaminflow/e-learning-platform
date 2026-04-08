import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyCourses = memo(() => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setCourses(data.enrolledCourses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Continue learning from where you left off</p>
        </div>
        
        {courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 py-12 sm:py-16 md:py-20 px-6 sm:px-8 text-center">
            <div className="text-5xl sm:text-6xl md:text-7xl mb-4">📚</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">No courses yet</h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Start your learning journey today!
            </p>
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Explore Courses
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {courses.map((course) => (
                <div 
                  key={course._id} 
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 sm:h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 dark:from-violet-900/30 to-indigo-50 dark:to-indigo-900/30">
                        <span className="text-4xl sm:text-5xl">📖</span>
                      </div>
                    )}
                    {/* Progress Badge */}
                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 shadow-lg">
                      {course.progress || 0}%
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition duration-200">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2 flex-1">
                      {course.description}
                    </p>
                    
                    {/* Progress Section */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400">
                          {course.watchedVideos || 0}/{course.totalVideos || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-violet-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {course.watchedVideos || 0} videos watched
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {course.createdBy?.name || 'Unknown'}
                      </span>
                      <Link 
                        to={`/courses/${course._id}`}
                        className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition duration-200 hover:scale-105"
                      >
                        <span>Continue</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Browse More Button */}
            {courses.length > 0 && (
              <div className="text-center mt-10 sm:mt-12">
                <Link 
                  to="/courses" 
                  className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Explore More Courses
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});

MyCourses.displayName = 'MyCourses';
export default MyCourses;
