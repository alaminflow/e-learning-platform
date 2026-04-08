import { useState, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = memo(() => {
  const [courses, setCourses] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    const token = localStorage.getItem('token');
    Promise.all([
      fetch('/api/courses/admin/all?page=1&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('/api/courses/enrollments/pending?page=1&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json()),
      fetch('/api/upload/banner').then(r => r.json())
    ])
      .then(([coursesData, enrollmentsData, bannerData]) => {
        setCourses(coursesData.courses || coursesData);
        setPendingCount(enrollmentsData.enrollments?.length || enrollmentsData.length || 0);
        setBanner(bannerData.url || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBannerUploading(true);
    const formData = new FormData();
    formData.append('banner', file);
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/upload/banner', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setBanner(data.url);
        alert('Banner uploaded successfully!');
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    }
    setBannerUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setCourses(courses.filter(c => c._id !== id));
  };

  const togglePublish = async (id, currentStatus) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isPublished: !currentStatus })
    });
    if (res.ok) {
      setCourses(courses.map(c => c._id === id ? { ...c, isPublished: !currentStatus } : c));
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-2">Manage your courses and content</p>
          </div>
          <div className="w-full sm:w-auto flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/admin/enrollments"
              className="flex-1 sm:flex-none relative inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg font-medium text-sm transition duration-200 hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Requests
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link
              to="/admin/users"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg font-medium text-sm transition duration-200 hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Users
            </Link>
            <Link
              to="/admin/courses/new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg text-white px-4 sm:px-6 py-3 sm:py-2.5 rounded-lg font-medium text-sm transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Course
            </Link>
          </div>
        </div>

        {/* Banner Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">Home Page Banner</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Upload New Banner</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={bannerUploading}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer hover:border-violet-400 transition duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                📸 Recommended: 1920x500px<br/>
                Formats: JPG, PNG, WebP
              </p>
              {bannerUploading && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-violet-600 dark:text-violet-400">Uploading...</span>
                </div>
              )}
            </div>

            {/* Preview Area */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Current Banner</label>
              {banner ? (
                <div className="relative rounded-lg overflow-hidden shadow-md group">
                  <img 
                    src={banner} 
                    alt="Banner Preview" 
                    className="w-full h-32 sm:h-40 object-cover group-hover:opacity-80 transition duration-200" 
                  />
                  <button
                    onClick={() => setBanner('')}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="h-32 sm:h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center text-gray-400 sm:text-base text-sm">
                  <div className="text-center">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    No banner uploaded
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Courses Table - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Your Courses ({courses.length})</h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg font-medium mb-4">No courses yet</p>
              <Link
                to="/admin/courses/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Course
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Course Title</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Modules</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Enrolled</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {courses.map(course => (
                      <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{course.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{course.description?.slice(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm font-medium">
                          {course.chapters?.length || 0}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/courses/${course._id}/students`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-sm transition duration-200"
                          >
                            {course.enrolledStudents}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${course.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'}`}>
                            {course.isPublished ? '✓ Published' : '◉ Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <Link
                              to={`/admin/courses/${course._id}/edit`}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition duration-200"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => togglePublish(course._id, course.isPublished)}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 font-medium text-sm transition duration-200"
                            >
                              {course.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              onClick={() => handleDelete(course._id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm transition duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map(course => (
                  <div key={course._id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{course.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{course.description?.slice(0, 80)}...</p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${course.isPublished ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400">Modules</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{course.chapters?.length || 0}</div>
                      </div>
                      <Link
                        to={`/admin/courses/${course._id}/students`}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition duration-200"
                      >
                        <div className="text-xs text-gray-600 dark:text-gray-400">Enrolled</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{course.enrolledStudents}</div>
                      </Link>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/courses/${course._id}/edit`}
                        className="flex-1 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2 rounded-lg font-medium text-xs transition duration-200"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => togglePublish(course._id, course.isPublished)}
                        className="flex-1 text-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 py-2 rounded-lg font-medium text-xs transition duration-200"
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="flex-1 text-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg font-medium text-xs transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

AdminDashboard.displayName = 'AdminDashboard';
export default AdminDashboard;
