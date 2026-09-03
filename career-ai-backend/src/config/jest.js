export default {
    testEnvironment: 'node',

    transform: {},

    testMatch: [
        '**/tests/**/*.test.js',
    ],

    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/**',
        '!src/scripts/**',
    ],

    coverageDirectory: 'coverage',

    clearMocks: true,

    verbose: true,
};