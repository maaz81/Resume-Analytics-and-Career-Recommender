/**
 * Dashboard Slice
 * Redux state management for dashboard
 */
import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardData, fetchQuickStats, refreshDashboard } from '../thunks/dashboardThunk';

const initialState = {
  stats: null,
  nextAction: null,
  profile: null,
  resume: null,
  atsScore: null,
  skillGap: null,
  roadmap: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Manual actions (if needed for optimistic updates)
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.nextAction = action.payload.nextAction;
        state.profile = action.payload.profile;
        state.resume = action.payload.resume;
        state.atsScore = action.payload.atsScore;
        state.skillGap = action.payload.skillGap;
        state.roadmap = action.payload.roadmap;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load dashboard';
      });

    // Fetch Quick Stats
    builder
      .addCase(fetchQuickStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuickStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchQuickStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load stats';
      });

    // Refresh Dashboard
    builder
      .addCase(refreshDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.nextAction = action.payload.nextAction;
        state.profile = action.payload.profile;
        state.resume = action.payload.resume;
        state.atsScore = action.payload.atsScore;
        state.skillGap = action.payload.skillGap;
        state.roadmap = action.payload.roadmap;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to refresh dashboard';
      });
  },
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;