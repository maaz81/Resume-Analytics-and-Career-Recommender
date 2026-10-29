import { jest } from '@jest/globals';

const axiosMock = {
  post: jest.fn(),
  get: jest.fn(),
};

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.unstable_mockModule('axios', () => ({ default: axiosMock }));
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: loggerMock }));

const { analyzeResume, callAIService } = await import('../../src/services/ai.service.js');

describe('ai.service - Python AI Client & Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('refuses to call ML service when resume_text is empty or null', async () => {
    await expect(analyzeResume(null, 'Valid JD')).rejects.toThrow(
      'analyzeResume called with empty resume_text'
    );
    await expect(analyzeResume('   ', 'Valid JD')).rejects.toThrow(
      'analyzeResume called with empty resume_text'
    );
    expect(axiosMock.post).not.toHaveBeenCalled();
  });

  test('refuses to call ML service when jd_text is empty or null', async () => {
    await expect(analyzeResume('Valid resume text', null)).rejects.toThrow(
      'analyzeResume called with empty jd_text'
    );
    await expect(analyzeResume('Valid resume text', '   ')).rejects.toThrow(
      'analyzeResume called with empty jd_text'
    );
    expect(axiosMock.post).not.toHaveBeenCalled();
  });

  test('parses Python 422 validation detail and throws badRequest with informative message', async () => {
    const error422 = new Error('Request failed with status code 422');
    error422.response = {
      status: 422,
      data: {
        detail: [
          {
            loc: ['body', 'resume_text'],
            msg: 'Input should be a valid string',
            type: 'string_type',
          },
        ],
      },
    };
    axiosMock.post.mockRejectedValue(error422);

    await expect(analyzeResume('Resume', 'JD')).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('ML validation error at body.resume_text: Input should be a valid string'),
    });

    expect(loggerMock.error).toHaveBeenCalledWith(
      expect.stringContaining('[AI 422]'),
      expect.any(Object)
    );
  });

  test('converts network disconnection (ECONNREFUSED) to 503 service unavailable', async () => {
    const connError = new Error('connect ECONNREFUSED 127.0.0.1:8000');
    connError.code = 'ECONNREFUSED';
    axiosMock.post.mockRejectedValue(connError);

    await expect(analyzeResume('Resume', 'JD')).rejects.toMatchObject({
      statusCode: 503,
      message: 'AI service is currently unavailable',
    });
  });

  test('returns successful analysis data when ML service returns 200', async () => {
    const mlResponse = {
      ats_score: 95,
      job_match_score: 90,
      missing_skills: [],
      resume_skills: ['JavaScript', 'Node.js'],
      courses: [],
      projects: [],
    };
    axiosMock.post.mockResolvedValue({ data: mlResponse });

    const result = await analyzeResume('Resume', 'JD');
    expect(result).toEqual(mlResponse);
  });
});
