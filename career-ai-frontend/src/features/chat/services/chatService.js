/**
 * Chat Service
 * Handles AI chat interactions (DUMMY DATA FOR NOW)
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Context-aware responses based on user data
const contextualResponses = {
  resume: {
    greeting: "I can help you improve your resume! Your current ATS score is 72%. Would you like me to suggest improvements?",
    suggestions: [
      "Add TypeScript to your skills section",
      "Use stronger action verbs in your experience bullets",
      "Include quantifiable metrics in your achievements",
    ],
  },
  skills: {
    greeting: "I see you're working on TypeScript. Great choice! It's in high demand and will boost your profile significantly.",
    suggestions: [
      "Focus on TypeScript generics next - it's crucial for senior roles",
      "After TypeScript, I recommend learning GraphQL",
      "Practice building type-safe React components",
    ],
  },
  roadmap: {
    greeting: "You're making great progress on your learning roadmap! You're 60% through TypeScript Fundamentals.",
    suggestions: [
      "Complete the Generics module to stay on track",
      "Spend 1-2 hours daily for consistent progress",
      "Join TypeScript community forums for help",
    ],
  },
  general: {
    greeting: "Hi! I'm your AI career assistant. I can help you with resume optimization, skill development, and career planning.",
    suggestions: [
      "What would you like to know?",
      "Ask me about your resume, skills, or learning path",
      "I can provide personalized career advice",
    ],
  },
};

// Predefined responses for common questions
const predefinedResponses = {
  // Resume questions
  "how can i improve my resume": "Based on your current resume analysis, here are the top 3 improvements:\n\n1. **Add Missing Keywords**: Include TypeScript, GraphQL, and Docker in your skills section\n2. **Strengthen Action Verbs**: Replace 'responsible for' with 'architected', 'led', or 'optimized'\n3. **Add Metrics**: Include numbers like '40% performance improvement' or 'served 100K+ users'\n\nThese changes could boost your ATS score from 72% to 85%+!",
  
  "what's my ats score": "Your current ATS score is **72%** (Grade B). This is good, but there's room for improvement! You're missing some critical keywords and could strengthen your action verbs. Aim for 85%+ to maximize your chances.",
  
  "what skills should i learn": "Based on your goal to become a Senior Software Engineer, here's your priority queue:\n\n1. **TypeScript** (Critical) - You're currently learning this, great!\n2. **GraphQL** (High) - Modern API technology, 3-4 weeks to learn\n3. **Node.js** (High) - Strengthen from beginner to intermediate\n4. **Docker** (Medium) - DevOps skill, 2-3 weeks\n\nFocus on TypeScript first, then move to GraphQL.",
  
  // Learning questions
  "how long will it take": "Your complete learning roadmap is **16 weeks** (about 4 months). You're currently in Week 2, so you have 14 weeks remaining. At your current pace of 1-2 hours daily, you're on track to complete by mid-May 2024.",
  
  "what should i learn next": "You should focus on **Generics** in TypeScript right now. After completing TypeScript Fundamentals (2 more weeks), move on to GraphQL. This order maximizes your job market readiness.",
  
  // Career advice
  "am i ready to apply": "Not quite yet! Here's your current readiness:\n\n✓ Strong: React, REST APIs\n⚠️ Weak: Node.js, PostgreSQL\n✗ Missing: TypeScript, GraphQL\n\nYou're **52% ready** for Senior Software Engineer roles. Complete TypeScript and GraphQL (about 8 weeks), and you'll be **85%+ ready** to start applying!",
  
  "what jobs match my skills": "Based on your current skills, you have **24 job matches**:\n\n• **Frontend Engineer**: 82% match (Apply now!)\n• **Full Stack Developer**: 68% match (Apply after 30 days)\n• **Senior Software Engineer**: 52% match (Apply after 60-90 days)\n\nYour strongest matches are frontend-focused roles. Complete TypeScript to unlock more senior positions.",
  
  // Motivation
  "i'm feeling stuck": "I understand how you feel, but remember - you've already made great progress! 🎉\n\n✓ Completed Week 1 of TypeScript\n✓ 5-day learning streak\n✓ 18 hours invested\n\nYou're 17% through your entire roadmap. That's real progress! Take a short break if needed, then come back refreshed. Small steps add up to big achievements. You've got this! 💪",
  
  "give me motivation": "You're doing amazing! Here's why:\n\n🔥 5-day learning streak - consistency is key!\n📈 17% roadmap progress - you've started and that's the hardest part\n⭐ Strong in React - this is valuable and in-demand\n\nEvery hour you invest is bringing you closer to your goal. Senior engineers aren't born overnight - they're built through consistent effort just like you're doing now. Keep going! 🚀",
};

/**
 * Send Chat Message Service
 * @param {string} message - User message
 * @param {Object} context - User context (resume, skills, etc.)
 * @returns {Promise} - AI response
 */
export const sendChatMessageService = async (message, context = {}) => {
  await delay(1000); // Simulate AI processing

  const lowerMessage = message.toLowerCase().trim();

  // Check for predefined responses
  for (const [key, response] of Object.entries(predefinedResponses)) {
    if (lowerMessage.includes(key)) {
      return {
        id: `msg_${Date.now()}`,
        content: response,
        timestamp: new Date().toISOString(),
        sender: 'assistant',
      };
    }
  }

  // Context-aware greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage === 'hey') {
    const contextType = context.currentPage || 'general';
    const contextResponses = contextualResponses[contextType] || contextualResponses.general;
    
    return {
      id: `msg_${Date.now()}`,
      content: contextResponses.greeting,
      timestamp: new Date().toISOString(),
      sender: 'assistant',
    };
  }

  // Generic helpful response
  return {
    id: `msg_${Date.now()}`,
    content: `I understand you're asking about "${message}". I can help you with:\n\n• Resume optimization and ATS improvement\n• Skill gap analysis and learning priorities\n• Career path planning and job readiness\n• Learning resources and roadmap guidance\n\nCould you be more specific about what you'd like help with?`,
    timestamp: new Date().toISOString(),
    sender: 'assistant',
  };
};

/**
 * Get Chat Suggestions Service
 * @param {Object} context - User context
 * @returns {Promise} - Suggested questions
 */
export const getChatSuggestionsService = async (context = {}) => {
  await delay(300);

  const suggestions = [
    "How can I improve my resume?",
    "What skills should I learn next?",
    "Am I ready to apply for jobs?",
    "What's my ATS score?",
    "Give me some motivation",
  ];

  // Context-specific suggestions
  if (context.currentPage === 'resume') {
    return [
      "How can I improve my ATS score?",
      "What are my biggest resume issues?",
      "How do I add metrics to my resume?",
      "What keywords am I missing?",
    ];
  }

  if (context.currentPage === 'skills') {
    return [
      "What skills should I learn first?",
      "How long will it take to learn TypeScript?",
      "What's the market demand for GraphQL?",
      "Should I learn Docker or Kubernetes first?",
    ];
  }

  if (context.currentPage === 'roadmap') {
    return [
      "How do I stay motivated?",
      "What should I focus on this week?",
      "Am I on track with my learning?",
      "Where can I find practice exercises?",
    ];
  }

  return suggestions;
};