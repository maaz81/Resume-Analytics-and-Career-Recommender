// Upload Resume
import API from '../../auth/services/api';

export const uploadResumeService = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await API.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.data; // ✅ FIX
};

// Get Resume History
export const getResumeHistoryService = async () => {
  const response = await API.get('/resumes/history');
  return response.data.data; // ✅ FIX
};

// Get Resume Analysis
export const getResumeAnalysisService = async (resumeId) => {
  const response = await API.get(`/resumes/${resumeId}/analysis`);
  return response.data.data; // ✅ FIX
};

// Score Resume
export const scoreResumeService = async (resumeId, jdText) => {
  const response = await API.post(`/resumes/${resumeId}/score`, {
    jdText,
  });

  return response.data.data; // ✅ FIX
};

// Delete Resume
export const deleteResumeService = async (resumeId) => {
  const response = await API.delete(`/resumes/${resumeId}`);
  return response.data;
};