import { jest } from '@jest/globals';

const resumeMock = { findActiveByUserId: jest.fn() };
const conversationMock = {
  getHistory: jest.fn(),
  findOrCreate: jest.fn(),
  saveMessagePair: jest.fn(),
};
const aiServiceMock = { getCareerAdvice: jest.fn() };

jest.unstable_mockModule('../../src/models/Resume.js', () => ({ default: resumeMock }));
jest.unstable_mockModule('../../src/models/AiConversation.js', () => ({ default: conversationMock }));
jest.unstable_mockModule('../../src/services/ai.service.js', () => aiServiceMock);
jest.unstable_mockModule('../../src/middleware/errorHandler.js', () => ({
  catchAsync: (fn) => fn,
  errors: {
    badRequest: (message) => Object.assign(new Error(message), { statusCode: 400 }),
  },
}));
jest.unstable_mockModule('../../src/utils/response.js', () => ({
  successResponse: jest.fn((res, data, message) =>
    res.status(200).json({ status: 'success', message, data })
  ),
}));

const controller = await import('../../src/controllers/ai.controller.js');

const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() });

describe('ai.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects missing message', async () => {
    await expect(
      controller.chat({ body: {}, user: { id: 'u1' } }, res())
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('generates and saves AI response', async () => {
    resumeMock.findActiveByUserId.mockResolvedValue({ parsing_status: 'completed' });
    conversationMock.findOrCreate.mockResolvedValue('c1');
    conversationMock.saveMessagePair.mockResolvedValue(undefined);
    aiServiceMock.getCareerAdvice.mockResolvedValue({
      reply: 'Focus on Node.js and system design.',
      suggestions: ['Build an API'],
    });

    const response = res();

    await controller.chat({
      body: { message: 'How do I improve?' },
      user: {
        id: 'u1',
        target_role: 'Backend Developer',
        current_role: 'Developer',
        years_of_experience: 2,
      },
    }, response);

    expect(aiServiceMock.getCareerAdvice).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', hasResume: true, resumeParsed: true }),
      'How do I improve?',
      []
    );
    expect(conversationMock.saveMessagePair).toHaveBeenCalledWith(
      'c1',
      'u1',
      'How do I improve?',
      'Focus on Node.js and system design.'
    );
    expect(response.status).toHaveBeenCalledWith(200);
  });

  test('loads history when conversationId is supplied', async () => {
    resumeMock.findActiveByUserId.mockResolvedValue(null);
    conversationMock.getHistory.mockResolvedValue([{ role: 'user', content: 'Hi' }]);
    conversationMock.findOrCreate.mockResolvedValue('c2');
    aiServiceMock.getCareerAdvice.mockResolvedValue({ reply: 'Hello' });

    await controller.chat({
      body: { message: 'Continue', conversationId: 'c2' },
      user: { id: 'u1' },
    }, res());

    expect(conversationMock.getHistory).toHaveBeenCalledWith('c2');
    expect(aiServiceMock.getCareerAdvice).toHaveBeenCalledWith(
      expect.objectContaining({ hasResume: false, resumeParsed: false }),
      'Continue',
      [{ role: 'user', content: 'Hi' }]
    );
  });

  test('getConversation returns conversation history', async () => {
    conversationMock.getHistory.mockResolvedValue([{ role: 'assistant', content: 'Hi' }]);
    const response = res();

    await controller.getConversation({ params: { id: 'c1' } }, response);

    expect(conversationMock.getHistory).toHaveBeenCalledWith('c1', 50);
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
