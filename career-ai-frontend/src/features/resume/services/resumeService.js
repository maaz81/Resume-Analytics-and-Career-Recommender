import API from '../../auth/services/api';

// Upload Resume
export const uploadResumeService = async (file, jdText = '') => {
  const formData = new FormData();
  formData.append('resume', file);
  if (jdText) {
    formData.append('jdText', jdText);
  }

  const response = await API.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data;
};

// Get Resume History
export const getResumeHistoryService = async () => {
  const response = await API.get('/resumes/history');
  return response.data.data;
};

// Get Resume Analysis
export const getResumeAnalysisService = async (resumeId) => {
  const response = await API.get(`/resumes/${resumeId}/analysis`);
  return response.data.data;
};

// Score Resume
// ─────────────────────────────────────────────────────────────────────
// isAuto = false (default) → jdText is a full JD pasted by the user
// isAuto = true            → jdText is just a role title; the backend
//                            calls OpenRouter LLM to generate the real JD
// ─────────────────────────────────────────────────────────────────────
export const scoreResumeService = async (resumeId, jdText, isAuto = false) => {
  const response = await API.post(`/resumes/${resumeId}/score`, {
    jdText,
    isAuto,
  });

  return response.data.data;
};

// Delete Resume
export const deleteResumeService = async (resumeId) => {
  const response = await API.delete(`/resumes/${resumeId}`);
  return response.data;
};