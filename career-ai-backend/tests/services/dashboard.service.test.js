import { jest } from '@jest/globals';

const db = { query: jest.fn() };
const resume = { findActiveByUserId: jest.fn() };
const ats = { findLatestByUserId: jest.fn() };
const logger = { error: jest.fn() };

jest.unstable_mockModule('../../src/config/db.js', () => db);
jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resume }));
jest.unstable_mockModule('../../src/models/AtsScore.js', () => ({ default: ats }));
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: logger }));

const DashboardService = (await import('../../src/services/dashboard.service.js')).default;

describe('dashboard.service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns null or empty defaults for missing inputs', () => {
    expect(DashboardService.getTopIssues(null)).toEqual([]);
    expect(DashboardService.getTopMissingSkills(null)).toEqual([]);
    expect(DashboardService.getResumeSkills(null)).toEqual([]);
    expect(DashboardService.getTopMissingSkills('not-json')).toEqual([]);
    expect(DashboardService.getResumeSkills('not-json')).toEqual([]);
  });

  test('sorts ATS issues by severity and limits the result', () => {
    const issues = [
      { severity: 'low', category: 'a', description: 'low', suggestion: 'x' },
      { severity: 'critical', category: 'b', description: 'critical', suggestion: 'y' },
      { severity: 'high', category: 'c', description: 'high', suggestion: 'z' },
      { severity: 'medium', category: 'd', description: 'medium', suggestion: 'w' },
    ];

    expect(DashboardService.getTopIssues(issues, 3).map((x) => x.severity))
      .toEqual(['critical', 'high', 'medium']);
  });

  test('normalizes missing skills from strings and objects', () => {
    expect(DashboardService.getTopMissingSkills(['Docker', 'AWS', 'Redis'], 3)).toEqual([
      { name: 'Docker', priority: 'core', category: null },
      { name: 'AWS', priority: 'core', category: null },
      { name: 'Redis', priority: 'nice-to-have', category: null },
    ]);

    expect(DashboardService.getTopMissingSkills(
      JSON.stringify([{ skill_name: 'Kubernetes', priority: 'core', category: 'devops' }])
    )).toEqual([{ name: 'Kubernetes', priority: 'core', category: 'devops' }]);
  });

  test('normalizes resume skills from objects', () => {
    expect(DashboardService.getResumeSkills([
      'Node.js',
      { name: 'PostgreSQL' },
      { skill_name: 'Redis' },
    ])).toEqual(['Node.js', 'PostgreSQL', 'Redis']);
  });

  describe('determineNextAction', () => {
    test.each([
      ['no resume', {}, 'upload_resume'],
      ['resume parsing', { activeResume: { id: 'r1', parsing_status: 'parsed' } }, 'resume_parsing'],
      ['no ATS', { activeResume: { id: 'r1', parsing_status: 'completed' } }, 'run_ats_score'],
      ['low ATS', { activeResume: { id: 'r1', parsing_status: 'completed' }, latestATSScore: { overall_score: 50 } }, 'improve_ats_score'],
      ['no skill gap', { activeResume: { id: 'r1', parsing_status: 'completed' }, latestATSScore: { overall_score: 80 } }, 'analyze_skills'],
      ['no roadmap', { activeResume: { id: 'r1', parsing_status: 'completed' }, latestATSScore: { overall_score: 80 }, latestSkillGap: { match_percentage: 60 } }, 'create_roadmap'],
    ])('%s', (_label, data, expectedType) => {
      expect(DashboardService.determineNextAction(data).type).toBe(expectedType);
    });

    test('suggests roadmap continuation when roadmap is active', () => {
      const result = DashboardService.determineNextAction({
        activeResume: { id: 'r1', parsing_status: 'completed' },
        latestATSScore: { overall_score: 80 },
        latestSkillGap: { match_percentage: 80 },
        activeRoadmap: { id: 'road1', status: 'active', completion_percentage: 40 },
      });
      expect(result).toBeDefined();
      expect(result.type).not.toBe('upload_resume');
    });
  });

  test('getUserProfile returns the first database row', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 'u1', email: 'john@example.com' }] });
    await expect(DashboardService.getUserProfile('u1')).resolves.toEqual({ id: 'u1', email: 'john@example.com' });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM users WHERE id = $1'), ['u1']);
  });

  test('getActiveResume and getLatestATSScore delegate to models', async () => {
    resume.findActiveByUserId.mockResolvedValue({ id: 'r1' });
    ats.findLatestByUserId.mockResolvedValue({ overall_score: 88 });

    await expect(DashboardService.getActiveResume('u1')).resolves.toEqual({ id: 'r1' });
    await expect(DashboardService.getLatestATSScore('u1')).resolves.toEqual({ overall_score: 88 });
  });

  test('getLatestSkillGap, getActiveRoadmap and getUserStats use the database', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 'gap1' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'road1' }] })
      .mockResolvedValueOnce({ rows: [{ total_resumes: '2', total_ats_scans: '3' }] });

    await expect(DashboardService.getLatestSkillGap('u1')).resolves.toEqual({ id: 'gap1' });
    await expect(DashboardService.getActiveRoadmap('u1')).resolves.toEqual({ id: 'road1' });
    await expect(DashboardService.getUserStats('u1')).resolves.toEqual({ total_resumes: '2', total_ats_scans: '3' });
    expect(db.query).toHaveBeenCalledTimes(3);
  });

  test('getDashboardData aggregates profile, resume, ATS, skill gap, roadmap and stats', async () => {
    jest.spyOn(DashboardService, 'getUserProfile').mockResolvedValue({ id: 'u1', email: 'john@example.com' });
    jest.spyOn(DashboardService, 'getActiveResume').mockResolvedValue({ id: 'r1', version: 2, uploaded_at: 'today', parsing_status: 'completed' });
    jest.spyOn(DashboardService, 'getLatestATSScore').mockResolvedValue({
      overall_score: 82,
      formatting_score: 90,
      keyword_score: 80,
      experience_score: 75,
      issues: [],
      scored_at: 'today',
    });
    jest.spyOn(DashboardService, 'getLatestSkillGap').mockResolvedValue({
      gap_score: 20,
      match_percentage: 80,
      missing_skills: ['Docker'],
      resume_skills: ['Node.js'],
      immediate_actions: [],
      analyzed_at: 'today',
    });
    jest.spyOn(DashboardService, 'getActiveRoadmap').mockResolvedValue({
      id: 'road1', title: 'Backend Roadmap', completion_percentage: 30, current_milestone: 'Docker', status: 'active',
    });
    jest.spyOn(DashboardService, 'getUserStats').mockResolvedValue({ total_resumes: '2' });

    const result = await DashboardService.getDashboardData('u1');

    expect(result).toMatchObject({
      profile: { id: 'u1' },
      resume: { id: 'r1', version: 2, parsingStatus: 'completed' },
      atsScore: { overall: 82 },
      skillGap: { matchPercentage: 80 },
      roadmap: { id: 'road1' },
      stats: { total_resumes: '2' },
    });
  });
});
