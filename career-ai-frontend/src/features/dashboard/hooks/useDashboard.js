/**
 * useDashboard Hook
 * Custom hook for dashboard data and actions
 */
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardData,
  fetchQuickStats,
  refreshDashboard as refreshDashboardThunk
} from "../thunks/dashboardThunk";
import { clearDashboardError } from "../slices/dashboardSlice";

/**
 * useDashboard Hook
 * @param {Object} options - Hook options
 * @param {boolean} options.autoLoad - Auto-load on mount (default: true)
 * @param {boolean} options.loadQuickStatsOnly - Load only quick stats (default: false)
 */
export const useDashboard = ({ autoLoad = true, loadQuickStatsOnly = false } = {}) => {
  const dispatch = useDispatch();

  // Select dashboard state
  const {
    stats,
    nextAction,
    profile,
    resume,
    atsScore,
    skillGap,
    roadmap,
    isLoading,
    error,
    lastUpdated,
  } = useSelector((state) => state.dashboard);

  /**
   * Load full dashboard data
   */
  const loadDashboard = useCallback(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  /**
   * Load only quick stats (faster)
   */
  const loadQuickStats = useCallback(() => {
    dispatch(fetchQuickStats());
  }, [dispatch]);

  /**
   * Refresh dashboard data
   */
  const refreshDashboard = useCallback(() => {
    dispatch(refreshDashboardThunk());
  }, [dispatch]);

  /**
   * Clear any errors
   */
  const clearError = useCallback(() => {
    dispatch(clearDashboardError());
  }, [dispatch]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      if (loadQuickStatsOnly) {
        loadQuickStats();
      } else {
        loadDashboard();
      }
    }
  }, [autoLoad, loadQuickStatsOnly, loadDashboard, loadQuickStats]);

  // Poll dashboard if a resume is currently being processed
  useEffect(() => {
    let intervalId;
    if (resume?.parsingStatus === 'pending' || resume?.parsingStatus === 'processing') {
      // Poll every 3 seconds to get the latest AI analysis results
      intervalId = setInterval(() => {
        refreshDashboard();
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [resume?.parsingStatus, refreshDashboard]);

  return {
    // Data
    stats,
    nextAction,
    profile,
    resume,
    atsScore,
    skillGap,
    roadmap,

    // State
    isLoading,
    error,
    lastUpdated,

    // Actions
    loadDashboard,
    loadQuickStats,
    refreshDashboard,
    clearError,
  };
};