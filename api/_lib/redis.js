import Redis from 'ioredis';

// Redis connection - works with or without Redis (graceful fallback)
let redis = null;
let redisEnabled = false;

try {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    redis = new Redis(redisUrl);
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
      redisEnabled = true;
    });
    redis.on('error', (err) => {
      console.log('⚠️ Redis error:', err.message);
      redisEnabled = false;
    });
  } else {
    console.log('⚠️ REDIS_URL not configured - caching disabled');
  }
} catch (error) {
  console.log('⚠️ Redis initialization failed:', error.message);
}

// Cache helper functions
export const cache = {
  // Get cached data
  async get(key) {
    if (!redisEnabled || !redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  // Set cached data with TTL (in seconds)
  async set(key, data, ttlSeconds = 300) {
    if (!redisEnabled || !redis) return;
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      // Silent fail
    }
  },

  // Delete cached data
  async del(key) {
    if (!redisEnabled || !redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      // Silent fail
    }
  },

  // Delete keys matching pattern
  async delByPattern(pattern) {
    if (!redisEnabled || !redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      // Silent fail
    }
  },

  // Check if Redis is available
  isReady() {
    return redisEnabled;
  }
};

export default redis;