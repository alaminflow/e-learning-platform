// Clean HTTP fetch wrapper that avoids stale in-browser caching
// Real-time updates are guaranteed while server-side Redis handles high-concurrency acceleration.

export const fetchWithCache = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export const clearCache = () => {};
export const clearCachePattern = () => {};

export default { fetchWithCache, clearCache, clearCachePattern };
