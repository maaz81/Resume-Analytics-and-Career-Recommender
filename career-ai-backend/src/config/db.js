// ============================================
// config/db.js - PostgreSQL Connection Pool
// ============================================

import pg from 'pg';
import config from './env.js';
import logger from './logger.js';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: config.database.max,
    idleTimeoutMillis: config.database.idleTimeoutMillis,
    connectionTimeoutMillis: config.database.connectionTimeoutMillis,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
});

// Connection event handlers
pool.on('connect', () => {
    logger.info('New PostgreSQL client connected');
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

// Test connection
export const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        logger.info('PostgreSQL connected successfully', { time: result.rows[0].now });
        return true;
    } catch (error) {
        logger.error('Failed to connect to PostgreSQL', error);
        throw error;
    }
};

// Query helper with logging
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        logger.debug('Executed query', {
            text: text.substring(0, 100), // Log first 100 chars
            duration,
            rows: result.rowCount,
        });

        return result;
    } catch (error) {
        logger.error('Query execution failed', {
            text: text.substring(0, 100),
            error: error.message,
        });
        throw error;
    }
};

// Transaction helper
export const transaction = async (callback) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get a client from pool (for complex operations)
export const getClient = async () => {
    return await pool.connect();
};

// Close pool
export const closePool = async () => {
    await pool.end();
    logger.info('PostgreSQL pool closed');
};

// Named export so services can do: import { pool } from '../config/db.js'
export { pool };

export default {
    query,
    transaction,
    getClient,
    testConnection,
    closePool,
    pool,
};