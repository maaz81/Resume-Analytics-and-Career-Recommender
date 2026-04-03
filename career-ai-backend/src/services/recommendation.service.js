// ============================================
// services/recommendation.service.js
// YouTube Data API + static recommendations
// ============================================

import config from '../config/env.js';
import logger from '../config/logger.js';

const YOUTUBE_API_KEY = config.youtube?.apiKey || process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// ─── Level icons & tag colors ────────────────────────────────────────────────

const LEVEL_META = {
    beginner: {
        tag: 'Beginner',
        tagColor: 'bg-status-success-light text-status-success-dark',
        icon: '📗',
    },
    intermediate: {
        tag: 'Intermediate',
        tagColor: 'bg-status-info-light text-status-info-dark',
        icon: '📘',
    },
    advanced: {
        tag: 'Advanced',
        tagColor: 'bg-status-warning-light text-status-warning-dark',
        icon: '📕',
    },
};

/**
 * Guess a difficulty level from a video title/description
 */
function guessLevel(text) {
    const lower = (text || '').toLowerCase();
    if (/advanced|expert|master(y|class)|pro level|in[- ]depth/i.test(lower)) return 'advanced';
    if (/intermediate|mid[- ]level|beyond basics/i.test(lower)) return 'intermediate';
    return 'beginner'; // default
}

/**
 * Search YouTube for course videos
 * @param {string} query - search query  (e.g. "react course")
 * @param {number} maxResults - max videos to return (1-50)
 * @returns {Promise<Array>} courses shaped for the frontend CourseCard
 */
export async function fetchYouTubeCourses(query = 'programming course', maxResults = 12) {
    if (!YOUTUBE_API_KEY) {
        logger.warn('YOUTUBE_API_KEY not set – returning empty courses');
        return [];
    }

    const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        videoDuration: 'long',      // prefer full-length tutorials
        relevanceLanguage: 'en',
        maxResults: String(Math.min(maxResults, 50)),
        key: YOUTUBE_API_KEY,
    });

    const url = `${YOUTUBE_SEARCH_URL}?${params}`;
    logger.info(`[YouTube] Fetching: ${query} (max ${maxResults})`);

    const response = await fetch(url);

    if (!response.ok) {
        const body = await response.text();
        logger.error(`[YouTube] API error ${response.status}: ${body}`);
        throw new Error(`YouTube API returned ${response.status}`);
    }

    const data = await response.json();

    // Map to frontend shape
    const courses = (data.items || []).map((item, index) => {
        const { snippet } = item;
        const level = guessLevel(`${snippet.title} ${snippet.description}`);
        const meta = LEVEL_META[level];

        return {
            id: item.id?.videoId || `yt-${index}`,
            tag: meta.tag,
            tagColor: meta.tagColor,
            title: snippet.title,
            description: snippet.description?.slice(0, 120) + '…',
            lessons: null,          // YouTube doesn't provide lesson count
            hours: null,            // unknown duration from search endpoint
            level: meta.tag,
            icon: meta.icon,
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || '',
            channelTitle: snippet.channelTitle,
            publishedAt: snippet.publishedAt,
            videoUrl: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
        };
    });

    return courses;
}

// ─── Static data for Projects / Roadmap / Jobs ──────────────────────────────

export const defaultProjects = [
    {
        id: 1,
        title: 'Full-Stack E-Commerce',
        description: 'Build a production-ready store with cart, payments (Stripe), auth, and admin dashboard.',
        stack: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        difficulty: 'Advanced',
        color: 'border-l-brand-accent',
        accent: '#FF8C42',
    },
    {
        id: 2,
        title: 'Real-Time Chat App',
        description: 'WebSocket-powered chat with rooms, DMs, typing indicators, and file sharing.',
        stack: ['React', 'Socket.io', 'Express', 'Redis'],
        difficulty: 'Intermediate',
        color: 'border-l-brand-primary',
        accent: '#3F76FF',
    },
    {
        id: 3,
        title: 'AI Content Dashboard',
        description: 'Integrate OpenAI API to generate, edit, and manage AI-assisted content at scale.',
        stack: ['Next.js', 'OpenAI', 'Prisma', 'Tailwind'],
        difficulty: 'Intermediate',
        color: 'border-l-status-success',
        accent: '#16A34A',
    },
    {
        id: 4,
        title: 'DevOps Monitoring Stack',
        description: 'Set up Prometheus, Grafana, and alerting for a Node.js microservices cluster.',
        stack: ['Docker', 'Prometheus', 'Grafana', 'Node.js'],
        difficulty: 'Advanced',
        color: 'border-l-status-error',
        accent: '#EF4444',
    },
];

export const defaultRoadmapSteps = [
    {
        phase: 'Phase 1',
        title: 'Web Foundations',
        duration: '4 weeks',
        items: ['HTML5 & CSS3', 'JavaScript ES6+', 'Git & GitHub', 'Command Line Basics'],
    },
    {
        phase: 'Phase 2',
        title: 'Frontend Development',
        duration: '6 weeks',
        items: ['React.js', 'TypeScript', 'State Management', 'REST APIs & Fetch'],
    },
    {
        phase: 'Phase 3',
        title: 'Backend Development',
        duration: '6 weeks',
        items: ['Node.js & Express', 'PostgreSQL', 'Authentication (JWT)', 'API Design'],
    },
    {
        phase: 'Phase 4',
        title: 'Full-Stack Projects',
        duration: '4 weeks',
        items: ['E-Commerce App', 'Real-Time Features', 'Testing & QA', 'Deployment'],
    },
    {
        phase: 'Phase 5',
        title: 'DevOps & Scale',
        duration: '4 weeks',
        items: ['Docker & Kubernetes', 'CI/CD Pipelines', 'Monitoring', 'System Design'],
    },
];

export const defaultJobs = [
    {
        id: 1,
        title: 'Senior Frontend Engineer',
        company: 'Stripe',
        location: 'Remote',
        type: 'Full-time',
        salary: '$140k – $180k',
        tags: ['React', 'TypeScript', 'GraphQL'],
        posted: '2 days ago',
        logo: 'S',
        logoColor: 'bg-[#635BFF] text-white',
    },
    {
        id: 2,
        title: 'Node.js Backend Developer',
        company: 'Vercel',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$130k – $170k',
        tags: ['Node.js', 'PostgreSQL', 'AWS'],
        posted: '1 day ago',
        logo: 'V',
        logoColor: 'bg-surface-dark text-text-inverse',
    },
    {
        id: 3,
        title: 'Full-Stack Engineer',
        company: 'Linear',
        location: 'Remote',
        type: 'Full-time',
        salary: '$120k – $160k',
        tags: ['React', 'Node.js', 'Prisma'],
        posted: '3 days ago',
        logo: 'L',
        logoColor: 'bg-brand-primary text-white',
    },
    {
        id: 4,
        title: 'React Native Developer',
        company: 'Notion',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$125k – $155k',
        tags: ['React Native', 'TypeScript', 'Redux'],
        posted: '5 days ago',
        logo: 'N',
        logoColor: 'bg-text-primary text-text-inverse',
    },
    {
        id: 5,
        title: 'DevOps / Platform Engineer',
        company: 'PlanetScale',
        location: 'Remote',
        type: 'Contract',
        salary: '$95/hr',
        tags: ['Docker', 'Kubernetes', 'CI/CD'],
        posted: '1 week ago',
        logo: 'P',
        logoColor: 'bg-brand-accent text-white',
    },
];
