import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const controller = {
  getUserSkills: jest.fn((req, res) => res.status(200).json({ success: true })),
  searchSkills: jest.fn((req, res) => res.status(200).json({ success: true })),
  extractSkills: jest.fn((req, res) => res.status(200).json({ success: true })),
  analyzeSkillGap: jest.fn((req, res) => res.status(200).json({ success: true })),
  getLatestSkillGap: jest.fn((req, res) => res.status(200).json({ success: true })),
  getSkillGapHistory: jest.fn((req, res) => res.status(200).json({ success: true })),
  addSkill: jest.fn((req, res) => res.status(201).json({ success: true })),
};

jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'u1', email: 'john@example.com', is_active: true };
    next();
  },
}));

jest.unstable_mockModule('../../src/middleware/rateLimiter.js', () => ({
  aiLimiter: (req, res, next) => next(),
}));

// Use real validator middleware so route validations are actually tested

jest.unstable_mockModule('../../src/controllers/skills.controller.js', () => controller);

const router = (await import('../../src/routes/v1/skills.routes.js')).default;

const app = express();
app.use(express.json());
app.use('/api/v1/skills', router);

describe('Skills routes - HTTP integration', () => {
  beforeEach(() => jest.clearAllMocks());

  test('GET / reaches controller', async () => {
    await request(app).get('/api/v1/skills').expect(200);
    expect(controller.getUserSkills).toHaveBeenCalled();
  });

  test('GET /search reaches controller', async () => {
    await request(app).get('/api/v1/skills/search?q=node').expect(200);
    expect(controller.searchSkills).toHaveBeenCalled();
  });

  test('POST /extract rejects invalid UUID before controller', async () => {
    await request(app)
      .post('/api/v1/skills/extract')
      .send({ resumeId: 'not-a-uuid' })
      .expect(422);

    expect(controller.extractSkills).not.toHaveBeenCalled();
  });

  test('POST /extract accepts valid UUID and reaches controller', async () => {
    await request(app)
      .post('/api/v1/skills/extract')
      .send({ resumeId: '550e8400-e29b-41d4-a716-446655440000' })
      .expect(200);

    expect(controller.extractSkills).toHaveBeenCalled();
  });

  test('POST /analyze reaches controller', async () => {
    await request(app).post('/api/v1/skills/analyze').expect(200);
    expect(controller.analyzeSkillGap).toHaveBeenCalled();
  });

  test('GET /gap reaches controller', async () => {
    await request(app).get('/api/v1/skills/gap').expect(200);
    expect(controller.getLatestSkillGap).toHaveBeenCalled();
  });

  test('GET /gap/history reaches controller', async () => {
    await request(app).get('/api/v1/skills/gap/history').expect(200);
    expect(controller.getSkillGapHistory).toHaveBeenCalled();
  });

  test('POST /add rejects empty skillName before controller', async () => {
    await request(app)
      .post('/api/v1/skills/add')
      .send({ skillName: '' })
      .expect(422);

    expect(controller.addSkill).not.toHaveBeenCalled();
  });

  test('POST /add rejects invalid proficiency before controller', async () => {
    await request(app)
      .post('/api/v1/skills/add')
      .send({ skillName: 'Node.js', proficiency: 'master' })
      .expect(422);

    expect(controller.addSkill).not.toHaveBeenCalled();
  });

  test('POST /add accepts valid data', async () => {
    await request(app)
      .post('/api/v1/skills/add')
      .send({ skillName: 'Node.js', proficiency: 'advanced' })
      .expect(201);

    expect(controller.addSkill).toHaveBeenCalled();
  });
});
