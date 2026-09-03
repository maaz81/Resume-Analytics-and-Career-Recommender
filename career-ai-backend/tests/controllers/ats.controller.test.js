import { jest } from '@jest/globals';

const resumeMock = { findById: jest.fn() };
const atsMock = { create: jest.fn(), findLatestByResumeId: jest.fn() };
const aiMock = { calculateATSScore: jest.fn() };
const cacheMock = { del: jest.fn() };

jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resumeMock }));
jest.unstable_mockModule('../../src/models/AtsScore.js', () => ({ default: atsMock }));
jest.unstable_mockModule('../../src/services/ai.service.js', () => aiMock);
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  cache: cacheMock,
  cacheKeys: { dashboard: (id) => `dashboard:${id}` },
}));
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({
  catchAsync: (fn) => fn,
  errors: {
    notFound: (message) => Object.assign(new Error(message), { statusCode: 404 }),
    forbidden: (message) => Object.assign(new Error(message), { statusCode: 403 }),
    badRequest: (message) => Object.assign(new Error(message), { statusCode: 400 }),
  },
}));
jest.unstable_mockModule('../../src/utils/response.js', () => ({
  successResponse: jest.fn((res, data, message) =>
    res.status(200).json({ status: 'success', message, data })
  ),
}));

const controller = await import('../../src/controllers/ats.controller.js');

const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('ats.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects when resume does not exist', async () => {
    resumeMock.findById.mockResolvedValue(null);

    await expect(
      controller.scoreResume({ params: { resumeId: 'r1' }, user: { id: 'u1' } }, res())
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test('rejects when resume belongs to another user', async () => {
    resumeMock.findById.mockResolvedValue({ id: 'r1', user_id: 'other' });

    await expect(
      controller.scoreResume({ params: { resumeId: 'r1' }, user: { id: 'u1' } }, res())
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('calculates and saves ATS score', async () => {
    resumeMock.findById.mockResolvedValue({
      id: 'r1',
      user_id: 'u1',
      raw_text: 'Resume text',
    });
    aiMock.calculateATSScore.mockResolvedValue({ overallScore: 88, modelVersion: 'v2' });
    atsMock.create.mockResolvedValue({ id: 's1', overall_score: 88 });

    const response = res();

    await controller.scoreResume(
      { params: { resumeId: 'r1' }, user: { id: 'u1', target_role: 'Backend Developer' } },
      response
    );

    expect(aiMock.calculateATSScore).toHaveBeenCalledWith('Resume text', 'Backend Developer');
    expect(atsMock.create).toHaveBeenCalledWith(expect.objectContaining({
      resumeId: 'r1',
      userId: 'u1',
      modelVersion: 'v2',
    }));
    expect(cacheMock.del).toHaveBeenCalledWith('dashboard:u1');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('returns latest ATS score', async () => {
    atsMock.findLatestByResumeId.mockResolvedValue({ id: 's1', overall_score: 90 });
    const response = res();

    await controller.getLatestScore(
      { params: { resumeId: 'r1' }, user: { id: 'u1' } },
      response
    );

    expect(atsMock.findLatestByResumeId).toHaveBeenCalledWith('r1', 'u1');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('rejects when latest score is missing', async () => {
    atsMock.findLatestByResumeId.mockResolvedValue(null);

    await expect(
      controller.getLatestScore(
        { params: { resumeId: 'r1' }, user: { id: 'u1' } },
        res()
      )
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
