import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadDashboardStart,
  loadDashboardSuccess,
  loadDashboardFailure,
} from '../slices/dashboardSlice';
import { getDashboardDataService } from '../services/dashboardService';

/**
 * useDashboard Hook
 * Manages dashboard data fetching and state
 */
export const useDashboard = () => {
  const dispatch = useDispatch();
  const { stats, nextAction, isLoading, error } = useSelector(
    (state) => state.dashboard
  );

  /**
   * Load dashboard data
   */
  const loadDashboard = async () => {
    try {
      dispatch(loadDashboardStart());
      const data = await getDashboardDataService();
      dispatch(loadDashboardSuccess(data));
    } catch (err) {
      dispatch(loadDashboardFailure(err.message));
    }
  };

  /**
   * Refresh dashboard data
   */
  const refreshDashboard = () => {
    loadDashboard();
  };

  // Load dashboard on mount
  useEffect(() => {
    loadDashboard();
  }, []);

  return {
    stats,
    nextAction,
    isLoading,
    error,
    refreshDashboard,
  };
};