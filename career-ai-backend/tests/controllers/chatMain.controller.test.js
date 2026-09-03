import { jest } from '@jest/globals';

const serviceMock = {
  createConversation: jest.fn(),
  getUserConversations: jest.fn(),
  getConversationHistory: jest.fn(),
  verifyConversationOwner: jest.fn(),
  sendMessage: jest.fn(),
  sendMessageStream: jest.fn(),
};

jest.unstable_mockModule('../../src/services/chatMain.service.js', () => serviceMock);
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: { error: jest.fn() } }));

const controller = await import('../../src/controllers/chatMain.controller.js');

const res = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  setHeader: jest.fn(),
  flushHeaders: jest.fn(),
  write: jest.fn(),
  end: jest.fn(),
  flush: jest.fn(),
});

describe('chatMain.controller', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates conversation', async () => {
    serviceMock.createConversation.mockResolvedValue({ id: 'c1' });
    const response = res();

    await controller.newConversation({ user: { id: 'u1' } }, response);

    expect(serviceMock.createConversation).toHaveBeenCalledWith('u1');
    expect(response.status).toHaveBeenCalledWith(201);
  });

  test('lists conversations', async () => {
    serviceMock.getUserConversations.mockResolvedValue([{ id: 'c1' }]);
    const response = res();

    await controller.listConversations({ user: { id: 'u1' } }, response);

    expect(serviceMock.getUserConversations).toHaveBeenCalledWith('u1');
    expect(response.json).toHaveBeenCalledWith({ conversations: [{ id: 'c1' }] });
  });

  test('getHistory rejects non-owner', async () => {
    serviceMock.verifyConversationOwner.mockResolvedValue(false);
    const response = res();

    await controller.getHistory({ params: { id: 'c1' }, user: { id: 'u2' } }, response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(serviceMock.getConversationHistory).not.toHaveBeenCalled();
  });

  test('chat rejects blank message', async () => {
    const response = res();

    await controller.chat(
      { params: { id: 'c1' }, body: { message: '   ' }, user: { id: 'u1' } },
      response
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  test('chat sends message for owner', async () => {
    serviceMock.verifyConversationOwner.mockResolvedValue(true);
    serviceMock.sendMessage.mockResolvedValue({ id: 'm1' });
    const response = res();

    await controller.chat(
      { params: { id: 'c1' }, body: { message: 'Hello' }, user: { id: 'u1' } },
      response
    );

    expect(serviceMock.sendMessage).toHaveBeenCalledWith('c1', 'u1', 'Hello');
    expect(response.json).toHaveBeenCalledWith({
      message: 'Success',
      aiMessage: { id: 'm1' },
    });
  });

  test('chatStream writes SSE chunks and completes', async () => {
    serviceMock.verifyConversationOwner.mockResolvedValue(true);
    serviceMock.sendMessageStream.mockImplementation(async (id, userId, msg, onChunk) => {
      onChunk('hello');
      onChunk('world');
    });

    const response = res();

    await controller.chatStream(
      { params: { id: 'c1' }, body: { message: 'Hello' }, user: { id: 'u1' } },
      response
    );

    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(response.write).toHaveBeenCalledTimes(3);
    expect(response.end).toHaveBeenCalled();
  });
});
