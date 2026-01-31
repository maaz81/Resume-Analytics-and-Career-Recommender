/**
 * Skills Service
 * Handles skill gap analysis and recommendations (DUMMY DATA FOR NOW)
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get Skill Gap Analysis Service
 * @returns {Promise} - Complete skill gap data
 */
export const getSkillGapAnalysisService = async () => {
  await delay(1000);

  return {
    targetRole: 'Senior Software Engineer',
    analysisDate: new Date().toISOString(),
    
    // Summary metrics
    summary: {
      totalSkillsRequired: 25,
      skillsMatched: 13,
      skillsWeak: 6,
      skillsMissing: 6,
      overallMatch: 52,
      estimatedTimeToReady: '12-16 weeks',
    },

    // Skills categorized by type
    skillsByCategory: {
      core: [
        {
          id: 1,
          name: 'React',
          status: 'strong',
          userLevel: 'advanced',
          requiredLevel: 'advanced',
          proficiency: 85,
          yearsExperience: 4,
          lastUsed: '2024-01-25',
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 2,
          name: 'TypeScript',
          status: 'missing',
          userLevel: null,
          requiredLevel: 'intermediate',
          proficiency: 0,
          yearsExperience: 0,
          lastUsed: null,
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 3,
          name: 'Node.js',
          status: 'weak',
          userLevel: 'beginner',
          requiredLevel: 'intermediate',
          proficiency: 45,
          yearsExperience: 1,
          lastUsed: '2024-01-10',
          inDemand: true,
          trendingUp: false,
        },
        {
          id: 4,
          name: 'GraphQL',
          status: 'missing',
          userLevel: null,
          requiredLevel: 'intermediate',
          proficiency: 0,
          yearsExperience: 0,
          lastUsed: null,
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 5,
          name: 'PostgreSQL',
          status: 'weak',
          userLevel: 'beginner',
          requiredLevel: 'intermediate',
          proficiency: 40,
          yearsExperience: 2,
          lastUsed: '2023-12-15',
          inDemand: true,
          trendingUp: false,
        },
        {
          id: 6,
          name: 'REST APIs',
          status: 'strong',
          userLevel: 'advanced',
          requiredLevel: 'advanced',
          proficiency: 80,
          yearsExperience: 5,
          lastUsed: '2024-01-28',
          inDemand: true,
          trendingUp: false,
        },
      ],
      
      niceToHave: [
        {
          id: 7,
          name: 'Docker',
          status: 'missing',
          userLevel: null,
          requiredLevel: 'beginner',
          proficiency: 0,
          yearsExperience: 0,
          lastUsed: null,
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 8,
          name: 'Kubernetes',
          status: 'missing',
          userLevel: null,
          requiredLevel: 'beginner',
          proficiency: 0,
          yearsExperience: 0,
          lastUsed: null,
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 9,
          name: 'Redis',
          status: 'weak',
          userLevel: 'beginner',
          requiredLevel: 'beginner',
          proficiency: 30,
          yearsExperience: 0.5,
          lastUsed: '2023-11-20',
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 10,
          name: 'AWS Lambda',
          status: 'missing',
          userLevel: null,
          requiredLevel: 'beginner',
          proficiency: 0,
          yearsExperience: 0,
          lastUsed: null,
          inDemand: true,
          trendingUp: true,
        },
      ],
      
      emerging: [
        {
          id: 11,
          name: 'Next.js',
          status: 'missing',
          userLevel: null,
          requiredLevel: 'beginner',
          proficiency: 0,
          yearsExperience: 0,
          lastUsed: null,
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 12,
          name: 'Tailwind CSS',
          status: 'strong',
          userLevel: 'intermediate',
          requiredLevel: 'beginner',
          proficiency: 70,
          yearsExperience: 1,
          lastUsed: '2024-01-29',
          inDemand: true,
          trendingUp: true,
        },
        {
          id: 13,
          name: 'tRPC',
          status: 'missing',
          userLevel: null,
          requiredLevel: 'beginner',
          proficiency: 0,
          yearsExperience: 0,
          lastUsed: null,
          inDemand: false,
          trendingUp: true,
        },
      ],
    },

    // Priority-ranked skills to learn
    prioritySkills: [
      {
        id: 2,
        name: 'TypeScript',
        priority: 'critical',
        category: 'core',
        reasoning: 'Required for 95% of Senior Engineer roles. Essential for type safety and team collaboration.',
        impact: 'High - Increases job matches by 40%',
        timeToLearn: '4-6 weeks',
        difficulty: 'medium',
        prerequisites: ['JavaScript'],
        learningPath: [
          'TypeScript Basics',
          'Type System',
          'Generics',
          'Advanced Types',
          'React + TypeScript',
        ],
        resources: 3,
        marketDemand: 95,
      },
      {
        id: 4,
        name: 'GraphQL',
        priority: 'high',
        category: 'core',
        reasoning: 'Modern API technology replacing REST in many companies. Critical for full-stack roles.',
        impact: 'High - Increases job matches by 25%',
        timeToLearn: '3-4 weeks',
        difficulty: 'medium',
        prerequisites: ['REST APIs', 'Node.js'],
        learningPath: [
          'GraphQL Fundamentals',
          'Schema Design',
          'Queries & Mutations',
          'Apollo Client',
          'GraphQL Server',
        ],
        resources: 4,
        marketDemand: 78,
      },
      {
        id: 3,
        name: 'Node.js',
        priority: 'high',
        category: 'core',
        reasoning: 'You have basic knowledge but need intermediate skills for backend development.',
        impact: 'Medium - Strengthens backend capabilities',
        timeToLearn: '6-8 weeks',
        difficulty: 'medium',
        prerequisites: ['JavaScript'],
        learningPath: [
          'Node.js Fundamentals (Review)',
          'Express.js',
          'Async Patterns',
          'Database Integration',
          'Authentication',
        ],
        resources: 5,
        marketDemand: 88,
      },
      {
        id: 7,
        name: 'Docker',
        priority: 'medium',
        category: 'niceToHave',
        reasoning: 'DevOps skill increasingly expected from senior engineers. Improves deployment knowledge.',
        impact: 'Medium - Shows DevOps awareness',
        timeToLearn: '2-3 weeks',
        difficulty: 'easy',
        prerequisites: ['Linux basics'],
        learningPath: [
          'Docker Basics',
          'Containerization',
          'Docker Compose',
          'Multi-stage Builds',
        ],
        resources: 3,
        marketDemand: 72,
      },
      {
        id: 5,
        name: 'PostgreSQL',
        priority: 'medium',
        category: 'core',
        reasoning: 'Strengthen your database skills from beginner to intermediate level.',
        impact: 'Medium - Essential for data-driven apps',
        timeToLearn: '4-5 weeks',
        difficulty: 'medium',
        prerequisites: ['SQL basics'],
        learningPath: [
          'Advanced Queries',
          'Indexing',
          'Transactions',
          'Performance Tuning',
        ],
        resources: 4,
        marketDemand: 65,
      },
    ],

    // Skills comparison with similar roles
    roleComparison: {
      similarRoles: [
        {
          role: 'Full Stack Developer',
          matchPercentage: 68,
          overlappingSkills: ['React', 'Node.js', 'REST APIs'],
          uniqueSkills: ['Vue.js', 'MongoDB'],
        },
        {
          role: 'Frontend Engineer',
          matchPercentage: 82,
          overlappingSkills: ['React', 'TypeScript', 'CSS'],
          uniqueSkills: ['Webpack', 'Jest'],
        },
        {
          role: 'Backend Engineer',
          matchPercentage: 45,
          overlappingSkills: ['Node.js', 'PostgreSQL'],
          uniqueSkills: ['Java', 'Spring Boot', 'Microservices'],
        },
      ],
    },

    // Market insights
    marketInsights: {
      topTrendingSkills: ['TypeScript', 'GraphQL', 'Docker', 'Kubernetes', 'Next.js'],
      decliningSkills: ['jQuery', 'Angular.js', 'Backbone.js'],
      averageSalaryImpact: {
        TypeScript: '+15%',
        GraphQL: '+12%',
        Kubernetes: '+18%',
      },
    },
  };
};

/**
 * Get Skill Priority Service
 * @returns {Promise} - Prioritized learning queue
 */
export const getSkillPriorityService = async () => {
  await delay(500);

  const analysis = await getSkillGapAnalysisService();
  return {
    priorityQueue: analysis.prioritySkills,
    totalTimeEstimate: '16-20 weeks',
    recommendedOrder: analysis.prioritySkills.map((s) => s.name),
  };
};