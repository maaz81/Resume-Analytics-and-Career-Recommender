/**
 * Onboarding Service
 * Handles career goal selection and resume upload (DUMMY DATA FOR NOW)
 */

// Simulated delay for realistic API behavior
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Save Career Goal Service
 * @param {Object} careerGoalData - Career goal information
 * @returns {Promise} - Saved career goal data
 */
export const saveCareerGoalService = async (careerGoalData) => {
  await delay(1000); // Simulate network delay

  // Validate required fields
  if (!careerGoalData.targetRole) {
    throw new Error('Target role is required');
  }

  if (!careerGoalData.experienceLevel) {
    throw new Error('Experience level is required');
  }

  // Return saved data
  return {
    careerGoal: {
      targetRole: careerGoalData.targetRole,
      experienceLevel: careerGoalData.experienceLevel,
      targetCompanies: careerGoalData.targetCompanies || [],
      location: careerGoalData.location || null,
      remotePreference: careerGoalData.remotePreference || 'flexible',
    },
    message: 'Career goal saved successfully',
  };
};

/**
 * Upload Resume Service
 * @param {File} file - Resume file (PDF)
 * @returns {Promise} - Upload result with file info
 */
export const uploadResumeService = async (file) => {
  await delay(2000); // Simulate file upload delay

  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file type
  const fileType = file.name.split('.').pop().toLowerCase();
  if (fileType !== 'pdf') {
    throw new Error('Only PDF files are supported');
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Simulate file upload and return metadata
  return {
    resume: {
      id: `resume_${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      version: 1,
    },
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