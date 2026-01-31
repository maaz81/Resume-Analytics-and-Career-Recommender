import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setUserSkills,
  setRequiredSkills,
  setSkillGaps,
  setPrioritySkills,
  analyzeSkillsStart,
  analyzeSkillsSuccess,
  analyzeSkillsFailure,
} from '../slices/skillsSlice';
import {
  getSkillGapAnalysisService,
  getSkillPriorityService,
} from '../services/skillsService';

/**
 * useSkills Hook
 * Manages skill gap analysis and priority ranking
 */
export const useSkills = () => {
  const dispatch = useDispatch();
  const skills = useSelector((state) => state.skills);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get skill gap analysis
   */
  const getSkillGapAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      dispatch(analyzeSkillsStart());
      
      const data = await getSkillGapAnalysisService();
      
      // Update Redux state
      dispatch(setSkillGaps(data.skillsByCategory));
      dispatch(setPrioritySkills(data.prioritySkills));
      dispatch(analyzeSkillsSuccess());
      
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      dispatch(analyzeSkillsFailure(err.message));
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get skill priority queue
   */
  const getSkillPriority = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getSkillPriorityService();
      dispatch(setPrioritySkills(data.priorityQueue));
      
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
    userSkills: skills.userSkills,
    requiredSkills: skills.requiredSkills,
    skillGaps: skills.skillGaps,
    prioritySkills: skills.prioritySkills,
    isLoading: isLoading || skills.isLoading,
    error: error || skills.error,
    
    // Actions
    getSkillGapAnalysis,
    getSkillPriority,
  };
};