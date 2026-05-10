import { Link } from 'react-router-dom';
import { Home, BookOpen, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        {/* 404 Animation/Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[150px] sm:text-[180px] font-bold text-slate-200 dark:text-slate-800 leading-none select-none">
              404
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-violet-500" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-semibold transition-all duration-200"
          >
            <BookOpen className="w-5 h-5" />
            Browse Courses
          </Link>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;