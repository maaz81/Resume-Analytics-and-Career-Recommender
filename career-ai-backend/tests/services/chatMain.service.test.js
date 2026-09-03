import { jest } from '@jest/globals';

const db = { query: jest.fn() };
const logger = { info: jest.fn() };
const create = jest.fn();

class OpenAIMock {
  constructor() {
    this.chat = { completions: { create } };
  }
}

jest.unstable_mockModule('../../src/config/db.js', () => db);
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: logger }));
jest.unstable_mockModule('openai', () => ({ default: OpenAIMock }));

const chat = await import('../../src/services/chatMain.service.js');

describe('chatMain.service', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a conversation', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 'c1', user_id: 'u1' }] });

    await expect(chat.createConversation('u1')).resolves.toEqual({ id: 'c1', user_id: 'u1' });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO ai_conversations'), ['u1']);
  });

  test('gets user conversations', async () => {
    db.query.mockResolvedValue({ rows: [{ id: 'c1', message_count: '2' }] });
    await expect(chat.getUserConversations('u1')).resolves.toEqual([{ id: 'c1', message_count: '2' }]);
  });

  test('gets conversation history and verifies ownership', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ role: 'user', content: 'Hi' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'c1' }] });

    await expect(chat.getConversationHistory('c1')).resolves.toEqual([{ role: 'user', content: 'Hi' }]);
    await expect(chat.verifyConversationOwner('c1', 'u1')).resolves.toBe(true);
    expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('user_id = $2'), ['c1', 'u1']);
  });

  test('returns false when conversation is not owned by the user', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await expect(chat.verifyConversationOwner('c1', 'u2')).resolves.toBe(false);
  });

  test('saves a message and updates conversation counters', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 'm1', role: 'user' }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(chat.saveMessage('c1', 'u1', 'user', 'Hello')).resolves.toEqual({ id: 'm1', role: 'user' });
    expect(db.query).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE ai_conversations'), ['c1']);
  });

  test('sendMessage loads history, saves both messages and returns the AI message', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ role: 'user', content: 'Previous' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'm-user' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'm-ai', role: 'assistant', content: 'Hello!' }] })
      .mockResolvedValueOnce({ rows: [] });
    create.mockResolvedValue({ choices: [{ message: { content: 'Hello!' } }] });

    const result = await chat.sendMessage('c1', 'u1', 'New question');

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      model: expect.any(String),
      messages: [
        expect.objectContaining({ role: 'system' }),
        { role: 'user', content: 'Previous' },
        { role: 'user', content: 'New question' },
      ],
    }));
    expect(result).toEqual({ id: 'm-ai', role: 'assistant', content: 'Hello!' });
  });

  test('sendMessageStream emits chunks, saves the complete reply and returns it', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'm-user' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'm-ai' }] })
      .mockResolvedValueOnce({ rows: [] });
    create.mockResolvedValue((async function* () {
      yield { choices: [{ delta: { content: 'Hello ' } }] };
      yield { choices: [{ delta: { content: 'world' } }] };
      yield { choices: [{ delta: {} }] };
    })());

    const chunks = [];
    const result = await chat.sendMessageStream('c1', 'u1', 'Hi', (chunk) => chunks.push(chunk));

    expect(chunks).toEqual(['Hello ', 'world']);
    expect(result).toBe('Hello world');
  });
});
