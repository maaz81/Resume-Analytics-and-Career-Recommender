import { jest } from '@jest/globals';

const resumeModel = {
  findActiveByUserId: jest.fn(),
  findAllByUserId: jest.fn(),
  findById: jest.fn(),
};
const db = { query: jest.fn(), pool: { connect: jest.fn() } };
const ai = { analyzeResume: jest.fn() };
const llm = { generateAutoJobDescription: jest.fn() };
const mapper = { mapAIToATS: jest.fn(), formatAnalysisResponse: jest.fn() };
const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
const errors = {
  notFound: (m) => Object.assign(new Error(m), { statusCode: 404 }),
  forbidden: (m) => Object.assign(new Error(m), { statusCode: 403 }),
  badRequest: (m) => Object.assign(new Error(m), { statusCode: 400 }),
};
const fs = { unlink: jest.fn() };

jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resumeModel }));
jest.unstable_mockModule('../../src/config/db.js', () => db);
jest.unstable_mockModule('../../src/services/ai.service.js', () => ai);
jest.unstable_mockModule('../../src/services/llm.service.js', () => llm);
jest.unstable_mockModule('../../src/utils/resume.mapper.js', () => mapper);
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: logger }));
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({ errors }));
jest.unstable_mockModule('fs/promises', () => ({ default: fs }));

const service = await import('../../src/services/resume.service.js');

const makeClient = () => ({
  query: jest.fn(),
  release: jest.fn(),
});

describe('resume.service', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = makeClient();
    db.pool.connect.mockResolvedValue(client);
  });

  describe('uploadResumeService', () => {
    test('uploads a resume without AI analysis', async () => {
      client.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'r1', version: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.uploadResumeService({
        userId: 'u1',
        file: { originalname: 'resume.pdf', path: '/tmp/resume.pdf', size: 123, mimetype: 'application/pdf' },
        rawText: 'Resume text',
      });

      expect(ai.analyzeResume).not.toHaveBeenCalled();
      expect(client.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE resumes'), ['u1']);
      expect(client.query).toHaveBeenCalledWith('COMMIT');
      expect(client.release).toHaveBeenCalled();
      expect(result).toEqual({ resume: { id: 'r1', version: 1 }, analysis: null });
    });

    test('runs AI analysis and persists ATS, skill gaps and user skills', async () => {
      client.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'r1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      ai.analyzeResume.mockResolvedValue({
        ats_score: 88,
        job_match_score: 76,
        missing_skills: ['Docker'],
        resume_skills: ['Node.js'],
        courses: [],
        projects: [],
      });

      const result = await service.uploadResumeService({
        userId: 'u1',
        file: { originalname: 'resume.pdf', path: '/tmp/resume.pdf', size: 123, mimetype: 'application/pdf' },
        rawText: 'Resume text',
        jdText: 'Backend Developer JD',
      });

      expect(ai.analyzeResume).toHaveBeenCalledWith('Resume text', 'Backend Developer JD');
      expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO ats_scores'), expect.arrayContaining([88, 76]));
      expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO skill_gaps'), expect.arrayContaining([76]));
      expect(client.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO user_skills'), ['u1', 'r1', ['Node.js']]);
      expect(result.analysis).toEqual(expect.objectContaining({ ats_score: 88, match_score: 76, skills: ['Node.js'] }));
    });

    test('converts AI failure during upload to service-unavailable error', async () => {
      ai.analyzeResume.mockRejectedValue(new Error('ML down'));
      await expect(service.uploadResumeService({
        userId: 'u1',
        file: { originalname: 'resume.pdf', path: '/tmp/r.pdf', size: 1, mimetype: 'application/pdf' },
        rawText: 'text',
        jdText: 'Backend',
      })).rejects.toThrow('AI service unavailable');
      expect(db.pool.connect).not.toHaveBeenCalled();
    });

    test('rolls back and releases the transaction when database work fails', async () => {
      client.query
        .mockResolvedValueOnce({ rows: [] })
        .mockRejectedValueOnce(new Error('DB failure'))
        .mockResolvedValueOnce({ rows: [] });

      await expect(service.uploadResumeService({
        userId: 'u1',
        file: { originalname: 'resume.pdf', path: '/tmp/r.pdf', size: 1, mimetype: 'application/pdf' },
        rawText: 'text',
      })).rejects.toThrow('DB failure');

      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
      expect(client.release).toHaveBeenCalled();
    });
  });

  describe('getResumeAnalysisService', () => {
    test('resolves latest active resume and combines ATS, gaps and skills', async () => {
      resumeModel.findActiveByUserId.mockResolvedValue({ id: 'r1', user_id: 'u1' });
      db.query
        .mockResolvedValueOnce({ rows: [{ overall_score: 90 }] })
        .mockResolvedValueOnce({ rows: [{ match_percentage: 80, missing_skills: ['Docker'], resume_skills: ['Node.js'] }] })
        .mockResolvedValueOnce({ rows: [{ name: 'Node.js' }, { name: 'PostgreSQL' }] });
      mapper.formatAnalysisResponse.mockReturnValue({ atsScore: { overall: 90 }, resume: { id: 'r1' } });

      const result = await service.getResumeAnalysisService('latest', 'u1');

      expect(mapper.formatAnalysisResponse).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        atsScore: { overall: 90 },
        skills: ['Node.js', 'PostgreSQL'],
        skillGap: expect.objectContaining({ matchPercentage: 80 }),
      }));
    });

    test('falls back to the first resume when latest active resume does not exist', async () => {
      resumeModel.findActiveByUserId.mockResolvedValue(null);
      resumeModel.findAllByUserId.mockResolvedValue([{ id: 'r2', user_id: 'u1' }]);
      db.query.mockResolvedValue({ rows: [] });
      mapper.formatAnalysisResponse.mockReturnValue({});

      await service.getResumeAnalysisService('latest', 'u1');
      expect(resumeModel.findAllByUserId).toHaveBeenCalledWith('u1');
    });

    test('rejects an unknown or unauthorized resume', async () => {
      resumeModel.findById.mockResolvedValue(null);
      await expect(service.getResumeAnalysisService('r1', 'u1')).rejects.toMatchObject({ statusCode: 404 });

      resumeModel.findById.mockResolvedValue({ id: 'r1', user_id: 'other' });
      await expect(service.getResumeAnalysisService('r1', 'u1')).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe('scoreResumeService', () => {
    const resume = { id: 'r1', user_id: 'u1', raw_text: 'Resume text' };
    const mapped = { overall_score: 84, keyword_score: 80, formatting_score: 90, experience_score: 82, missing_keywords: ['Docker'] };

    beforeEach(() => {
      resumeModel.findById.mockResolvedValue(resume);
      mapper.mapAIToATS.mockReturnValue(mapped);
    });

    test('returns a cached manual score without calling AI', async () => {
      db.query.mockResolvedValue({ rows: [{ id: 'score1', overall_score: 90 }] });

      const result = await service.scoreResumeService('r1', 'u1', 'Backend Developer JD', false);

      expect(ai.analyzeResume).not.toHaveBeenCalled();
      expect(result).toEqual({ score: { id: 'score1', overall_score: 90 }, generatedJD: null });
    });

    test('scores a manual JD and stores the mapped ATS data', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'score2', overall_score: 84 }] });
      ai.analyzeResume.mockResolvedValue({ target_role: 'Backend Developer' });

      const result = await service.scoreResumeService('r1', 'u1', 'Backend Developer JD', false);

      expect(ai.analyzeResume).toHaveBeenCalledWith('Resume text', 'Backend Developer JD');
      expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT INTO ats_scores'), expect.arrayContaining([84, 80, 90, 82, 'Backend Developer']));
      expect(result).toEqual({ score: { id: 'score2', overall_score: 84 }, generatedJD: null });
    });

    test('auto mode generates a JD and skips the cache query', async () => {
      llm.generateAutoJobDescription.mockResolvedValue('Generated detailed JD');
      ai.analyzeResume.mockResolvedValue({ target_role: 'Senior Backend Developer' });
      db.query.mockResolvedValue({ rows: [{ id: 'score3' }] });

      const result = await service.scoreResumeService('r1', 'u1', 'Senior Backend Developer', true);

      expect(llm.generateAutoJobDescription).toHaveBeenCalledWith('Senior Backend Developer', 'Resume text');
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(ai.analyzeResume).toHaveBeenCalledWith('Resume text', 'Generated detailed JD');
      expect(result.generatedJD).toBe('Generated detailed JD');
    });

    test('falls back to the role title when auto JD generation fails', async () => {
      llm.generateAutoJobDescription.mockRejectedValue(new Error('OpenRouter down'));
      ai.analyzeResume.mockResolvedValue({ target_role: null });
      db.query.mockResolvedValue({ rows: [{ id: 'score4' }] });

      await service.scoreResumeService('r1', 'u1', 'Backend Developer', true);

      expect(ai.analyzeResume).toHaveBeenCalledWith('Resume text', 'Backend Developer');
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO ats_scores'), expect.arrayContaining(['Backend Developer', null]));
    });

    test('converts AI scoring failure to service-unavailable error', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      ai.analyzeResume.mockRejectedValue(new Error('ML down'));

      await expect(service.scoreResumeService('r1', 'u1', 'Backend JD'))
        .rejects.toThrow('AI service unavailable');
    });

    test('truncates an oversized target role before persistence', async () => {
      const longRole = 'x'.repeat(400);
      db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id: 'score5' }] });
      ai.analyzeResume.mockResolvedValue({ target_role: longRole });

      await service.scoreResumeService('r1', 'u1', 'Backend JD');

      const insertParams = db.query.mock.calls[1][1];
      expect(insertParams[7]).toHaveLength(255);
      expect(insertParams[7].endsWith('...')).toBe(true);
    });
  });

  describe('history and delete', () => {
    test('maps resume history into frontend shape', async () => {
      db.query.mockResolvedValue({ rows: [
        { id: 'r2', version: 2, original_filename: 'new.pdf', uploaded_at: 'today', is_active: true, overall_score: 91 },
        { id: 'r1', version: 1, original_filename: 'old.pdf', uploaded_at: 'yesterday', is_active: false, overall_score: null },
      ] });

      await expect(service.getResumeHistoryService('u1')).resolves.toEqual([
        expect.objectContaining({ id: 'r2', version: 2, fileName: 'new.pdf', atsScore: 91, status: 'current', fileUrl: '/api/v1/resumes/r2/file' }),
        expect.objectContaining({ id: 'r1', status: 'archived', atsScore: null }),
      ]);
    });

    test('deletes an archived resume and its file', async () => {
      resumeModel.findById.mockResolvedValue({ id: 'r1', user_id: 'u1', is_active: false, file_path: '/tmp/r.pdf' });
      fs.unlink.mockResolvedValue();
      db.query.mockResolvedValue({ rows: [] });

      await expect(service.deleteResumeService('r1', 'u1')).resolves.toBeUndefined();
      expect(fs.unlink).toHaveBeenCalledWith('/tmp/r.pdf');
      expect(db.query).toHaveBeenCalledWith('DELETE FROM resumes WHERE id = $1', ['r1']);
    });

    test('rejects missing, unauthorized and active resumes', async () => {
      resumeModel.findById.mockResolvedValue(null);
      await expect(service.deleteResumeService('r1', 'u1')).rejects.toMatchObject({ statusCode: 404 });

      resumeModel.findById.mockResolvedValue({ id: 'r1', user_id: 'other', is_active: false });
      await expect(service.deleteResumeService('r1', 'u1')).rejects.toMatchObject({ statusCode: 403 });

      resumeModel.findById.mockResolvedValue({ id: 'r1', user_id: 'u1', is_active: true });
      await expect(service.deleteResumeService('r1', 'u1')).rejects.toMatchObject({ statusCode: 400 });
    });

    test('ignores file deletion errors and still deletes the database row', async () => {
      resumeModel.findById.mockResolvedValue({ id: 'r1', user_id: 'u1', is_active: false, file_path: '/tmp/r.pdf' });
      fs.unlink.mockRejectedValue(new Error('file missing'));
      db.query.mockResolvedValue({ rows: [] });

      await expect(service.deleteResumeService('r1', 'u1')).resolves.toBeUndefined();
      expect(db.query).toHaveBeenCalledWith('DELETE FROM resumes WHERE id = $1', ['r1']);
    });
  });
});
