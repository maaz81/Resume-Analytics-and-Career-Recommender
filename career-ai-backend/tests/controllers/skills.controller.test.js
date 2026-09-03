import { jest } from '@jest/globals';

const skillsServiceMock = {
  extractSkillsFromResume: jest.fn(),
  performSkillGapAnalysis: jest.fn(),
};

const skillModelMock = {
  getUserSkills: jest.fn(),
  getLatestGap: jest.fn(),
};

jest.unstable_mockModule('../../src/services/skill.service.js', () => ({
  default: skillsServiceMock,
}));

jest.unstable_mockModule('../../src/models/Skill.js', () => ({
  default: skillModelMock,
}));

jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({
  catchAsync: (fn) => fn,
}));

jest.unstable_mockModule('../../src/utils/response.js', () => ({
  successResponse: jest.fn((res, data, message) =>
    res.status(200).json({ status: 'success', message, data })
  ),
}));

const controller = await import('../../src/controllers/skills.controller.js');

const res = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('skills.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getUserSkills returns user skills', async () => {
    skillModelMock.getUserSkills.mockResolvedValue([{ name: 'Node.js' }]);
    const response = res();

    await controller.getUserSkills({ user: { id: 'u1' } }, response);

    expect(skillModelMock.getUserSkills).toHaveBeenCalledWith('u1');
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { skills: [{ name: 'Node.js' }] },
    }));
  });

  test('searchSkills returns placeholder empty list', async () => {
    const response = res();

    await controller.searchSkills({ query: { q: 'node' } }, response);

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { skills: [] },
    }));
  });

  test('extractSkills delegates to service', async () => {
    skillsServiceMock.extractSkillsFromResume.mockResolvedValue(['Node.js', 'PostgreSQL']);
    const response = res();

    await controller.extractSkills(
      { user: { id: 'u1' }, body: { resumeId: 'r1' } },
      response
    );

    expect(skillsServiceMock.extractSkillsFromResume)
      .toHaveBeenCalledWith('r1', 'u1');
  });

  test('analyzeSkillGap delegates to service', async () => {
    skillsServiceMock.performSkillGapAnalysis.mockResolvedValue({ score: 82 });
    const response = res();

    await controller.analyzeSkillGap({ user: { id: 'u1' } }, response);

    expect(skillsServiceMock.performSkillGapAnalysis).toHaveBeenCalledWith('u1');
  });

  test('getLatestSkillGap returns latest gap', async () => {
    skillModelMock.getLatestGap.mockResolvedValue({ matchPercentage: 75 });
    const response = res();

    await controller.getLatestSkillGap({ user: { id: 'u1' } }, response);

    expect(skillModelMock.getLatestGap).toHaveBeenCalledWith('u1');
  });

  test('getSkillGapHistory returns placeholder history', async () => {
    const response = res();

    await controller.getSkillGapHistory({ user: { id: 'u1' } }, response);

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { history: [] },
    }));
  });

  test('addSkill returns placeholder skill', async () => {
    const response = res();

    await controller.addSkill(
      { user: { id: 'u1' }, body: { skillName: 'Node.js' } },
      response
    );

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { skill: {} },
    }));
  });
});
