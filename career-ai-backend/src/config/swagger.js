import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.3',

    info: {
        title: 'Career AI Platform API',
        version: '1.0.0',
        description:
            'REST API for the Career AI Platform — authentication, resumes, ATS analysis, AI career tools, roadmaps, profiles, recommendations and more.',
    },

    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Local development server',
        },
        {
            url: 'https://your-production-domain.com',
            description: 'Production server',
        },
    ],

    tags: [
        {
            name: 'Health',
            description: 'Server health and API information',
        },
        {
            name: 'Authentication',
            description: 'User authentication and authorization',
        },
        {
            name: 'Resume',
            description: 'Resume management and processing',
        },
        {
            name: 'ATS',
            description: 'ATS resume analysis',
        },
        {
            name: 'Profile',
            description: 'User profile management',
        },
        {
            name: 'Roadmap',
            description: 'Career roadmap operations',
        },
        {
            name: 'AI',
            description: 'AI-powered career features',
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT access token',
            },
        },

        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    message: {
                        type: 'string',
                        example: 'Something went wrong',
                    },
                },
            },

            HealthResponse: {
                type: 'object',
                properties: {
                    status: {
                        type: 'string',
                        example: 'success',
                    },
                    message: {
                        type: 'string',
                        example: 'Server is running',
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                    },
                    environment: {
                        type: 'string',
                        example: 'development',
                    },
                },
            },
        },
    },
};

const swaggerOptions = {
    definition: swaggerDefinition,

    apis: [
        './src/app.js',
        './src/routes/v1/*.js',
    ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;