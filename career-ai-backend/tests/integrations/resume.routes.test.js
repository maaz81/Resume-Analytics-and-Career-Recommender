import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const controller = {
  uploadResume: jest.fn((req, res) => res.status(201).json({ success: true, data: { id: 'r1' } })),
  getResumeHistory: jest.fn((req, res) => res.status(200).json({ success: true, data: [] })),
  getResumeAnalysis: jest.fn((req, res) => res.status(200).json({ success: true })),
  scoreResume: jest.fn((req, res) => res.status(200).json({ success: true })),
  serveResumeFile: jest.fn((req, res) => res.status(200).json({ success: true })),
  deleteResumeController: jest.fn((req, res) => res.status(200).json({ success: true })),
};

jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'u1', email: 'john@example.com', is_active: true };
    next();
  },
}));

jest.unstable_mockModule('../../src/utils/fileUpload.js', () => ({
  upload: { single: () => (req, res, next) => next() },
}));

jest.unstable_mockModule('../../src/controllers/resume.controller.js', () => controller);

const router = (await import('../../src/routes/v1/resume.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/v1/resumes', router);

describe('Resume routes - HTTP integration', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET /history reaches controller', async () => {
    const res = await request(app).get('/api/v1/resumes/history').expect(200);
    expect(res.body.success).toBe(true);
    expect(controller.getResumeHistory).toHaveBeenCalled();
  });

  test('GET /:id/analysis reaches controller', async () => {
    await request(app).get('/api/v1/resumes/r1/analysis').expect(200);
    expect(controller.getResumeAnalysis).toHaveBeenCalled();
  });

  test('POST /:id/score reaches controller', async () => {
    await request(app).post('/api/v1/resumes/r1/score').expect(200);
    expect(controller.scoreResume).toHaveBeenCalled();
  });

  test('GET /:id/file reaches controller', async () => {
    await request(app).get('/api/v1/resumes/r1/file').expect(200);
    expect(controller.serveResumeFile).toHaveBeenCalled();
  });

  test('DELETE /:id reaches controller', async () => {
    await request(app).delete('/api/v1/resumes/r1').expect(200);
    expect(controller.deleteResumeController).toHaveBeenCalled();
  });

  test('POST /upload reaches controller through multer middleware', async () => {
    await request(app).post('/api/v1/resumes/upload').expect(201);
    expect(controller.uploadResume).toHaveBeenCalled();
  });
});
