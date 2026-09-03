import { jest } from '@jest/globals';

const userMock = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateLastLogin: jest.fn(),
  update: jest.fn(),
  verifyPassword: jest.fn(),
  changePassword: jest.fn(),
  setPasswordResetToken: jest.fn(),
  findByPasswordResetToken: jest.fn(),
};

const auditMock = { create: jest.fn() };
const cacheMock = { get: jest.fn(), set: jest.fn(), del: jest.fn(), delPattern: jest.fn() };
const jwtMock = { generateTokens: jest.fn(), verifyRefreshToken: jest.fn() };
const emailMock = { sendPasswordResetEmail: jest.fn() };

jest.unstable_mockModule('../../src/models/User.js', () => ({ default: userMock }));
jest.unstable_mockModule('../../src/models/AuditLog.js', () => ({ default: auditMock }));
jest.unstable_mockModule('../../src/utils/jwt.js', () => jwtMock);
jest.unstable_mockModule('../../src/services/email.service.js', () => emailMock);
jest.unstable_mockModule('../../src/config/redis.js', () => ({
  cache: cacheMock,
  cacheKeys: {
    user: (id) => `user:${id}`,
    userContext: (id) => `context:${id}`,
  },
}));
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn() },
}));
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({
  catchAsync: (fn) => fn,
  errors: {
    badRequest: (message) => Object.assign(new Error(message), { statusCode: 400 }),
    unauthorized: (message) => Object.assign(new Error(message), { statusCode: 401 }),
    conflict: (message) => Object.assign(new Error(message), { statusCode: 409 }),
    notFound: (message) => Object.assign(new Error(message), { statusCode: 404 }),
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

const controller = await import('../../src/controllers/auth.controller.js');

const res = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  redirect: jest.fn(),
  get: jest.fn().mockReturnValue('jest-agent'),
});

describe('auth.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('register creates user and returns tokens', async () => {
    userMock.findByEmail.mockResolvedValue(null);
    userMock.create.mockResolvedValue({
      id: 'u1',
      email: 'john@example.com',
      full_name: 'John Doe',
      target_role: 'Backend Developer',
    });
    jwtMock.generateTokens.mockReturnValue({ accessToken: 'a', refreshToken: 'r' });

    const response = res();

    await controller.register({
      body: {
        email: 'john@example.com',
        password: 'Password123',
        fullName: 'John Doe',
        targetRole: 'Backend Developer',
      },
    }, response);

    expect(userMock.create).toHaveBeenCalled();
    expect(auditMock.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'u1',
      action: 'user.registered',
    }));
    expect(response.status).toHaveBeenCalledWith(201);
  });

  test('register rejects duplicate user', async () => {
    userMock.findByEmail.mockResolvedValue({ id: 'u1' });

    await expect(controller.register({
      body: { email: 'john@example.com', password: 'Password123', fullName: 'John Doe' },
    }, res())).rejects.toMatchObject({ statusCode: 409 });
  });

  test('login rejects unknown user', async () => {
    userMock.findByEmail.mockResolvedValue(null);

    await expect(controller.login({
      body: { email: 'missing@example.com', password: 'Password123' },
    }, res())).rejects.toMatchObject({ statusCode: 401 });
  });

  test('login succeeds with valid credentials', async () => {
    userMock.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'john@example.com',
      full_name: 'John Doe',
      current_role: 'Developer',
      target_role: 'Backend Developer',
      is_active: true,
      password_hash: 'hash',
    });
    userMock.verifyPassword.mockResolvedValue(true);
    jwtMock.generateTokens.mockReturnValue({ accessToken: 'a', refreshToken: 'r' });

    const response = res();

    await controller.login({
      ip: '127.0.0.1',
      get: () => 'jest-agent',
      body: { email: 'john@example.com', password: 'Password123' },
    }, response);

    expect(userMock.updateLastLogin).toHaveBeenCalledWith('u1');
    expect(cacheMock.set).toHaveBeenCalled();
    expect(auditMock.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'user.login' }));
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('login rejects inactive user', async () => {
    userMock.findByEmail.mockResolvedValue({ is_active: false });

    await expect(controller.login({
      body: { email: 'x@example.com', password: 'Password123' },
    }, res())).rejects.toMatchObject({ statusCode: 401 });
  });

  test('getMe returns cached user', async () => {
    cacheMock.get.mockResolvedValue({ id: 'u1', email: 'john@example.com' });
    const response = res();

    await controller.getMe({ user: { id: 'u1' } }, response);

    expect(userMock.findById).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('getMe loads and caches user on cache miss', async () => {
    cacheMock.get.mockResolvedValue(null);
    userMock.findById.mockResolvedValue({ id: 'u1', email: 'john@example.com' });

    await controller.getMe({ user: { id: 'u1' } }, res());

    expect(userMock.findById).toHaveBeenCalledWith('u1');
    expect(cacheMock.set).toHaveBeenCalledWith(
      'user:u1',
      expect.objectContaining({ id: 'u1' }),
      3600
    );
  });

  test('updateProfile maps camelCase fields', async () => {
    userMock.update.mockResolvedValue({ id: 'u1', full_name: 'Jane Doe' });
    const response = res();

    await controller.updateProfile({
      user: { id: 'u1' },
      body: { fullName: 'Jane Doe', targetRole: 'Backend Developer', ignored: 'x' },
    }, response);

    expect(userMock.update).toHaveBeenCalledWith('u1', {
      full_name: 'Jane Doe',
      target_role: 'Backend Developer',
    });
    expect(cacheMock.del).toHaveBeenCalledWith('user:u1');
  });

  test('updateProfile rejects when no valid fields exist', async () => {
    userMock.update.mockResolvedValue(null);

    await expect(controller.updateProfile({
      user: { id: 'u1' },
      body: { ignored: 'x' },
    }, res())).rejects.toMatchObject({ statusCode: 400 });
  });

  test('changePassword rejects wrong current password', async () => {
    userMock.findByEmail.mockResolvedValue({ id: 'u1', password_hash: 'hash' });
    userMock.verifyPassword.mockResolvedValue(false);

    await expect(controller.changePassword({
      user: { id: 'u1', email: 'john@example.com' },
      body: { currentPassword: 'old', newPassword: 'NewPassword123' },
    }, res())).rejects.toMatchObject({ statusCode: 401 });
  });

  test('refreshToken rejects missing token', async () => {
    await expect(controller.refreshToken({ body: {} }, res()))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  test('refreshToken succeeds with valid token', async () => {
    jwtMock.verifyRefreshToken.mockReturnValue({ id: 'u1' });
    userMock.findById.mockResolvedValue({ id: 'u1', is_active: true });
    jwtMock.generateTokens.mockReturnValue({ accessToken: 'a2', refreshToken: 'r2' });
    const response = res();

    await controller.refreshToken({ body: { refreshToken: 'r' } }, response);

    expect(jwtMock.verifyRefreshToken).toHaveBeenCalledWith('r');
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('logout clears caches and writes audit log', async () => {
    const response = res();

    await controller.logout({ user: { id: 'u1' } }, response);

    expect(cacheMock.del).toHaveBeenCalledWith('user:u1');
    expect(cacheMock.del).toHaveBeenCalledWith('context:u1');
    expect(auditMock.create).toHaveBeenCalledWith({ userId: 'u1', action: 'user.logout' });
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('oauthSuccess redirects with access token', async () => {
    jwtMock.generateTokens.mockReturnValue({ accessToken: 'oauth-token' });
    const response = res();

    await controller.oauthSuccess({ user: { id: 'u1' } }, response);

    expect(response.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/oauth-success?token=oauth-token')
    );
  });

  test('resetPassword rejects missing token/password', async () => {
    await expect(controller.resetPassword({ body: {} }, res()))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  test('resetPassword rejects invalid token', async () => {
    userMock.findByPasswordResetToken.mockResolvedValue(null);

    await expect(controller.resetPassword({
      body: { token: 'bad', newPassword: 'Password123' },
    }, res())).rejects.toMatchObject({ statusCode: 400 });
  });

  test('resetPassword changes password for valid token', async () => {
    userMock.findByPasswordResetToken.mockResolvedValue({ id: 'u1' });
    const response = res();

    await controller.resetPassword({
      body: { token: 'valid', newPassword: 'Password123' },
    }, response);

    expect(userMock.changePassword).toHaveBeenCalledWith('u1', 'Password123');
    expect(cacheMock.delPattern).toHaveBeenCalledWith('session:u1:*');
    expect(cacheMock.del).toHaveBeenCalledWith('user:u1');
    expect(auditMock.create).toHaveBeenCalledWith({ userId: 'u1', action: 'user.password_reset' });
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
