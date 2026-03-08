import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-violet-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">All Courses</h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive video courses and start learning today
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-10 sm:py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl sm:text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-base sm:text-lg">No courses available yet.</p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Check back soon for new courses!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {courses.map(course => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="h-40 sm:h-52 bg-gray-200 overflow-hidden relative">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
                      <span className="text-5xl sm:text-6xl">📚</span>
                    </div>
                  )}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-violet-600 shadow-sm">
                    {course.price === 0 ? 'Free' : `BDT ${course.price}`}
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h2 className="text-base sm:text-xl font-semibold mb-2 text-gray-800 group-hover:text-violet-600 transition line-clamp-1">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-500">
                      By <span className="font-medium text-gray-700">{course.createdBy?.name || 'Unknown'}</span>
                    </span>
                    <span className="text-violet-600 text-xs sm:text-sm font-medium group-hover:translate-x-1 transition">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
