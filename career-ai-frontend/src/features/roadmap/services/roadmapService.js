/**
 * Roadmap Service
 * Handles learning roadmap and progress tracking (DUMMY DATA FOR NOW)
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get Learning Roadmap Service
 * @returns {Promise} - Complete roadmap data
 */
export const getLearningRoadmapService = async () => {
  await delay(1000);

  return {
    roadmapId: 'roadmap_001',
    targetRole: 'Senior Software Engineer',
    createdAt: new Date('2024-01-15').toISOString(),
    totalDuration: '16 weeks',
    
    // Overall progress
    progress: {
      completedWeeks: 2,
      totalWeeks: 16,
      completedSkills: 2,
      totalSkills: 5,
      overallProgress: 17,
      currentWeek: 2,
      daysActive: 12,
      weeklyStreak: 5,
      totalHoursSpent: 18,
    },

    // Current phase
    currentPhase: {
      id: 'phase_2',
      title: 'TypeScript Fundamentals',
      week: 2,
      status: 'in_progress',
      progress: 60,
      skillName: 'TypeScript',
      topic: 'Advanced Types & Generics',
      startDate: new Date('2024-01-22').toISOString(),
      endDate: new Date('2024-02-05').toISOString(),
      estimatedHours: 15,
      hoursSpent: 9,
    },

    // Roadmap phases (weekly breakdown)
    phases: [
      // Week 1 - Completed
      {
        id: 'phase_1',
        week: 1,
        title: 'TypeScript Basics',
        skillName: 'TypeScript',
        status: 'completed',
        progress: 100,
        startDate: new Date('2024-01-15').toISOString(),
        endDate: new Date('2024-01-21').toISOString(),
        topics: [
          'Setting up TypeScript',
          'Basic Types',
          'Interfaces vs Types',
          'Functions in TypeScript',
        ],
        estimatedHours: 10,
        hoursSpent: 12,
        completedAt: new Date('2024-01-21').toISOString(),
      },
      
      // Week 2 - In Progress
      {
        id: 'phase_2',
        week: 2,
        title: 'TypeScript Fundamentals',
        skillName: 'TypeScript',
        status: 'in_progress',
        progress: 60,
        startDate: new Date('2024-01-22').toISOString(),
        endDate: new Date('2024-02-05').toISOString(),
        topics: [
          'Advanced Types',
          'Generics',
          'Utility Types',
          'Type Guards',
        ],
        estimatedHours: 15,
        hoursSpent: 9,
        completedAt: null,
      },

      // Week 3-4 - Upcoming
      {
        id: 'phase_3',
        week: 3,
        title: 'TypeScript with React',
        skillName: 'TypeScript',
        status: 'locked',
        progress: 0,
        startDate: new Date('2024-02-06').toISOString(),
        endDate: new Date('2024-02-19').toISOString(),
        topics: [
          'React Components with TypeScript',
          'Props & State Typing',
          'Hooks with TypeScript',
          'Context API Typing',
        ],
        estimatedHours: 12,
        hoursSpent: 0,
        completedAt: null,
      },

      // Week 5-6
      {
        id: 'phase_4',
        week: 5,
        title: 'GraphQL Fundamentals',
        skillName: 'GraphQL',
        status: 'locked',
        progress: 0,
        startDate: new Date('2024-02-20').toISOString(),
        endDate: new Date('2024-03-04').toISOString(),
        topics: [
          'GraphQL Basics',
          'Schema Design',
          'Queries & Mutations',
          'Resolvers',
        ],
        estimatedHours: 14,
        hoursSpent: 0,
        completedAt: null,
      },

      // Week 7-8
      {
        id: 'phase_5',
        week: 7,
        title: 'GraphQL Client & Server',
        skillName: 'GraphQL',
        status: 'locked',
        progress: 0,
        startDate: new Date('2024-03-05').toISOString(),
        endDate: new Date('2024-03-18').toISOString(),
        topics: [
          'Apollo Client',
          'Apollo Server',
          'Subscriptions',
          'Error Handling',
        ],
        estimatedHours: 14,
        hoursSpent: 0,
        completedAt: null,
      },
    ],

    // Milestones
    milestones: [
      {
        id: 'milestone_1',
        title: 'Complete TypeScript Basics',
        skillName: 'TypeScript',
        dueDate: new Date('2024-02-05').toISOString(),
        status: 'upcoming',
        description: 'Master TypeScript fundamentals and advanced types',
      },
      {
        id: 'milestone_2',
        title: 'Build TypeScript + React Project',
        skillName: 'TypeScript',
        dueDate: new Date('2024-02-19').toISOString(),
        status: 'upcoming',
        description: 'Create a fully-typed React application',
      },
      {
        id: 'milestone_3',
        title: 'Complete GraphQL Course',
        skillName: 'GraphQL',
        dueDate: new Date('2024-03-18').toISOString(),
        status: 'upcoming',
        description: 'Master GraphQL client and server development',
      },
    ],

    // Recommendations for current phase
    recommendations: {
      nextSteps: [
        'Complete "Advanced Types" module',
        'Practice with TypeScript exercises',
        'Start "Generics" module tomorrow',
      ],
      studyTips: [
        'Spend 1-2 hours daily for consistent progress',
        'Build small projects to reinforce learning',
        'Join TypeScript community for support',
      ],
    },
  };
};

/**
 * Get Roadmap Detail Service
 * @param {string} phaseId - Phase ID
 * @returns {Promise} - Detailed phase information
 */
export const getRoadmapDetailService = async (phaseId) => {
  await delay(800);

  return {
    phase: {
      id: 'phase_2',
      week: 2,
      title: 'TypeScript Fundamentals',
      skillName: 'TypeScript',
      status: 'in_progress',
      progress: 60,
      startDate: new Date('2024-01-22').toISOString(),
      endDate: new Date('2024-02-05').toISOString(),
      estimatedHours: 15,
      hoursSpent: 9,
      description: 'Deep dive into TypeScript\'s type system, generics, and advanced features.',
      
      // Learning objectives
      objectives: [
        'Understand and use advanced type features',
        'Master generics and type constraints',
        'Apply utility types effectively',
        'Implement type guards and narrowing',
      ],

      // Topics with status
      topics: [
        {
          id: 'topic_1',
          title: 'Advanced Types',
          status: 'completed',
          duration: '3 hours',
          completedAt: new Date('2024-01-24').toISOString(),
        },
        {
          id: 'topic_2',
          title: 'Generics',
          status: 'in_progress',
          duration: '4 hours',
          completedAt: null,
        },
        {
          id: 'topic_3',
          title: 'Utility Types',
          status: 'locked',
          duration: '3 hours',
          completedAt: null,
        },
        {
          id: 'topic_4',
          title: 'Type Guards',
          status: 'locked',
          duration: '5 hours',
          completedAt: null,
        },
      ],

      // Resources
      resources: [
        {
          id: 'res_1',
          type: 'video',
          title: 'TypeScript Advanced Types - Complete Guide',
          platform: 'YouTube',
          duration: '2 hours',
          url: '#',
          difficulty: 'intermediate',
          rating: 4.8,
          recommended: true,
        },
        {
          id: 'res_2',
          type: 'article',
          title: 'Mastering TypeScript Generics',
          platform: 'Dev.to',
          duration: '15 min read',
          url: '#',
          difficulty: 'intermediate',
          rating: 4.6,
          recommended: true,
        },
        {
          id: 'res_3',
          type: 'course',
          title: 'Advanced TypeScript Patterns',
          platform: 'Udemy',
          duration: '8 hours',
          url: '#',
          difficulty: 'advanced',
          rating: 4.9,
          recommended: false,
        },
        {
          id: 'res_4',
          type: 'practice',
          title: 'TypeScript Exercises',
          platform: 'TypeScript Exercises',
          duration: 'Variable',
          url: '#',
          difficulty: 'all_levels',
          rating: 4.7,
          recommended: true,
        },
        {
          id: 'res_5',
          type: 'documentation',
          title: 'Official TypeScript Handbook',
          platform: 'TypeScript Docs',
          duration: 'Reference',
          url: '#',
          difficulty: 'all_levels',
          rating: 5.0,
          recommended: true,
        },
      ],

      // Practice exercises
      exercises: [
        {
          id: 'ex_1',
          title: 'Build a Generic Data Fetcher',
          difficulty: 'medium',
          estimatedTime: '45 min',
          status: 'not_started',
        },
        {
          id: 'ex_2',
          title: 'Implement Type-Safe Event Emitter',
          difficulty: 'hard',
          estimatedTime: '1 hour',
          status: 'not_started',
        },
      ],

      // Prerequisites check
      prerequisites: [
        { skill: 'JavaScript ES6+', status: 'completed' },
        { skill: 'TypeScript Basics', status: 'completed' },
      ],
    },
  };
};

/**
 * Update Phase Progress Service
 * @param {string} phaseId - Phase ID
 * @param {number} progress - Progress percentage
 * @returns {Promise} - Updated phase
 */
export const updatePhaseProgressService = async (phaseId, progress) => {
  await delay(500);

  return {
    success: true,
    phaseId,
    progress,
    message: 'Progress updated successfully',
  };
};

/**
 * Mark Topic Complete Service
 * @param {string} topicId - Topic ID
 * @returns {Promise} - Success response
 */
export const markTopicCompleteService = async (topicId) => {
  await delay(300);

  return {
    success: true,
    topicId,
    completedAt: new Date().toISOString(),
    message: 'Topic marked as complete',
  };
};