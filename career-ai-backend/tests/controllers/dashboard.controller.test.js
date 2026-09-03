import { jest } from '@jest/globals';

const serviceMock = {
  getDashboardData: jest.fn(),
  getResumeHealth: jest.fn(),
};
const cacheMock = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
const cacheKeysMock = {
  dashboard: (id) => `dashboard:${id}`,
  userContext: (id) => `context:${id}`,
};

jest.unstable_mockModule('../../src/services/dashboard.service.js', () => ({
  default: serviceMock,
}));
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  cache: cacheMock,
  cacheKeys: cacheKeysMock,
}));
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), debug: jest.fn() },
}));
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({ catchAsync: (fn) => fn }));
jest.unstable_mockModule('../../src/utils/response.js', () => ({
  successResponse: jest.fn((res, data, message) =>
    res.status(200).json({ status: 'success', message, data })
  ),
}));

const controller = await import('../../src/controllers/dashboard.controller.js');
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('dashboard.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('serves dashboard from cache', async () => {
    cacheMock.get.mockResolvedValue({ resumes: 2 });
    const response = res();

    await controller.getDashboard({ user: { id: 'u1' } }, response);

    expect(serviceMock.getDashboardData).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('builds and caches dashboard on cache miss', async () => {
    cacheMock.get.mockResolvedValue(null);
    serviceMock.getDashboardData.mockResolvedValue({ resumes: 3 });
    const response = res();

    await controller.getDashboard({ user: { id: 'u1' } }, response);

    expect(serviceMock.getDashboardData).toHaveBeenCalledWith('u1');
    expect(cacheMock.set).toHaveBeenCalledWith('dashboard:u1', { resumes: 3 }, 300);
  });

  test('returns resume health', async () => {
    serviceMock.getResumeHealth.mockResolvedValue({ score: 85 });
    const response = res();

    await controller.getResumeHealth({ user: { id: 'u1' } }, response);

    expect(serviceMock.getResumeHealth).toHaveBeenCalledWith('u1');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('refreshes dashboard and invalidates caches', async () => {
    serviceMock.getDashboardData.mockResolvedValue({ resumes: 4 });
    const response = res();

    await controller.refreshDashboard({ user: { id: 'u1' } }, response);

    expect(cacheMock.del).toHaveBeenNthCalledWith(1, 'dashboard:u1');
    expect(cacheMock.del).toHaveBeenNthCalledWith(2, 'context:u1');
    expect(cacheMock.set).toHaveBeenCalledWith('dashboard:u1', { resumes: 4 }, 300);
  });
});
