import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setCareerGoal,
  setStep,
  nextStep,
  previousStep,
  completeOnboarding,
  resetOnboarding,
} from '../slices/onboardingSlice';
import { updateUser } from '@features/auth/slices/authSlice';
import {
  saveCareerGoalService,
  uploadResumeService,
  getCareerRolesService,
  getTopCompaniesService,
} from '../services/onboardingService';
import { scoreResumeService } from '@features/resume/services/resumeService';
import { uploadResumeSuccess } from '@features/resume/slices/resumeSlice';
import { ROUTES } from '@constants/routes';
import { useState } from 'react';

/**
 * useOnboarding Hook
 * Centralized onboarding logic
 */
export const useOnboarding = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onboarding = useSelector((state) => state.onboarding);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Save career goal
   */
  const saveCareerGoal = async (careerGoalData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await saveCareerGoalService(careerGoalData);

      dispatch(setCareerGoal(response.careerGoal));
      dispatch(updateUser({ targetRole: response.careerGoal.targetRole }));

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Upload resume
   */
  const uploadResume = async (file) => {
    try {
      setIsLoading(true);
      setError(null);

      const defaultJd = onboarding.careerGoal?.targetRole || 'Software Engineer';
      const response = await uploadResumeService(file, defaultJd);

      dispatch(uploadResumeSuccess(response.resume));

      setIsLoading(false);
      return { success: true, data: response.resume };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get career roles
   */
  const getCareerRoles = async () => {
    try {
      const response = await getCareerRolesService();
      return response.roles;
    } catch (err) {
      console.error('Error fetching career roles:', err);
      return [];
    }
  };

  /**
   * Get top companies
   */
  const getTopCompanies = async () => {
    try {
      const response = await getTopCompaniesService();
      return response.companies;
    } catch (err) {
      console.error('Error fetching companies:', err);
      return [];
    }
  };

  /**
   * Navigate to next step
   */
  const goToNextStep = () => {
    dispatch(nextStep());

    if (onboarding.currentStep === 1) {
      navigate(ROUTES.ONBOARDING_RESUME_UPLOAD);
    } else if (onboarding.currentStep === 2) {
      navigate(ROUTES.ONBOARDING_JOB_DESCRIPTION);
    } else if (onboarding.currentStep === 3) {
      dispatch(completeOnboarding());
      navigate(ROUTES.DASHBOARD);
    }
  };

  const forceSetStep = (step) => {
    if (onboarding.currentStep !== step) {
      dispatch(setStep(step));
    }
  };

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = () => {
    if (onboarding.currentStep === 3) {
      dispatch(previousStep());
      navigate(ROUTES.ONBOARDING_RESUME_UPLOAD);
    } else if (onboarding.currentStep === 2) {
      dispatch(previousStep());
      navigate(ROUTES.ONBOARDING_CAREER_GOAL);
    }
  };

  /**
   * Skip onboarding
   */
  const skipOnboarding = () => {
    navigate(ROUTES.DASHBOARD);
  };

  /**
   * Save job description
   *
   * jdData.type === 'auto'   → user clicked "Use AI Generated JD"
   *                            jdText = their target role title
   *                            isAuto = true → backend calls OpenRouter LLM
   *
   * jdData.type === 'manual' → user pasted their own JD text
   *                            jdText = full pasted content
   *                            isAuto = false → scored as-is
   */
  const saveJobDescription = async (jdData) => {
    try {
      setIsLoading(true);
      setError(null);

      const isAuto = jdData.type === 'auto';
      const jdText = isAuto
        ? (onboarding.careerGoal?.targetRole || 'Software Engineer')  // role title → LLM generates real JD
        : jdData.content;                                              // full JD pasted by user

      await scoreResumeService('latest', jdText, isAuto);

      setIsLoading(false);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Complete onboarding and navigate to dashboard
   */
  const finishOnboarding = () => {
    dispatch(completeOnboarding());
    navigate(ROUTES.DASHBOARD);
  };

  return {
    // State
    currentStep: onboarding.currentStep,
    careerGoal: onboarding.careerGoal,
    isCompleted: onboarding.isCompleted,
    isLoading,
    error,

    // Actions
    setStep: forceSetStep,
    saveCareerGoal,
    saveJobDescription,
    uploadResume,
    getCareerRoles,
    getTopCompanies,
    goToNextStep,
    goToPreviousStep,
    skipOnboarding,
    finishOnboarding,
  };
};