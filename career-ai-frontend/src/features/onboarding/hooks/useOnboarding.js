import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setCareerGoal,
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
      
      // Update Redux state
      dispatch(setCareerGoal(response.careerGoal));
      dispatch(updateUser({ careerGoal: response.careerGoal }));
      
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

      const response = await uploadResumeService(file);
      
      // Update Redux state
      dispatch(uploadResumeSuccess(response.resume));
      dispatch(completeOnboarding());
      
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
    
    // Navigate to next page based on current step
    if (onboarding.currentStep === 1) {
      navigate(ROUTES.ONBOARDING_RESUME_UPLOAD);
    } else if (onboarding.currentStep === 2) {
      navigate(ROUTES.DASHBOARD);
    }
  };

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = () => {
    dispatch(previousStep());
    navigate(ROUTES.ONBOARDING_CAREER_GOAL);
  };

  /**
   * Skip onboarding (for later)
   */
  const skipOnboarding = () => {
    navigate(ROUTES.DASHBOARD);
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
    saveCareerGoal,
    uploadResume,
    getCareerRoles,
    getTopCompanies,
    goToNextStep,
    goToPreviousStep,
    skipOnboarding,
    finishOnboarding,
  };
};