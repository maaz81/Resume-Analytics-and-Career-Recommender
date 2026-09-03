import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const controller = {
  scoreResume: jest.fn((req, res) => res.status(200).json({ success: true })),
  getLatestScore: jest.fn((req, res) => res.status(200).json({ success: true })),
};

jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'u1', is_active: true };
    next();
  },
}));

jest.unstable_mockModule('../../src/middleware/rateLimiter.js', () => ({
  aiLimiter: (req, res, next) => next(),
}));

jest.unstable_mockModule('../../src/controllers/ats.controller.js', () => controller);

const router = (await import('../../src/routes/v1/ats.routes.js')).default;
const app = express();
app.use('/api/v1/ats', router);

describe('ATS routes - HTTP integration', () => {
  test('POST /score/:resumeId reaches controller', async () => {
    await request(app).post('/api/v1/ats/score/r1').expect(200);
    expect(controller.scoreResume).toHaveBeenCalled();
  });

  test('GET /score/:resumeId reaches controller', async () => {
    await request(app).get('/api/v1/ats/score/r1').expect(200);
    expect(controller.getLatestScore).toHaveBeenCalled();
  });
});
