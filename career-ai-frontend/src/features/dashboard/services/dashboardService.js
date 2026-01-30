/**
 * Dashboard Service
 * Fetches dashboard data and metrics (DUMMY DATA FOR NOW)
 */

// Simulated delay for realistic API behavior
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get Dashboard Data Service
 * @returns {Promise} - Complete dashboard data
 */
export const getDashboardDataService = async () => {
  await delay(1000); // Simulate network delay

  return {
    // Resume Health Metrics
    resumeHealth: {
      atsScore: 72,
      breakdown: {
        keywordMatch: 68,
        skillCoverage: 75,
        formattingScore: 80,
      },
      lastUpdated: new Date('2024-01-20').toISOString(),
      version: 1,
      topIssues: [
        {
          id: 1,
          severity: 'high',
          title: 'Missing Keywords',
          description: 'Add 5 key skills: React, TypeScript, GraphQL, Docker, AWS',
          category: 'keywords',
        },
        {
          id: 2,
          severity: 'medium',
          title: 'Weak Action Verbs',
          description: '8 bullet points could use stronger verbs',
          category: 'content',
        },
        {
          id: 3,
          severity: 'low',
          title: 'Formatting Issues',
          description: 'Inconsistent spacing in work experience section',
          category: 'formatting',
        },
      ],
    },

    // Skill Gap Metrics
    skillGap: {
      totalGaps: 12,
      critical: 5,
      important: 4,
      optional: 3,
      coreSkills: [
        { skill: 'React', status: 'strong', proficiency: 85 },
        { skill: 'TypeScript', status: 'missing', proficiency: 0 },
        { skill: 'Node.js', status: 'weak', proficiency: 45 },
        { skill: 'GraphQL', status: 'missing', proficiency: 0 },
        { skill: 'AWS', status: 'weak', proficiency: 30 },
      ],
      prioritySkills: [
        { skill: 'TypeScript', priority: 'high', timeToLearn: '4 weeks' },
        { skill: 'GraphQL', priority: 'high', timeToLearn: '3 weeks' },
        { skill: 'Docker', priority: 'medium', timeToLearn: '2 weeks' },
      ],
    },

    // Learning Progress
    learningProgress: {
      currentPhase: 'Week 2: TypeScript Fundamentals',
      completedSkills: 2,
      totalSkills: 12,
      progressPercentage: 17,
      currentSkill: {
        name: 'TypeScript',
        topic: 'Advanced Types & Generics',
        progress: 60,
        dueDate: new Date('2024-02-05').toISOString(),
      },
      weeklyStreak: 5,
      totalHoursLearned: 18,
      upcomingMilestones: [
        { skill: 'TypeScript', milestone: 'Complete basics', dueDate: '2024-02-05' },
        { skill: 'GraphQL', milestone: 'Start fundamentals', dueDate: '2024-02-12' },
      ],
    },

    // Next Action Recommendation
    nextAction: {
      type: 'fix_resume',
      priority: 'high',
      title: 'Fix Critical Resume Issues',
      description: 'Your ATS score is at 72%. Add missing keywords to reach 85%+',
      actionLabel: 'Fix Issues Now',
      actionRoute: '/resume/issues',
      estimatedTime: '10 minutes',
      impact: 'High - Improves interview chances by 40%',
    },

    // Overall Stats
    stats: {
      atsScore: 72,
      skillsLearning: 2,
      completedTasks: 8,
      jobMatches: 24,
      profileCompletion: 75,
      daysActive: 12,
    },

    // Recent Activity
    recentActivity: [
      {
        id: 1,
        type: 'skill_started',
        title: 'Started learning TypeScript',
        timestamp: new Date('2024-01-28').toISOString(),
      },
      {
        id: 2,
        type: 'resume_updated',
        title: 'Updated resume with new project',
        timestamp: new Date('2024-01-26').toISOString(),
      },
      {
        id: 3,
        type: 'milestone_completed',
        title: 'Completed React Advanced Patterns',
        timestamp: new Date('2024-01-25').toISOString(),
      },
    ],

    // Job Matches Preview
    jobMatchesPreview: [
      {
        id: 1,
        title: 'Senior Frontend Developer',
        company: 'Google',
        matchScore: 85,
        readiness: 'apply_now',
        location: 'Remote',
      },
      {
        id: 2,
        title: 'Full Stack Engineer',
        company: 'Microsoft',
        matchScore: 72,
        readiness: 'apply_after_30_days',
        location: 'Seattle, WA',
      },
      {
        id: 3,
        title: 'React Developer',
        company: 'Meta',
        matchScore: 68,
        readiness: 'apply_after_60_days',
        location: 'New York, NY',
      },
    ],
  };
};

/**
 * Get Quick Stats Service
 * @returns {Promise} - Quick stats summary
 */
export const getQuickStatsService = async () => {
  await delay(300);

  return {
    atsScore: 72,
    skillGaps: 12,
    learningProgress: 17,
    jobMatches: 24,
  };
};