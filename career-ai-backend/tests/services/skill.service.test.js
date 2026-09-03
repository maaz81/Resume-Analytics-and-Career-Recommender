import { jest } from '@jest/globals';

const skillModel = {
  bulkInsertUserSkills: jest.fn(),
  getUserSkills: jest.fn(),
  createSkillGap: jest.fn(),
};
const resumeModel = {
  findById: jest.fn(),
  findActiveByUserId: jest.fn(),
};
const userModel = { findById: jest.fn() };
const aiMock = { analyzeSkillGap: jest.fn() };
const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
const errors = {
  notFound: (message) => Object.assign(new Error(message), { statusCode: 404 }),
  badRequest: (message) => Object.assign(new Error(message), { statusCode: 400 }),
};

jest.unstable_mockModule('../../src/models/Skill.js', () => ({ default: skillModel }));
jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resumeModel }));
jest.unstable_mockModule('../../src/models/User.js', () => ({ default: userModel }));
jest.unstable_mockModule('../../src/services/ai.service.js', () => aiMock);
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: logger }));
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({ errors }));

const SkillsService = (await import('../../src/services/skill.service.js')).default;

describe('skill.service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('deduplicateSkills', () => {
    test('keeps the highest-confidence duplicate', () => {
      const result = SkillsService.deduplicateSkills([
        { name: ' Node.js ', confidence: 0.7 },
        { name: 'node.js', confidence: 0.95 },
        { name: 'PostgreSQL', confidence: 0.8 },
      ]);

      expect(result).toEqual([
        { name: 'node.js', confidence: 0.95 },
        { name: 'PostgreSQL', confidence: 0.8 },
      ]);
    });
  });

  describe('calculateMatchPercentage', () => {
    test('returns zero when there are no user skills', () => {
      expect(SkillsService.calculateMatchPercentage(0, 4)).toBe(0);
    });

    test('calculates and rounds match percentage to two decimals', () => {
      expect(SkillsService.calculateMatchPercentage(7, 3)).toBe(70);
      expect(SkillsService.calculateMatchPercentage(2, 3)).toBe(40);
    });
  });

  describe('generateImmediateActions', () => {
    test('creates critical, improvement and project actions', () => {
      const result = SkillsService.generateImmediateActions(
        { missingSkills: [
          { skill_name: 'Docker', priority: 'core' },
          { skill_name: 'AWS', priority: 'core' },
        ] },
        [{ name: 'Node.js' }, { name: 'PostgreSQL' }]
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        type: 'learn_skills',
        priority: 'critical',
        skills: ['Docker', 'AWS'],
      });
      expect(result[1]).toMatchObject({ type: 'improve_skills', skills: ['Node.js', 'PostgreSQL'] });
      expect(result[2]).toMatchObject({ type: 'build_projects', priority: 'medium' });
    });

    test('returns no actions for an empty analysis and empty skills', () => {
      expect(SkillsService.generateImmediateActions({ missingSkills: [] }, [])).toEqual([]);
    });
  });

  describe('prioritizeSkills', () => {
    test('orders core before nice-to-have before emerging', () => {
      const input = [
        { skill_name: 'Git', priority: 'emerging' },
        { skill_name: 'Docker', priority: 'core' },
        { skill_name: 'Redis', priority: 'nice-to-have' },
      ];

      expect(SkillsService.prioritizeSkills(input)).toEqual(['Docker', 'Redis', 'Git']);
    });
  });

  describe('extractSkillsFromResume', () => {
    test('rejects missing or unauthorized resume', async () => {
      resumeModel.findById.mockResolvedValue(null);

      await expect(SkillsService.extractSkillsFromResume('r1', 'u1'))
        .rejects.toMatchObject({ statusCode: 404, message: 'Resume not found' });
    });

    test('rejects an unparsed resume', async () => {
      resumeModel.findById.mockResolvedValue({ id: 'r1', user_id: 'u1', parsed_data: null });

      await expect(SkillsService.extractSkillsFromResume('r1', 'u1'))
        .rejects.toMatchObject({ statusCode: 400, message: 'Resume not parsed yet' });
    });

    test('extracts dedicated and experience skills and bulk inserts unique skills', async () => {
      resumeModel.findById.mockResolvedValue({
        id: 'r1',
        user_id: 'u1',
        parsed_data: {
          skills: [
            'Node.js',
            { name: 'PostgreSQL', category: 'database', level: 'advanced', years: 3 },
          ],
          experience: [{ technologies: ['Node.js', 'Redis'] }],
        },
      });
      skillModel.bulkInsertUserSkills.mockResolvedValue([{ id: 's1', name: 'Node.js' }]);

      const result = await SkillsService.extractSkillsFromResume('r1', 'u1');

      expect(skillModel.bulkInsertUserSkills).toHaveBeenCalledWith(
        'u1',
        'r1',
        expect.arrayContaining([
          expect.objectContaining({ name: 'Node.js', confidence: 0.95 }),
          expect.objectContaining({ name: 'PostgreSQL', confidence: 0.95 }),
          expect.objectContaining({ name: 'Redis', confidence: 0.7 }),
        ])
      );
      expect(skillModel.bulkInsertUserSkills.mock.calls[0][2]).toHaveLength(3);
      expect(result).toEqual([{ id: 's1', name: 'Node.js' }]);
    });
  });

  describe('performSkillGapAnalysis', () => {
    test('rejects missing user', async () => {
      userModel.findById.mockResolvedValue(null);
      await expect(SkillsService.performSkillGapAnalysis('u1'))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    test('rejects when target role is missing', async () => {
      userModel.findById.mockResolvedValue({ id: 'u1', target_role: null });
      await expect(SkillsService.performSkillGapAnalysis('u1'))
        .rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('Target role') });
    });

    test('rejects when the user has no skills', async () => {
      userModel.findById.mockResolvedValue({ id: 'u1', target_role: 'Backend Developer' });
      skillModel.getUserSkills.mockResolvedValue([]);

      await expect(SkillsService.performSkillGapAnalysis('u1'))
        .rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining('No skills') });
    });

    test('calls AI, calculates gap and persists the analysis', async () => {
      userModel.findById.mockResolvedValue({ id: 'u1', target_role: 'Backend Developer' });
      skillModel.getUserSkills.mockResolvedValue([
        { name: 'Node.js', category: 'technical', proficiency_level: 'advanced', years_of_experience: 3 },
        { name: 'PostgreSQL', category: 'database', proficiency_level: 'intermediate', years_of_experience: 2 },
      ]);
      resumeModel.findActiveByUserId.mockResolvedValue({ id: 'r1' });
      aiMock.analyzeSkillGap.mockResolvedValue({
        missingSkills: [
          { skill_name: 'Docker', priority: 'core' },
          { skill_name: 'AWS', priority: 'nice-to-have' },
        ],
        modelVersion: 'v2',
      });
      skillModel.createSkillGap.mockResolvedValue({ id: 'gap1', gap_score: 50 });

      const result = await SkillsService.performSkillGapAnalysis('u1');

      expect(aiMock.analyzeSkillGap).toHaveBeenCalledWith({
        skills: [
          { name: 'Node.js', category: 'technical', proficiency: 'advanced', years: 3 },
          { name: 'PostgreSQL', category: 'database', proficiency: 'intermediate', years: 2 },
        ],
      }, 'Backend Developer');
      expect(skillModel.createSkillGap).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'u1',
        resumeId: 'r1',
        gapScore: 50,
        matchPercentage: 50,
        aiModelVersion: 'v2',
        learningPriorities: ['Docker', 'AWS'],
      }));
      expect(result).toEqual({ id: 'gap1', gap_score: 50 });
    });
  });

  test('getSkillRecommendations returns the current placeholder structure', async () => {
    await expect(SkillsService.getSkillRecommendations('Backend Developer')).resolves.toEqual({
      coreSkills: [],
      niceToHave: [],
      emerging: [],
    });
  });
});
