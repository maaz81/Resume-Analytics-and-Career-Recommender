import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const controller = {
  getDashboard: jest.fn((req, res) => res.status(200).json({ success: true })),
  getResumeHealth: jest.fn((req, res) => res.status(200).json({ success: true })),
  refreshDashboard: jest.fn((req, res) => res.status(200).json({ success: true })),
};

jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'u1', is_active: true };
    next();
  },
}));

jest.unstable_mockModule('../../src/controllers/dashboard.controller.js', () => controller);

const router = (await import('../../src/routes/v1/dashboard.routes.js')).default;
const app = express();
app.use('/api/v1/dashboard', router);

describe('Dashboard routes - HTTP integration', () => {
  test('GET / reaches controller', async () => {
    await request(app).get('/api/v1/dashboard').expect(200);
    expect(controller.getDashboard).toHaveBeenCalled();
  });

  test('GET /resume-health reaches controller', async () => {
    await request(app).get('/api/v1/dashboard/resume-health').expect(200);
    expect(controller.getResumeHealth).toHaveBeenCalled();
  });

  test('POST /refresh reaches controller', async () => {
    await request(app).post('/api/v1/dashboard/refresh').expect(200);
    expect(controller.refreshDashboard).toHaveBeenCalled();
  });
});
