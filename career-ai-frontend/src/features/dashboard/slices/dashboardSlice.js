
// ===== src/features/dashboard/slices/dashboardSlice.js =====
import { createSlice } from '@reduxjs/toolkit';

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    nextAction: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    loadDashboardStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadDashboardSuccess: (state, action) => {
      state.isLoading = false;
      state.stats = action.payload.stats;
      state.nextAction = action.payload.nextAction;
    },
    loadDashboardFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loadDashboardStart,
  loadDashboardSuccess,
  loadDashboardFailure,
} = dashboardSlice.actions;
export default dashboardSlice.reducer;

