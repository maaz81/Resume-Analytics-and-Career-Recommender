// ============================================
// src/app.js - Express Application Setup
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/env.js';
import logger from './config/logger.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/v1/auth.routes.js';
import resumeRoutes from './routes/v1/resume.routes.js';
import skillsRoutes from './routes/v1/skills.routes.js';
import atsRoutes from './routes/v1/ats.routes.js';
import roadmapRoutes from './routes/v1/roadmap.routes.js';
import aiRoutes from './routes/v1/ai.routes.js';
import profileRoutes from './routes/v1/profile.route.js'

// Import Oauth
import passport from './config/passport.js'

// Create Express app
const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - security headers
app.use(helmet());

// CORS
app.use(
    cors({
        origin: config.cors.origin,
        credentials: config.cors.credentials,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// PASSPORT & OAUTH
// ============================================

app.use(passport.initialize());

// ============================================
// COMPRESSION & LOGGING
// ============================================

// Compress responses
app.use(compression());

// HTTP request logging (development)
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    // Production: log to Winston
    app.use(
        morgan('combined', {
            stream: {
                write: (message) => logger.info(message.trim()),
            },
        })
    );
}

// ============================================
// HEALTH CHECK & INFO
// ============================================

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.env,
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Career AI Platform API',
        version: config.apiVersion,
        documentation: '/api/v1/docs',
    });
});

// ============================================
// API ROUTES
// ============================================

const API_PREFIX = `/api/${config.apiVersion}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/resumes`, resumeRoutes);
app.use(`${API_PREFIX}/skills`, skillsRoutes);
app.use(`${API_PREFIX}/ats`, atsRoutes);
app.use(`${API_PREFIX}/roadmaps`, roadmapRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/profile`, profileRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection', err);
    // In production, you might want to exit gracefully
    if (config.env === 'production') {
        process.exit(1);
    }
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', err);
    process.exit(1);
});

export default app;