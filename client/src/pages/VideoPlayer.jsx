import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VideoPlayer = () => {
  const { courseId, videoId } = useParams();
  const { user, isEnrolled, checkEnrollment } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        for (const chapter of data.chapters || []) {
          const video = chapter.videos?.find(v => v._id === videoId);
          if (video) {
            setCurrentVideo(video);
            setCurrentChapter(chapter);
            break;
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [courseId, videoId]);

  useEffect(() => {
    if (user) {
      if (isEnrolled(courseId)) {
        setEnrolled(true);
      } else {
        checkEnrollment(courseId).then(result => {
          setEnrolled(result);
        });
      }
    }
  }, [user, courseId, isEnrolled, checkEnrollment]);

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

  if (!user || !enrolled) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center">
          <p className="text-base sm:text-xl mb-4">You need to enroll to watch this video.</p>
          <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline text-sm sm:text-base">
            Go to Course Page
          </Link>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="text-center text-sm sm:text-base">Video not found</div>
      </div>
    );
  }

  const getAllVideos = () => {
    const videos = [];
    course.chapters?.forEach(chapter => {
      chapter.videos?.forEach(video => {
        videos.push({ ...video, chapterTitle: chapter.title });
      });
    });
    return videos;
  };

  const allVideos = getAllVideos();
  const currentIndex = allVideos.findIndex(v => v._id === videoId);
  const nextVideo = allVideos[currentIndex + 1];
  const prevVideo = allVideos[currentIndex - 1];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.youtubeId}`}
              title={currentVideo.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="mt-3 sm:mt-4">
            <h1 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">{currentVideo.title}</h1>
            <p className="text-gray-600 text-sm sm:text-base">Chapter: {currentChapter?.title}</p>
          </div>
          
          {currentChapter?.notes && currentChapter.notes.length > 0 && (
            <div className="mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Chapter Notes</h3>
              <div className="space-y-2">
                {currentChapter.notes.map((note, index) => (
                  <a 
                    key={index}
                    href={note.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{note.title || 'Notes ' + (index + 1)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4">
            {prevVideo && (
              <Link
                to={`/courses/${courseId}/videos/${prevVideo._id}`}
                className="bg-gray-200 px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-gray-300"
              >
                ← Previous
              </Link>
            )}
            {nextVideo && (
              <Link
                to={`/courses/${courseId}/videos/${nextVideo._id}`}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-blue-700"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
        
        <div className="lg:w-80">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden w-full bg-gray-100 p-3 rounded-lg mb-3 text-left flex justify-between items-center"
          >
            <span className="font-medium text-sm sm:text-base">Course Content</span>
            <span>{showSidebar ? '▲' : '▼'}</span>
          </button>
          
          <div className={`bg-white rounded-lg shadow-md p-3 sm:p-4 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Course Content</h2>
            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {course.chapters?.map((chapter, chapterIndex) => (
                <div key={chapter._id}>
                  <h3 className="font-medium text-gray-700 py-2 border-b text-sm sm:text-base">
                    Chapter: {chapter.title}
                  </h3>
                  {chapter.videos?.map((video, videoIndex) => (
                    <Link
                      key={video._id}
                      to={`/courses/${courseId}/videos/${video._id}`}
                      className={`flex items-center p-2 rounded text-xs sm:text-sm ${
                        video._id === videoId
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-1 sm:mr-2">{videoIndex + 1}.</span>
                      <span className="flex-1 truncate">{video.title}</span>
                      {video._id === videoId && <span>▶</span>}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
