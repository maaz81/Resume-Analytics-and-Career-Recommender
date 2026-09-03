import request from 'supertest';
import app from '../src/app.js';

describe('Health API', () => {
    test('GET /health should return 200', async () => {
        const response = await request(app)
            .get('/health');

        expect(response.statusCode).toBe(200);

        expect(response.body).toHaveProperty(
            'status',
            'success'
        );

        expect(response.body).toHaveProperty(
            'message',
            'Server is running'
        );

        expect(response.body).toHaveProperty(
            'timestamp'
        );
    });
});