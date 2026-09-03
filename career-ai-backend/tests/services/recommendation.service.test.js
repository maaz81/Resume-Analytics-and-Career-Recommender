import { jest } from '@jest/globals';

const logger = { warn: jest.fn(), error: jest.fn(), info: jest.fn() };
jest.unstable_mockModule('../../src/config/env.js', () => ({ default: { youtube: { apiKey: 'test-key' } } }));
jest.unstable_mockModule('../../src/config/logger.js', () => ({ default: logger }));

const recommendation = await import('../../src/services/recommendation.service.js');

describe('recommendation.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  test('maps YouTube results and infers difficulty level', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [
        {
          id: { videoId: 'abc' },
          snippet: {
            title: 'Advanced Node.js Masterclass',
            description: 'A'.repeat(200),
            thumbnails: { high: { url: 'https://img/high.jpg' } },
            channelTitle: 'Tech Channel',
            publishedAt: '2026-01-01',
          },
        },
      ] }),
    });

    const result = await recommendation.fetchYouTubeCourses('node course', 5);

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('maxResults=5'));
    expect(result).toEqual([expect.objectContaining({
      id: 'abc',
      tag: 'Advanced',
      level: 'Advanced',
      title: 'Advanced Node.js Masterclass',
      channelTitle: 'Tech Channel',
      thumbnail: 'https://img/high.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=abc',
    })]);
    expect(result[0].description).toHaveLength(121);
  });

  test('caps YouTube maxResults at 50', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ items: [] }) });
    await recommendation.fetchYouTubeCourses('react', 100);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('maxResults=50'));
  });

  test('throws a useful error when YouTube API fails', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 403, text: async () => 'Forbidden' });
    await expect(recommendation.fetchYouTubeCourses('react')).rejects.toThrow('YouTube API returned 403');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Forbidden'));
  });

  test('exports static recommendation data', () => {
    expect(recommendation.defaultProjects.length).toBeGreaterThan(0);
    expect(recommendation.defaultRoadmapSteps.length).toBe(5);
    expect(recommendation.defaultJobs.length).toBe(5);
  });
});
