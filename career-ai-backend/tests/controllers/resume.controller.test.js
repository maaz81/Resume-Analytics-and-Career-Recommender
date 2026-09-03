import { jest } from '@jest/globals';

const resumeServiceMock = {
  uploadResumeService: jest.fn(),
  getResumeAnalysisService: jest.fn(),
  scoreResumeService: jest.fn(),
  getResumeHistoryService: jest.fn(),
  deleteResumeService: jest.fn(),
};
const resumeModelMock = { findById: jest.fn() };
const fsMock = {
  promises: {
    readFile: jest.fn(),
    unlink: jest.fn(),
    access: jest.fn(),
  },
  constants: { R_OK: 4 },
  createReadStream: jest.fn(),
};

jest.unstable_mockModule('../../src/services/resume.service.js', () => resumeServiceMock);
jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resumeModelMock }));
jest.unstable_mockModule('fs', () => ({ default: fsMock }));
jest.unstable_mockModule('pdf-parse', () => ({ default: jest.fn() }));
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

const pdfParse = (await import('pdf-parse')).default;
const controller = await import('../../src/controllers/resume.controller.js');

const res = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  setHeader: jest.fn(),
});

describe('resume.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('uploadResume rejects when no file is supplied', async () => {
    await expect(controller.uploadResume({ user: { id: 'u1' }, body: {} }, res()))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  test('uploadResume parses PDF and delegates to service', async () => {
    fsMock.promises.readFile.mockResolvedValue(Buffer.from('pdf'));
    pdfParse.mockResolvedValue({ text: 'Resume text' });
    resumeServiceMock.uploadResumeService.mockResolvedValue({ id: 'r1' });

    const response = res();
    const file = { path: '/tmp/resume.pdf', originalname: 'resume.pdf' };

    await controller.uploadResume({
      user: { id: 'u1' },
      file,
      body: { jdText: 'Backend developer JD' },
    }, response);

    expect(resumeServiceMock.uploadResumeService).toHaveBeenCalledWith({
      userId: 'u1',
      file,
      rawText: 'Resume text',
      jdText: 'Backend developer JD',
    });
    expect(response.status).toHaveBeenCalledWith(201);
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
