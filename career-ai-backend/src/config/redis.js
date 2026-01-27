// ============================================
// config/redis.js - Redis Client for Caching
// ============================================

import { createClient } from 'redis';
import config from './env.js';
import logger from './logger.js';

let redisClient = null;

// Create Redis client
const createRedisClient = () => {
    const client = createClient({
        socket: {
            host: config.redis.host,
            port: config.redis.port,
        },
        password: config.redis.password,
        database: config.redis.db,
    });

    // Event handlers
    client.on('connect', () => {
        logger.info('Redis client connecting...');
    });

    client.on('ready', () => {
        logger.info('Redis client connected successfully');
    });

    client.on('error', (err) => {
        logger.error('Redis client error', err);
    });

    client.on('end', () => {
        logger.info('Redis client disconnected');
    });

    return client;
};

// Initialize Redis connection
export const connectRedis = async () => {
    try {
        redisClient = createRedisClient();
        await redisClient.connect();
        return redisClient;
    } catch (error) {
        logger.error('Failed to connect to Redis', error);
        throw error;
    }
};

// Get Redis client
export const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized. Call connectRedis first.');
    }
    return redisClient;
};

// Cache helper functions
export const cache = {
    /**
     * Set cache with expiration
     */
    set: async (key, value, expirationInSeconds = 3600) => {
        try {
            const client = getRedisClient();
            const serializedValue = JSON.stringify(value);
            await client.setEx(key, expirationInSeconds, serializedValue);
            logger.debug('Cache set', { key, expiration: expirationInSeconds });
        } catch (error) {
            logger.error('Cache set failed', { key, error: error.message });
            throw error;
        }
    },

    /**
     * Get cache
     */
    get: async (key) => {
        try {
            const client = getRedisClient();
            const cachedValue = await client.get(key);

            if (cachedValue) {
                logger.debug('Cache hit', { key });
                return JSON.parse(cachedValue);
            }

            logger.debug('Cache miss', { key });
            return null;
        } catch (error) {
            logger.error('Cache get failed', { key, error: error.message });
            return null; // Return null on error, don't throw
        }
    },

    /**
     * Delete cache
     */
    del: async (key) => {
        try {
            const client = getRedisClient();
            await client.del(key);
            logger.debug('Cache deleted', { key });
        } catch (error) {
            logger.error('Cache delete failed', { key, error: error.message });
        }
    },

    /**
     * Delete cache by pattern
     */
    delPattern: async (pattern) => {
        try {
            const client = getRedisClient();
            const keys = await client.keys(pattern);

            if (keys.length > 0) {
                await client.del(keys);
                logger.debug('Cache pattern deleted', { pattern, count: keys.length });
            }
        } catch (error) {
            logger.error('Cache pattern delete failed', { pattern, error: error.message });
        }
    },

    /**
     * Check if key exists
     */
    exists: async (key) => {
        try {
            const client = getRedisClient();
            const exists = await client.exists(key);
            return exists === 1;
        } catch (error) {
            logger.error('Cache exists check failed', { key, error: error.message });
            return false;
        }
    },

    /**
     * Set expiration for existing key
     */
    expire: async (key, seconds) => {
        try {
            const client = getRedisClient();
            await client.expire(key, seconds);
            logger.debug('Cache expiration set', { key, seconds });
        } catch (error) {
            logger.error('Cache expire failed', { key, error: error.message });
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
    session: (sessionId) => `session:${sessionId}`,
};

// Close Redis connection
export const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        logger.info('Redis connection closed');
    }
};

export default {
    connectRedis,
    getRedisClient,
    cache,
    cacheKeys,
    closeRedis,
};