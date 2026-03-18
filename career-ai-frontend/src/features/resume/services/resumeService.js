// Upload Resume
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