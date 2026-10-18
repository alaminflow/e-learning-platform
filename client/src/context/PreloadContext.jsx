import { createContext, useContext, useState, useEffect } from 'react';

const PreloadContext = createContext();

export const usePreload = () => useContext(PreloadContext);

export const PreloadProvider = ({ children }) => {
  const [preloadedCourses, setPreloadedCourses] = useState(null);
  const [preloading, setPreloading] = useState(true);

  const fetchCourses = () => {
    setPreloading(true);
    fetch('/api/courses?page=1&limit=15')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.courses)) {
          setPreloadedCourses(data.courses);
        } else if (Array.isArray(data)) {
          setPreloadedCourses(data);
        } else {
          setPreloadedCourses([]);
        }
      })
      .catch((err) => {
        console.error('Preload fetch error:', err);
        setPreloadedCourses([]);
      })
      .finally(() => setPreloading(false));
  };

  useEffect(() => {
    // Clear any stale localStorage from previous versions
    try {
      localStorage.removeItem('preloadedCourses');
    } catch {}

    fetchCourses();
  }, []);

  // Call this to bust the state cache immediately when needed
  const invalidatePreload = () => {
    fetchCourses();
  };

  return (
    <PreloadContext.Provider value={{ preloadedCourses, preloading, invalidatePreload }}>
      {children}
    </PreloadContext.Provider>
  );
};
