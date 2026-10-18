import Redis from 'ioredis';

// Redis connection cached on globalThis to survive serverless container reuse
const globalRedis = globalThis._redisCache || (globalThis._redisCache = { client: null });

function getRedisClient() {
  if (globalRedis.client) {
    return globalRedis.client;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      connectTimeout: 4000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: true,
      lazyConnect: false,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 2000);
      }
    });

    client.on('error', (err) => {
      // Non-fatal logging to avoid noise and serverless function crashes
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Redis error:', err.message);
      }
    });

    globalRedis.client = client;
    return client;
  } catch (error) {
    console.warn('⚠️ Redis initialization failed:', error.message);
    return null;
  }
}

const redis = getRedisClient();

// Cache helper functions
export const cache = {
  // Get cached data
  async get(key) {
    const r = getRedisClient();
    if (!r) return null;
    try {
      const data = await r.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  // Set cached data with TTL (in seconds)
  async set(key, data, ttlSeconds = 300) {
    const r = getRedisClient();
    if (!r) return;
    try {
      await r.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      // Silent fail
    }
  },

  // Delete cached data
  async del(key) {
    const r = getRedisClient();
    if (!r) return;
    try {
      await r.del(key);
    } catch (error) {
      // Silent fail
    }
  },

  // Delete keys matching pattern using non-blocking SCAN
  async delByPattern(pattern) {
    const r = getRedisClient();
    if (!r) return;
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await r.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys && keys.length > 0) {
          await r.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      // Silent fail
    }
  },

  // Check if Redis is ready/connecting
  isReady() {
    const r = getRedisClient();
    return !!r && (r.status === 'ready' || r.status === 'connect');
  }
};

export default redis;