import API from '../../auth/services/api';

/**
 * Onboarding Service
 * Handles career goal selection and resume upload
 */

// Simulated delay for UI dropdown data (Career roles and Companies)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mapExperienceToYears = (level) => {
  switch (level) {
    case 'entry': return 1;
    case 'intermediate': return 4;
    case 'senior': return 8;
    case 'lead': return 12;
    default: return 0;
  }
};

/**
 * Save Career Goal Service
 * @param {Object} careerGoalData - Career goal information
 * @returns {Promise} - Saved career goal data
 */
export const saveCareerGoalService = async (careerGoalData) => {
  if (!careerGoalData.targetRole) {
    throw new Error('Target role is required');
  }

  if (!careerGoalData.experienceLevel) {
    throw new Error('Experience level is required');
  }

  const payload = {
    targetRole: careerGoalData.targetRole,
    yearsOfExperience: mapExperienceToYears(careerGoalData.experienceLevel),
    location: careerGoalData.location || null,
  };

  const response = await API.patch('/auth/profile', payload);

  return {
    careerGoal: careerGoalData,
    message: 'Career goal saved successfully',
  };
};

/**
 * Upload Resume Service
 * @param {File} file - Resume file (PDF)
 * @returns {Promise} - Upload result with file info
 */
export const uploadResumeService = async (file, jdText = '') => {
  if (!file) {
    throw new Error('No file provided');
  }

  const fileType = file.name.split('.').pop().toLowerCase();
  if (fileType !== 'pdf') {
    throw new Error('Only PDF files are supported');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  const formData = new FormData();
  formData.append('resume', file);
  if (jdText) {
    formData.append('jdText', jdText);
  }

  const response = await API.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return {
    resume: response.data.data.resume,
    analysis: response.data.data.analysis,
    message: 'Resume uploaded successfully',
  };
};

/**
 * Get Career Roles Service
 * Returns list of available career roles
 */
export const getCareerRolesService = async () => {
  await delay(500);

  return {
    roles: [
      { value: 'software-engineer', label: 'Software Engineer' },
      { value: 'senior-software-engineer', label: 'Senior Software Engineer' },
      { value: 'frontend-developer', label: 'Frontend Developer' },
      { value: 'backend-developer', label: 'Backend Developer' },
      { value: 'full-stack-developer', label: 'Full Stack Developer' },
      { value: 'devops-engineer', label: 'DevOps Engineer' },
      { value: 'data-scientist', label: 'Data Scientist' },
      { value: 'data-analyst', label: 'Data Analyst' },
      { value: 'ml-engineer', label: 'Machine Learning Engineer' },
      { value: 'product-manager', label: 'Product Manager' },
      { value: 'ui-ux-designer', label: 'UI/UX Designer' },
      { value: 'qa-engineer', label: 'QA Engineer' },
    ],
  };
};

/**
 * Get Top Companies Service
 * Returns list of top companies
 */
export const getTopCompaniesService = async () => {
  await delay(500);

  return {
    companies: [
      'Google',
      'Microsoft',
      'Amazon',
      'Meta',
      'Apple',
      'Netflix',
      'Tesla',
      'Uber',
      'Airbnb',
      'Spotify',
      'Adobe',
      'Salesforce',
      'Oracle',
      'IBM',
      'Intel',
    ],
  };
};