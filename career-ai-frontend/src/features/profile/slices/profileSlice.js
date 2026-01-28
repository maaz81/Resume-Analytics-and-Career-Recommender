
// ===== src/features/profile/slices/profileSlice.js =====
import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    loadProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loadProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
    },
    loadProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.profile = { ...state.profile, ...action.payload };
    },
    updateProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loadProfileStart,
  loadProfileSuccess,
  loadProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} = profileSlice.actions;
export default profileSlice.reducer;