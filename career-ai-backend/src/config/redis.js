// ============================================
// config/redis.js - Redis Client for Caching (UPDATED - Optional Redis)
// ============================================

import { createClient } from 'redis';
import config from './env.js';
import logger from './logger.js';

let redisClient = null;

// Create Redis client
const createRedisClient = () => {
    const clientOptions = config.redis.url 
        ? { url: config.redis.url }
        : {
            socket: {
                host: config.redis.host,
                port: config.redis.port,
            },
            password: config.redis.password,
            database: config.redis.db,
        };

    const client = createClient(clientOptions);

    // Event handlers
    client.on('connect', () => {
        logger.info('Redis client connecting...');
    });

    client.on('ready', () => {
        logger.info('✅ Redis client connected successfully');
    });

    client.on('error', (err) => {
        logger.error('Redis client error', err.message);
    });

    client.on('end', () => {
        logger.info('Redis client disconnected');
    });

    return client;
};

// Initialize Redis connection (NOW OPTIONAL)
export const connectRedis = async () => {
    try {
        // Check if Redis is enabled in config
        if (config.redis.enabled === false || config.redis.enabled === 'false') {
            logger.warn('⚠️ Redis is disabled in configuration');
            return null;
        }

        redisClient = createRedisClient();
        await redisClient.connect();
        logger.info('✅ Redis connected successfully');
        return redisClient;
    } catch (error) {
        logger.error('❌ Failed to connect to Redis:', error.message);
        logger.warn('⚠️ Redis unavailable - continuing without cache');
        redisClient = null;
        return null;
    }
};

// Get Redis client (NOW RETURNS NULL IF NOT CONNECTED)
export const getRedisClient = () => {
    return redisClient;
};

// Cache helper functions (NOW HANDLE NULL CLIENT GRACEFULLY)
export const cache = {
    /**
     * Set cache with expiration
     */
    set: async (key, value, expirationInSeconds = 3600) => {
        try {
            const client = getRedisClient();
            if (!client) {
                logger.debug('⚠️ Redis not available, skipping cache set', { key });
                return;
            }

            const serializedValue = JSON.stringify(value);
            await client.setEx(key, expirationInSeconds, serializedValue);
            logger.debug('✅ Cache set', { key, expiration: expirationInSeconds });
        } catch (error) {
            logger.error('❌ Cache set failed', { key, error: error.message });
            // Don't throw - gracefully degrade
        }
    },

    /**
     * Get cache
     */
    get: async (key) => {
        try {
            const client = getRedisClient();
            if (!client) {
                logger.debug('⚠️ Redis not available, cache miss', { key });
                return null;
            }

            const cachedValue = await client.get(key);

            if (cachedValue) {
                logger.debug('✅ Cache hit', { key });
                return JSON.parse(cachedValue);
            }

            logger.debug('Cache miss', { key });
            return null;
        } catch (error) {
            logger.error('❌ Cache get failed', { key, error: error.message });
            return null; // Return null on error, don't throw
        }
    },

    /**
     * Delete cache
     */
    del: async (key) => {
        try {
            const client = getRedisClient();
            if (!client) {
                logger.debug('⚠️ Redis not available, skipping cache delete', { key });
                return;
            }

            await client.del(key);
            logger.debug('✅ Cache deleted', { key });
        } catch (error) {
            logger.error('❌ Cache delete failed', { key, error: error.message });
        }
    },

    /**
     * Delete cache by pattern
     */
    delPattern: async (pattern) => {
        try {
            const client = getRedisClient();
            if (!client) {
                logger.debug('⚠️ Redis not available, skipping pattern delete', { pattern });
                return;
            }

            const keys = await client.keys(pattern);

            if (keys.length > 0) {
                await client.del(keys);
                logger.debug('✅ Cache pattern deleted', { pattern, count: keys.length });
            }
        } catch (error) {
            logger.error('❌ Cache pattern delete failed', { pattern, error: error.message });
        }
    },

    /**
     * Check if key exists
     */
    exists: async (key) => {
        try {
            const client = getRedisClient();
            if (!client) {
                return false;
            }

            const exists = await client.exists(key);
            return exists === 1;
        } catch (error) {
            logger.error('❌ Cache exists check failed', { key, error: error.message });
            return false;
        }
    },

    /**
     * Set expiration for existing key
     */
    expire: async (key, seconds) => {
        try {
            const client = getRedisClient();
            if (!client) {
                logger.debug('⚠️ Redis not available, skipping expire', { key });
                return;
            }

            await client.expire(key, seconds);
            logger.debug('✅ Cache expiration set', { key, seconds });
        } catch (error) {
            logger.error('❌ Cache expire failed', { key, error: error.message });
        }
    },
};

// Cache key generators (consistent naming)
export const cacheKeys = {
    user: (userId) => `user:${userId}`,
    userContext: (userId) => `user:${userId}:context`,
    resumeActive: (userId) => `resume:${userId}:active`,
    atsScore: (resumeId) => `ats:${resumeId}:score`,
    skillGap: (userId) => `skills:${userId}:gap`,
    roadmap: (userId) => `roadmap:${userId}:active`,
    dashboard: (userId) => `dashboard:${userId}`,
    conversation: (conversationId) => `chat:${conversationId}`,
    conversations: (userId) => `chat:${userId}:conversations`,
    session: (sessionId) => `session:${sessionId}`,
};

// Close Redis connection
export const closeRedis = async () => {
    if (redisClient) {
        try {
            await redisClient.quit();
            logger.info('✅ Redis connection closed');
        } catch (error) {
            logger.error('❌ Error closing Redis connection:', error.message);
        }
        redisClient = null;
    }
};

export default {
    connectRedis,
    getRedisClient,
    cache,
    cacheKeys,
    closeRedis,
};