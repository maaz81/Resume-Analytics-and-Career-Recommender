import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setRoadmap,
  setCurrentPhase,
  markSkillComplete,
  markSkillInProgress,
  setViewMode,
  generateRoadmapStart,
  generateRoadmapSuccess,
  generateRoadmapFailure,
} from '../slices/roadmapSlice';
import {
  getLearningRoadmapService,
  getRoadmapDetailService,
  updatePhaseProgressService,
  markTopicCompleteService,
} from '../services/roadmapService';

/**
 * useRoadmap Hook
 * Manages roadmap data and progress tracking
 */
export const useRoadmap = () => {
  const dispatch = useDispatch();
  const roadmap = useSelector((state) => state.roadmap);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get learning roadmap
   */
  const getLearningRoadmap = async () => {
    try {
      setIsLoading(true);
      setError(null);
      dispatch(generateRoadmapStart());
      
      const data = await getLearningRoadmapService();
      
      dispatch(setRoadmap(data));
      dispatch(setCurrentPhase(data.currentPhase));
      dispatch(generateRoadmapSuccess(data));
      
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      dispatch(generateRoadmapFailure(err.message));
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Get roadmap phase detail
   */
  const getRoadmapDetail = async (phaseId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getRoadmapDetailService(phaseId);
      
      setIsLoading(false);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  /**
   * Update phase progress
   */
  const updateProgress = async (phaseId, progress) => {
    try {
      const result = await updatePhaseProgressService(phaseId, progress);
      
      if (result.success) {
        // Update local state if needed
        return { success: true };
      }
      
      return { success: false, error: 'Failed to update progress' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Mark topic as complete
   */
  const markTopicComplete = async (topicId) => {
    try {
      const result = await markTopicCompleteService(topicId);
      return { success: result.success, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Change view mode (weekly/monthly)
   */
  const changeViewMode = (mode) => {
    dispatch(setViewMode(mode));
  };

  return {
    // State
    roadmap: roadmap.roadmap,
    currentPhase: roadmap.currentPhase,
    completedSkills: roadmap.completedSkills,
    inProgressSkills: roadmap.inProgressSkills,
    viewMode: roadmap.viewMode,
    isLoading: isLoading || roadmap.isLoading,
    error: error || roadmap.error,
    
    // Actions
    getLearningRoadmap,
    getRoadmapDetail,
    updateProgress,
    markTopicComplete,
    changeViewMode,
  };
};