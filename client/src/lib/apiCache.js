const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchWithCache = async (url, options = {}, cacheKey = null) => {
  const key = cacheKey || url;
  const cached = apiCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  apiCache.set(key, { data, timestamp: Date.now() });
  
  return data;
};

export const clearCache = (key = null) => {
  if (key) {
    apiCache.delete(key);
  } else {
    apiCache.clear();
  }
};

export default { fetchWithCache, clearCache };
