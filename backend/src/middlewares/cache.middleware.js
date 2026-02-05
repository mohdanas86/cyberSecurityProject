import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Simple in-memory cache middleware
 * For production, consider using Redis or Memcached
 */
const memoryCache = new Map();

export const cache = (duration = 300000) => {
  // Default 5 minutes
  return asyncHandler(async (req, res, next) => {
    const key = req.originalUrl;

    const cachedResponse = memoryCache.get(key);

    if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
      return res.json(cachedResponse.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      memoryCache.set(key, {
        data,
        timestamp: Date.now(),
      });
      return originalJson(data);
    };

    next();
  });
};

// Clear cache utility
export const clearCache = (pattern = null) => {
  if (pattern) {
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
  } else {
    memoryCache.clear();
  }
};
