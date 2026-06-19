import Redis from 'ioredis';

let redis: Redis | null = null;
let connectionAttempted = false;

async function getRedisClient(): Promise<Redis | null> {
  if (redis) return redis;
  if (connectionAttempted) return null;

  if (!process.env.REDIS_URL) {
    connectionAttempted = true;
    console.warn('REDIS_URL is not defined. Caching will be disabled.');
    return null;
  }

  // Skip Redis connection on Vercel build if URL points to localhost
  if (process.env.VERCEL_ENV && process.env.REDIS_URL.includes('localhost')) {
    connectionAttempted = true;
    return null;
  }

  connectionAttempted = true;

  try {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 5000,
      retryStrategy: () => null,
    });

    await redis.connect();
    redis.on('error', () => {});
    return redis;
  } catch {
    redis = null;
    return null;
  }
}

/**
 * Get a value from Redis cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    if (value === null) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Set a value in Redis cache with expiration time
 */
export async function setCache<T>(key: string, value: string | object, ttlSeconds: number = 3600): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;

  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await client.set(key, serializedValue, 'EX', ttlSeconds);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a value from Redis cache
 */
export async function delCache(key: string): Promise<boolean> {
  const client = await getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch {
    return false;
  }
}

export async function isRedisAvailable(): Promise<boolean> {
  const client = await getRedisClient();
  return client !== null;
}

export default { getCache, setCache, delCache, isRedisAvailable };