/**
 * Resume Service
 * Handles resume analysis and ATS scoring (DUMMY DATA FOR NOW)
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get Resume Analysis Service
 * @returns {Promise} - Complete resume analysis data
 */
export const getResumeAnalysisService = async () => {
  await delay(1000);

  return {
    resumeId: 'resume_001',
    fileName: 'John_Doe_Resume.pdf',
    uploadedAt: new Date('2024-01-20').toISOString(),
    version: 1,
    
    // ATS Score
    atsScore: {
      overall: 72,
      breakdown: {
        keywordMatch: 68,
        skillCoverage: 75,
        formattingScore: 80,
        experienceAlignment: 70,
      },
      grade: 'B',
      status: 'good',
    },

    // Extracted Information
    extractedData: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Experienced software engineer with 5+ years building scalable web applications.',
      
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          duration: 'Jan 2021 - Present',
          description: 'Led development of microservices architecture',
        },
        {
          title: 'Software Engineer',
          company: 'StartupXYZ',
          duration: 'Jun 2018 - Dec 2020',
          description: 'Built full-stack features using React and Node.js',
        },
      ],

      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          school: 'University of California',
          year: '2018',
        },
      ],

      skills: [
        'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git',
        'AWS', 'Docker', 'REST APIs', 'MongoDB'
      ],
    },

    // Comparison with Target Role
    targetRoleComparison: {
      role: 'Senior Software Engineer',
      matchPercentage: 75,
      strengths: [
        'Strong frontend experience with React',
        'Backend development with Node.js',
        'Cloud deployment experience',
      ],
      gaps: [
        'Missing TypeScript',
        'Limited GraphQL experience',
        'No Kubernetes mentioned',
      ],
    },
  };
};

/**
 * Get Resume Issues Service
 * @returns {Promise} - Detailed list of issues
 */
export const getResumeIssuesService = async () => {
  await delay(800);

  return {
    totalIssues: 15,
    criticalIssues: 5,
    
    issues: [
      // Keywords Issues
      {
        id: 1,
        category: 'keywords',
        severity: 'high',
        title: 'Missing Critical Keywords',
        description: 'Your resume is missing 5 keywords that appear in 80% of Senior Software Engineer job postings.',
        impact: 'High - May be filtered out by ATS systems',
        missingKeywords: ['TypeScript', 'GraphQL', 'Kubernetes', 'CI/CD', 'Microservices'],
        recommendation: 'Add these keywords naturally in your experience or skills section',
        affectedSections: ['Skills', 'Experience'],
        fixable: true,
      },
      {
        id: 2,
        category: 'keywords',
        severity: 'medium',
        title: 'Keyword Density Too Low',
        description: 'Important keywords appear only once. Repeat key skills 2-3 times across different sections.',
        impact: 'Medium - Reduces ATS ranking',
        keywords: ['React', 'Node.js', 'AWS'],
        recommendation: 'Mention React in both skills and project descriptions',
        affectedSections: ['Experience'],
        fixable: true,
      },

      // Content Issues
      {
        id: 3,
        category: 'content',
        severity: 'high',
        title: 'Weak Action Verbs',
        description: '8 bullet points use weak verbs like "responsible for" and "worked on".',
        impact: 'High - Reduces impact and credibility',
        examples: [
          {
            weak: 'Responsible for developing features',
            strong: 'Architected and developed 15+ features serving 100K+ users',
          },
          {
            weak: 'Worked on API integration',
            strong: 'Integrated 5 third-party APIs, reducing load time by 40%',
          },
        ],
        recommendation: 'Use strong action verbs: Led, Architected, Optimized, Reduced, Increased',
        affectedSections: ['Experience'],
        fixable: true,
      },
      {
        id: 4,
        category: 'content',
        severity: 'medium',
        title: 'Missing Quantifiable Metrics',
        description: '6 bullet points lack numbers or measurable outcomes.',
        impact: 'Medium - Harder to demonstrate impact',
        examples: [
          {
            current: 'Improved application performance',
            improved: 'Improved application performance by 45%, reducing page load time from 3s to 1.5s',
          },
        ],
        recommendation: 'Add metrics: percentages, numbers, timeframes',
        affectedSections: ['Experience'],
        fixable: true,
      },

      // Formatting Issues
      {
        id: 5,
        category: 'formatting',
        severity: 'low',
        title: 'Inconsistent Date Format',
        description: 'Some dates use "Jan 2021" while others use "January 2021".',
        impact: 'Low - Minor readability issue',
        recommendation: 'Use consistent format: "Jan 2021 - Present"',
        affectedSections: ['Experience', 'Education'],
        fixable: true,
      },
      {
        id: 6,
        category: 'formatting',
        severity: 'low',
        title: 'Inconsistent Spacing',
        description: 'Spacing between sections varies (1-2 lines).',
        impact: 'Low - Affects visual consistency',
        recommendation: 'Use consistent 1-line spacing between sections',
        affectedSections: ['All sections'],
        fixable: true,
      },

      // Structure Issues
      {
        id: 7,
        category: 'structure',
        severity: 'medium',
        title: 'Missing Professional Summary',
        description: 'Resume lacks a compelling summary at the top.',
        impact: 'Medium - Misses opportunity to highlight key strengths',
        recommendation: 'Add 2-3 sentence summary highlighting years of experience and key skills',
        affectedSections: ['Summary'],
        fixable: true,
      },
      {
        id: 8,
        category: 'structure',
        severity: 'low',
        title: 'Skills Section Placement',
        description: 'Skills section is at the bottom. Consider moving it higher.',
        impact: 'Low - Important skills may be overlooked',
        recommendation: 'Place skills section right after summary',
        affectedSections: ['Skills'],
        fixable: true,
      },

      // ATS Compatibility
      {
        id: 9,
        category: 'ats',
        severity: 'high',
        title: 'Non-Standard Section Headers',
        description: 'Using "My Experience" instead of standard "Work Experience".',
        impact: 'High - ATS may not parse correctly',
        recommendation: 'Use standard headers: Work Experience, Education, Skills',
        affectedSections: ['Experience'],
        fixable: true,
      },
      {
        id: 10,
        category: 'ats',
        severity: 'medium',
        title: 'Complex Table Layout Detected',
        description: 'Tables may not be parsed correctly by ATS.',
        impact: 'Medium - Content may be lost',
        recommendation: 'Use simple text layout instead of tables',
        affectedSections: ['All sections'],
        fixable: false,
      },
    ],

    // Summary by category
    issuesByCategory: {
      keywords: 2,
      content: 2,
      formatting: 2,
      structure: 2,
      ats: 2,
    },

    // Quick fixes available
    quickFixes: [
      {
        id: 'add_typescript',
        action: 'Add "TypeScript" to skills section',
        impact: '+5 ATS points',
      },
      {
        id: 'fix_action_verbs',
        action: 'Replace weak verbs in top 3 bullet points',
        impact: '+8 ATS points',
      },
      {
        id: 'add_metrics',
        action: 'Add metrics to 3 accomplishments',
        impact: '+6 ATS points',
      },
    ],
  };
};

/**
 * Get Resume History Service
 * @returns {Promise} - List of resume versions
 */
export const getResumeHistoryService = async () => {
  await delay(500);

  return {
    resumes: [
      {
        id: 'resume_003',
        version: 3,
        fileName: 'John_Doe_Resume_v3.pdf',
        uploadedAt: new Date('2024-01-20').toISOString(),
        atsScore: 72,
        status: 'current',
        changes: 'Added TypeScript, updated experience section',
      },
      {
        id: 'resume_002',
        version: 2,
        fileName: 'John_Doe_Resume_v2.pdf',
        uploadedAt: new Date('2024-01-10').toISOString(),
        atsScore: 65,
        status: 'archived',
        changes: 'Fixed formatting issues',
      },
      {
        id: 'resume_001',
        version: 1,
        fileName: 'John_Doe_Resume_v1.pdf',
        uploadedAt: new Date('2024-01-05').toISOString(),
        atsScore: 58,
        status: 'archived',
        changes: 'Initial upload',
      },
    ],
  };
};