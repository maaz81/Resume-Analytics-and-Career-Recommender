import { callOpenRouter } from './llm.service.js';

export const generateProjectsFromResume = async (resumeText) => {
    const prompt = `
You are a senior software architect.

Based on this resume, suggest 4 personalized portfolio projects.

Rules:
- Focus on skill gaps and improvement
- Make them real-world and resume-worthy
- Return JSON ONLY

Format:
[
  {
    "title": "...",
    "description": "...",
    "stack": ["..."],
    "difficulty": "Beginner|Intermediate|Advanced"
  }
]

Resume:
${resumeText.slice(0, 3000)}
`;

    const response = await callOpenRouter([
        { role: 'user', content: prompt }
    ]);

    return JSON.parse(response);
};