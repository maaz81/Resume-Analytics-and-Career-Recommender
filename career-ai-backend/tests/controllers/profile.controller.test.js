import { jest } from '@jest/globals';

const userMock = {
  getPersonalInfo: jest.fn(),
};

jest.unstable_mockModule('../../src/models/User.js', () => ({
  default: userMock,
}));

jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({
  catchAsync: (fn) => fn,
}));

const { personalInformation } = await import('../../src/controllers/profile.controller.js');

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('profile.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns personal information for authenticated user', async () => {
    const res = mockRes();
    userMock.getPersonalInfo.mockResolvedValue({
      full_name: 'John Doe',
      email: 'john@example.com',
      target_role: 'Backend Developer',
    });

    await personalInformation({ user: { id: 'u1' } }, res);

    expect(userMock.getPersonalInfo).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({ email: 'john@example.com' }),
    });
  });

  test('returns 404 when user is not found', async () => {
    const res = mockRes();
    userMock.getPersonalInfo.mockResolvedValue(null);

    await personalInformation({ user: { id: 'missing' } }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not found',
    });
  });
});
