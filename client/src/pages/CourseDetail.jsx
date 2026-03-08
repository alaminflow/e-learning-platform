import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const { user, isEnrolled, checkEnrollment, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (user) {
      if (isEnrolled(id)) {
        setIsUserEnrolled(true);
      } else {
        checkEnrollment(id).then(result => {
          setIsUserEnrolled(result);
        });
      }
    }
  }, [user, id, isEnrolled, checkEnrollment]);

  const checkEnrollmentStatus = async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/courses/${id}/enrollment-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'pending') {
          setEnrollmentStatus('pending');
        } else if (data.status === 'approved') {
          setEnrollmentStatus('approved');
        } else {
          setEnrollmentStatus(null);
        }
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
    }
  };

  useEffect(() => {
    if (user) checkEnrollmentStatus();
  }, [user, id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/courses/${id}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      setEnrollmentStatus('pending');
      refreshUser();
    } else {
      if (data.message === 'Already enrolled') {
        setEnrollmentStatus('approved');
        refreshUser();
      } else {
        alert(data.message);
      }
    }
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-sm sm:text-base">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-sm sm:text-base">Course not found</div>
      </div>
    );
  }

  const enrolled = isUserEnrolled;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 sm:h-64 bg-gray-200 flex items-center justify-center">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl sm:text-8xl text-gray-400">📚</span>
          )}
        </div>
        <div className="p-4 sm:p-8">
          <h1 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{course.description}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-5 sm:mb-6">
            <span className="text-gray-500 text-sm sm:text-base">By {course.createdBy?.name || 'Unknown'}</span>
            <span className="text-xl sm:text-2xl font-bold text-blue-600">
              {course.price === 0 ? 'Free' : `BDT ${course.price}`}
            </span>
          </div>
          
          {!enrolled && !enrollmentStatus && (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-lg hover:bg-blue-700 transition w-full sm:w-auto disabled:opacity-50"
            >
              {enrolling ? 'Sending...' : 'Enroll Now'}
            </button>
          )}

          {enrollmentStatus === 'pending' && (
            <div className=" text-orange-700 bg-orange-100 px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-lg w-full sm:w-auto text-center">
              Requested - Waiting for Approval
            </div>
          )}

          {enrolled && (
            <Link
              to={`/courses/${course._id}/videos/${course.chapters[0]?.videos[0]?._id || ''}`}
              className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-lg hover:bg-green-700 transition inline-block w-full sm:w-auto text-center"
            >
              Start Learning
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Course Content</h2>
        {course.chapters?.length === 0 ? (
          <p className="text-gray-600">No chapters added yet.</p>
        ) : (
          <div className="space-y-4">
            {course.chapters?.map((chapter, chapterIndex) => (
              <div key={chapter._id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                  <h3 className="text-lg font-semibold">
                    Chapter: {chapter.title}
                  </h3>
                </div>

                {chapter.videos?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No videos in this chapter.</p>
                ) : (
                  <div className="space-y-2">
                    {chapter.videos?.map((video, videoIndex) => (
                      <Link
                        key={video._id}
                        to={enrolled ? `/courses/${course._id}/videos/${video._id}` : '#'}
                        className={`flex items-center p-2 sm:p-3 rounded ${enrolled ? 'hover:bg-gray-100' : 'cursor-not-allowed opacity-50'}`}
                        onClick={(e) => !enrolled && e.preventDefault()}
                      >
                        <span className="text-gray-500 mr-2 sm:mr-3 text-sm">{videoIndex + 1}.</span>
                        <span className="text-sm sm:text-base">{video.title}</span>
                        {enrolled && <span className="ml-auto text-blue-600">▶</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
