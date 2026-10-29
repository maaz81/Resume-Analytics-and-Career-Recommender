import { jest } from '@jest/globals';

const dbMock = {
  query: jest.fn(),
};

const redisMock = {
  cache: {
    del: jest.fn().mockResolvedValue(),
  },
  cacheKeys: {
    dashboard: (id) => `dashboard:${id}`,
    userContext: (id) => `user:${id}:context`,
    resumeActive: (id) => `resume:${id}:active`,
  },
};

const aiMock = {
  analyzeResume: jest.fn(),
};

const loggerMock = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const fsMock = {
  readFile: jest.fn(),
};

const pdfMock = jest.fn();

jest.unstable_mockModule('../../src/config/db.js', () => dbMock);
jest.unstable_mockModule('../../src/config/redis.js', () => redisMock);
jest.unstable_mockModule('../../src/services/ai.service.js', () => aiMock);
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: loggerMock }));
jest.unstable_mockModule('fs/promises', () => ({ default: fsMock }));
jest.unstable_mockModule('pdf-parse', () => ({ default: pdfMock }));

const { processResumeDirect } = await import('../../src/services/resumeProcessing.service.js');

describe('resumeProcessing.service - Direct Synchronous Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully parses PDF text and marks status completed (no jdText)', async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from('dummy pdf bytes'));
    pdfMock.mockResolvedValue({ text: '  John Doe Resume Skills: Node.js, React  ' });
    dbMock.query.mockResolvedValue({ rows: [] });

    const result = await processResumeDirect({
      resumeId: 42,
      userId: 1,
      filePath: '/uploads/resumes/resume-42.pdf',
      jdText: null,
    });

    expect(result.rawText).toBe('John Doe Resume Skills: Node.js, React');
    expect(result.aiResult).toBeNull();

    // Verify database status transitions:
    // 1. Sets processing
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining("SET parsing_status = 'processing'"),
      [42, 1]
    );

    // 2. Persists raw_text
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('SET raw_text = $1'),
      ['John Doe Resume Skills: Node.js, React', 42, 1]
    );

    // 3. Sets completed
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining("SET parsing_status = 'completed'"),
      [42, 1]
    );

    // 4. Invalidates Redis caches
    expect(redisMock.cache.del).toHaveBeenCalledWith('dashboard:1');
    expect(redisMock.cache.del).toHaveBeenCalledWith('user:1:context');
    expect(redisMock.cache.del).toHaveBeenCalledWith('resume:1:active');
  });

  test('runs AI analysis when jdText is provided and persists ATS score + skill gaps', async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from('dummy bytes'));
    pdfMock.mockResolvedValue({ text: 'Senior Software Engineer with Node.js and PostgreSQL experience' });
    aiMock.analyzeResume.mockResolvedValue({
      ats_score: 92,
      job_match_score: 85,
      missing_skills: ['Docker'],
      resume_skills: ['Node.js', 'PostgreSQL'],
    });
    dbMock.query.mockResolvedValue({ rows: [] });

    const result = await processResumeDirect({
      resumeId: 43,
      userId: 2,
      filePath: '/uploads/resumes/resume-43.pdf',
      jdText: 'Looking for a Senior Backend Engineer',
    });

    expect(aiMock.analyzeResume).toHaveBeenCalledWith(
      'Senior Software Engineer with Node.js and PostgreSQL experience',
      'Looking for a Senior Backend Engineer'
    );
    expect(result.aiResult).toBeDefined();
    expect(result.aiResult.ats_score).toBe(92);

    // Verify ATS scores and skill gaps inserts
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO ats_scores'),
      expect.arrayContaining([43, 2, 92, 85])
    );
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO skill_gaps'),
      expect.arrayContaining([2, 43, 85])
    );
    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_skills'),
      expect.arrayContaining([2, 43, ['Node.js', 'PostgreSQL']])
    );
  });

  test('marks status failed when PDF has no extractable text', async () => {
    fsMock.readFile.mockResolvedValue(Buffer.from('empty pdf'));
    pdfMock.mockResolvedValue({ text: '    ' }); // empty whitespace
    dbMock.query.mockResolvedValue({ rows: [] });

    await expect(
      processResumeDirect({
        resumeId: 44,
        userId: 3,
        filePath: '/uploads/empty.pdf',
        jdText: null,
      })
    ).rejects.toThrow('Could not extract text from resume');

    expect(dbMock.query).toHaveBeenCalledWith(
      expect.stringContaining("SET parsing_status = 'failed'"),
      expect.arrayContaining([expect.stringContaining('Could not extract text'), 44, 3])
    );

    // Caches still busted on failure
    expect(redisMock.cache.del).toHaveBeenCalledWith('dashboard:3');
  });
});

