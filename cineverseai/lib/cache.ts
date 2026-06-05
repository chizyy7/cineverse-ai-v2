import Redis from 'ioredis';

// Create Redis client
let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  
  redis.on('connect', () => {
    console.log('Connected to Redis');
  });
  
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
} else {
  console.warn('REDIS_URL is not defined. Caching will be disabled.');
}

/**
 * Get a value from Redis cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) {
    return null;
  }
  
  try {
    const value = await redis.get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Set a value in Redis cache with expiration time
 */
export async function setCache<T>(key: string, value: string | object, ttlSeconds: number = 3600): Promise<boolean> {
  if (!redis) {
    return false;
  }
  
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.set(key, serializedValue, 'EX', ttlSeconds);
    return true;
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Delete a value from Redis cache
 */
export async function delCache(key: string): Promise<boolean> {
  if (!redis) {
    return false;
  }
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Error deleting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redis !== null;
}

export default { getCache, setCache, delCache, isRedisAvailable };