import { jest } from '@jest/globals';

const recommendationMock = {
  fetchYouTubeCourses: jest.fn(),
  defaultProjects: [{ title: 'Default project' }],
  defaultRoadmapSteps: [{ title: 'Step 1' }],
  defaultJobs: [{ title: 'Backend Developer' }],
};
const projectMock = { generateProjectsFromResume: jest.fn() };
const resumeMock = { findOne: jest.fn() };

jest.unstable_mockModule('../../src/services/recommendation.service.js', () => recommendationMock);
jest.unstable_mockModule('../../src/services/project.service.js', () => projectMock);
jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resumeMock }));
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: { error: jest.fn(), info: jest.fn() } }));
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({ catchAsync: (fn) => fn }));
jest.unstable_mockModule('../../src/utils/response.js', () => ({
  successResponse: jest.fn((res, data, message) =>
    res.status(200).json({ status: 'success', message, data })
  ),
  errorResponse: jest.fn((res, message, status) =>
    res.status(status).json({ status: 'error', message })
  ),
}));

const controller = await import('../../src/controllers/recommendation.controller.js');
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('recommendation.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getCourses uses query and max', async () => {
    recommendationMock.fetchYouTubeCourses.mockResolvedValue([{ title: 'Node course' }]);
    const response = res();

    await controller.getCourses({ query: { q: 'node', max: '5' } }, response);

    expect(recommendationMock.fetchYouTubeCourses).toHaveBeenCalledWith('node', 5);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('getCourses returns 502 when YouTube service fails', async () => {
    recommendationMock.fetchYouTubeCourses.mockRejectedValue(new Error('API down'));
    const response = res();

    await controller.getCourses({ query: {} }, response);

    expect(response.status).toHaveBeenCalledWith(502);
  });

  test('getProjects returns defaults when no resume exists', async () => {
    resumeMock.findOne.mockResolvedValue(null);
    const response = res();

    await controller.getProjects({ user: { id: 'u1' } }, response);

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: { projects: recommendationMock.defaultProjects },
    }));
  });

  test('getProjects maps generated projects', async () => {
    resumeMock.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({ raw_text: 'resume text' }),
    });
    projectMock.generateProjectsFromResume.mockResolvedValue([{
      title: 'API project',
      description: 'Build an API',
      stack: ['Node.js'],
      difficulty: 'Advanced',
    }]);

    const response = res();
    await controller.getProjects({ user: { id: 'u1' } }, response);

    expect(projectMock.generateProjectsFromResume).toHaveBeenCalledWith('resume text');
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        projects: [expect.objectContaining({ id: 1, title: 'API project', stack: ['Node.js'] })],
      },
    }));
  });

  test('getRoadmap returns roadmap steps', async () => {
    const response = res();
    await controller.getRoadmap({}, response);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('getJobs returns default jobs', async () => {
    const response = res();
    await controller.getJobs({}, response);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('getAll returns courses, projects, roadmap and jobs', async () => {
    recommendationMock.fetchYouTubeCourses.mockResolvedValue([{ title: 'Course' }]);
    resumeMock.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });

    const response = res();
    await controller.getAll({ query: {}, user: { id: 'u1' } }, response);

    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        courses: [{ title: 'Course' }],
        roadmapSteps: recommendationMock.defaultRoadmapSteps,
        jobs: recommendationMock.defaultJobs,
      }),
    }));
  });
});
