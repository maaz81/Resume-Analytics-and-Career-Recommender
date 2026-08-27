import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    // Server
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    apiVersion: process.env.API_VERSION || 'v1',

    // Database
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        name: process.env.DB_NAME || 'career_ai_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        ssl: process.env.DB_SSL === 'true',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // ✅ 2000 → 10000
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expire: process.env.JWT_EXPIRE || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
    },

    // Redis
    redis: {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
        retryStrategy: (times) => Math.min(times * 50, 2000),
        enabled: process.env.REDIS_ENABLED !== 'false',
    },

    // File Upload
    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || '.pdf,.doc,.docx').split(','),
    },

    // AI Services
    ai: {
        parserUrl: process.env.AI_PARSER_URL || 'http://localhost:8001',
        atsUrl: process.env.AI_ATS_URL || 'http://localhost:8002',
        skillsUrl: process.env.AI_SKILLS_URL || 'http://localhost:8003',
        chatUrl: process.env.AI_CHAT_URL || 'http://localhost:8004',
        timeout: parseInt(process.env.AI_TIMEOUT, 10) || 30000,
    },

    // OAuth
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
    },

    // YouTube Data API
    youtube: {
        apiKey: process.env.YOUTUBE_API_KEY || '',
    },

    // CORS — always an array so allowedOrigins.includes() works correctly in app.js
    cors: {
        origin: (
            process.env.FRONTEND_URL
                ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
                : ['http://localhost:5173']
        ),
        credentials: true,
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) * 60 * 1000 || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log',
    },

    // Feature Flags
    features: {
        atsScoring: true,
        skillGapAnalysis: true,
        roadmapGeneration: true,
        aiAssistant: true,
    },

    email: {
        resendApiKey: process.env.RESEND_API_KEY,
        from: process.env.EMAIL_FROM,
    },

};

// Validation
const requiredEnvVars = ['JWT_SECRET'];

if (config.env === 'production') {
    requiredEnvVars.push('DB_PASSWORD', 'JWT_REFRESH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET');
}

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export default config;