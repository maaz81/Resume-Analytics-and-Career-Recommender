import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const controller = {
  getCourses: jest.fn((req, res) => res.status(200).json({ success: true })),
  getProjects: jest.fn((req, res) => res.status(200).json({ success: true })),
  getRoadmap: jest.fn((req, res) => res.status(200).json({ success: true })),
  getJobs: jest.fn((req, res) => res.status(200).json({ success: true })),
  getAll: jest.fn((req, res) => res.status(200).json({ success: true })),
};

jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'u1', is_active: true };
    next();
  },
}));

jest.unstable_mockModule('../../src/controllers/recommendation.controller.js', () => controller);

const router = (await import('../../src/routes/v1/recommendation.routes.js')).default;
const app = express();
app.use('/api/v1/recommendations', router);

describe('Recommendation routes - HTTP integration', () => {
  test('GET /courses reaches controller', async () => {
    await request(app).get('/api/v1/recommendations/courses').expect(200);
    expect(controller.getCourses).toHaveBeenCalled();
  });

  test('GET /projects reaches controller', async () => {
    await request(app).get('/api/v1/recommendations/projects').expect(200);
    expect(controller.getProjects).toHaveBeenCalled();
  });

  test('GET /roadmap reaches controller', async () => {
    await request(app).get('/api/v1/recommendations/roadmap').expect(200);
    expect(controller.getRoadmap).toHaveBeenCalled();
  });

  test('GET /jobs reaches controller', async () => {
    await request(app).get('/api/v1/recommendations/jobs').expect(200);
    expect(controller.getJobs).toHaveBeenCalled();
  });

  test('GET / reaches controller', async () => {
    await request(app).get('/api/v1/recommendations').expect(200);
    expect(controller.getAll).toHaveBeenCalled();
  });
});
