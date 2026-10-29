import { jest } from '@jest/globals';

const resumeServiceMock = {
  uploadResumeService: jest.fn(),
  getResumeAnalysisService: jest.fn(),
  scoreResumeService: jest.fn(),
  getResumeHistoryService: jest.fn(),
  deleteResumeService: jest.fn(),
};

const dbMock = {
  query: jest.fn(),
};

const redisMock = {
  cache: {
    del: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  },
  cacheKeys: {
    dashboard: (id) => `dashboard:${id}`,
    userContext: (id) => `user:${id}:context`,
    resumeActive: (id) => `resume:${id}:active`,
  },
};

const resumeModelMock = { findById: jest.fn() };

const fsMock = {
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  promises: {
    readFile: jest.fn(),
    unlink: jest.fn().mockResolvedValue(),
    access: jest.fn().mockResolvedValue(),
  },
  constants: { R_OK: 4 },
  createReadStream: jest.fn(),
};

const directServiceMock = {
  processResumeDirect: jest.fn().mockResolvedValue({ rawText: 'Extracted text', aiResult: null }),
};

const queueMock = {
  addResumeProcessingJob: jest.fn().mockResolvedValue({ id: 'job-123' }),
};

jest.unstable_mockModule('../../src/services/resume.service.js', () => resumeServiceMock);
jest.unstable_mockModule('../../src/services/resumeProcessing.service.js', () => directServiceMock);
jest.unstable_mockModule('../../src/queues/resume.queue.js', () => queueMock);
jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resumeModelMock }));
jest.unstable_mockModule('../../src/config/db.js', () => dbMock);
jest.unstable_mockModule('../../src/config/redis.js', () => redisMock);
jest.unstable_mockModule('fs', () => ({ default: fsMock }));
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({
  catchAsync: (fn) => fn,
  errors: {
    badRequest: (m) => Object.assign(new Error(m), { statusCode: 400 }),
    notFound: (m) => Object.assign(new Error(m), { statusCode: 404 }),
    forbidden: (m) => Object.assign(new Error(m), { statusCode: 403 }),
  },
}));
jest.unstable_mockModule('../../src/utils/response.js', () => ({
  successResponse: jest.fn((res, data, message) =>
    res.status(200).json({ status: 'success', message, data })
  ),
  createdResponse: jest.fn((res, data, message) =>
    res.status(201).json({ status: 'success', message, data })
  ),
}));

const controller = await import('../../src/controllers/resume.controller.js');

const res = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  setHeader: jest.fn(),
});

describe('resume.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uploadResume rejects when no file is supplied', async () => {
    await expect(controller.uploadResume({ user: { id: 1 }, body: {} }, res()))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  test('uploadResume in queue mode records resume and queues job', async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [] }) // UPDATE resumes
      .mockResolvedValueOnce({ rows: [{ next_version: 2 }] }) // version query
      .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, original_filename: 'resume.pdf' }] }); // insert

    const response = res();
    const file = { path: '/tmp/resume.pdf', originalname: 'resume.pdf', size: 1024, mimetype: 'application/pdf' };

    await controller.uploadResume({
      user: { id: 1 },
      file,
      body: { jdText: 'Backend developer JD' },
    }, response);

    expect(dbMock.query).toHaveBeenCalledTimes(3);
    expect(response.status).toHaveBeenCalledWith(201);
  });

  test('getResumeStatus returns status for specific resume ID', async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ id: 10, parsing_status: 'completed', parsing_error: null }],
    });

    const response = res();
    await controller.getResumeStatus({
      params: { id: '10' },
      user: { id: 1 },
    }, response);

    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = $1 AND user_id = $2'),
      ['10', 1]
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('getResumeStatus returns status for latest resume', async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ id: 12, parsing_status: 'completed', parsing_error: null }],
    });

    const response = res();
    await controller.getResumeStatus({
      params: { id: 'latest' },
      user: { id: 1 },
    }, response);

    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY uploaded_at DESC LIMIT 1'),
      [1]
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('getResumeStatus throws 404 when resume not found', async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [] });

    await expect(
      controller.getResumeStatus({ params: { id: '999' }, user: { id: 1 } }, res())
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test('scoreResume rejects missing JD', async () => {
    await expect(controller.scoreResume({
      params: { id: 'r1' },
      user: { id: 'u1' },
      body: {},
    }, res())).rejects.toMatchObject({ statusCode: 400 });
  });

  test('scoreResume delegates and coerces isAuto', async () => {
    resumeServiceMock.scoreResumeService.mockResolvedValue({
      score: { overall_score: 90 },
      generatedJD: 'Generated JD',
    });
    const response = res();

    await controller.scoreResume({
      params: { id: 'r1' },
      user: { id: 'u1' },
      body: { jdText: 'Backend Developer', isAuto: 'true' },
    }, response);

    expect(resumeServiceMock.scoreResumeService).toHaveBeenCalledWith(
      'r1',
      'u1',
      'Backend Developer',
      true
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('getResumeAnalysis delegates', async () => {
    resumeServiceMock.getResumeAnalysisService.mockResolvedValue({ atsScore: { overall: 80 } });

    await controller.getResumeAnalysis({
      params: { id: 'r1' },
      user: { id: 'u1' },
    }, res());

    expect(resumeServiceMock.getResumeAnalysisService).toHaveBeenCalledWith('r1', 'u1');
  });

  test('getResumeHistory returns resumes', async () => {
    resumeServiceMock.getResumeHistoryService.mockResolvedValue([{ id: 'r1' }]);
    const response = res();

    await controller.getResumeHistory({ user: { id: 'u1' } }, response);

    expect(resumeServiceMock.getResumeHistoryService).toHaveBeenCalledWith('u1');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('deleteResumeController delegates', async () => {
    const response = res();

    await controller.deleteResumeController({
      params: { id: 'r1' },
      user: { id: 'u1' },
    }, response);

    expect(resumeServiceMock.deleteResumeService).toHaveBeenCalledWith('r1', 'u1');
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
