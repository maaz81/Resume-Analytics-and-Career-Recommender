import request from 'supertest';
import app from '../../src/app.js';

describe('Auth API', () => {
    describe('POST /api/v1/auth/register', () => {
        test('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Password123',
                    fullName: 'John Doe',
                });

            expect([422, 429]).toContain(res.status);
        });

        test('should reject weak password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'john@example.com',
                    password: 'password',
                    fullName: 'John Doe',
                });

            expect([422, 429]).toContain(res.status);
        });

        test('should reject missing fullName', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'john@example.com',
                    password: 'Password123',
                });

            expect([422, 429]).toContain(res.status);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        test('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'Password123',
                });

            expect([422, 429]).toContain(res.status);
        });

        test('should reject missing email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    password: 'Password123',
                });

            expect([422, 429]).toContain(res.status);
        });

        test('should reject missing password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@example.com',
                });

            expect([422, 429]).toContain(res.status);
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        test('should reject missing refresh token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/refresh')
                .send({});

            expect([400, 401, 422, 429]).toContain(res.status);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        test('should reject unauthenticated request', async () => {
            const res = await request(app)
                .get('/api/v1/auth/me');

            expect(res.status).toBe(401);
        });
    });

    describe('PATCH /api/v1/auth/profile', () => {
        test('should reject unauthenticated request', async () => {
            const res = await request(app)
                .patch('/api/v1/auth/profile')
                .send({
                    fullName: 'John Doe',
                });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/v1/auth/change-password', () => {
        test('should reject unauthenticated request', async () => {
            const res = await request(app)
                .post('/api/v1/auth/change-password')
                .send({
                    currentPassword: 'OldPassword123',
                    newPassword: 'NewPassword123',
                });

            expect(res.status).toBe(401);
        });

        test('should reject unauthenticated request even with weak password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/change-password')
                .send({
                    currentPassword: 'OldPassword123',
                    newPassword: 'weak',
                });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        test('should reject unauthenticated request', async () => {
            const res = await request(app)
                .post('/api/v1/auth/logout');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/v1/auth/forgot-password', () => {
        test('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({
                    email: 'invalid-email',
                });

            expect([400, 422, 429]).toContain(res.status);
        });

        test('should reject missing email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({});

            expect([400, 422, 429]).toContain(res.status);
        });
    });

    describe('POST /api/v1/auth/reset-password', () => {
        test('should reject missing token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    newPassword: 'Password123',
                });

            expect([400, 422, 429]).toContain(res.status);
        });

        test('should reject weak password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({
                    token: 'test-token',
                    newPassword: 'weak',
                });

            expect([400, 422, 429]).toContain(res.status);
        });
    });
});
