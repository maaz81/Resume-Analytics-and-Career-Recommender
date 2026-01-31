import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  uploadResumeStart,
  uploadResumeSuccess,
  uploadResumeFailure,
  setATSScore,
  setAnalysis,
  setIssues,
} from '../slices/resumeSlice';
import {
  getResumeAnalysisService,
  getResumeIssuesService,
  getResumeHistoryService,
} from '../services/resumeService';

/**
 * useResume Hook
 * Manages resume analysis and issues
 */
export const useResume = () => {
  const dispatch = useDispatch();
  const resume = useSelector((state) => state.resume);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get resume analysis
   */
  const getResumeAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getResumeAnalysisService();
      dispatch(setAnalysis(data));
      dispatch(setATSScore(data.atsScore));
      
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get resume issues
   */
  const getResumeIssues = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getResumeIssuesService();
      dispatch(setIssues(data.issues));
      
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get resume history
   */
  const getResumeHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getResumeHistoryService();
      
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  return {
    // State
    currentResume: resume.currentResume,
    atsScore: resume.atsScore,
    analysis: resume.analysis,
    issues: resume.issues,
    isLoading: isLoading || resume.isLoading,
    error: error || resume.error,
    
    // Actions
    getResumeAnalysis,
    getResumeIssues,
    getResumeHistory,
  };
};