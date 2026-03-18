import API from '../../auth/services/api';

// Upload Resume
export const uploadResumeService = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await API.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// Get Resume History
export const getResumeHistoryService = async () => {
  const response = await API.get('/resumes/history');
  return response.data;
};

// Get Resume Analysis
export const getResumeAnalysisService = async (resumeId) => {
  const response = await API.get(`/resumes/${resumeId}/analysis`);
  return response.data;
};

// Score Resume
export const scoreResumeService = async (resumeId, jdText) => {
  const response = await API.post(`/resumes/${resumeId}/score`, {
    jdText,
  });
  return response.data;
};