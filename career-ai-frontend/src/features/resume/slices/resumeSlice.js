
// ===== src/features/resume/slices/resumeSlice.js =====
import { createSlice } from '@reduxjs/toolkit';

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    currentResume: null,
    resumeHistory: [],
    atsScore: null,
    analysis: null,
    issues: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    uploadResumeStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    uploadResumeSuccess: (state, action) => {
      state.isLoading = false;
      state.currentResume = action.payload;
      state.resumeHistory.unshift(action.payload);
    },
    uploadResumeFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setATSScore: (state, action) => {
      state.atsScore = action.payload;
    },
    setAnalysis: (state, action) => {
      state.analysis = action.payload;
    },
    setIssues: (state, action) => {
      state.issues = action.payload;
    },
    setResumeHistory: (state, action) => {
      state.resumeHistory = action.payload;
    },
    clearResume: (state) => {
      state.currentResume = null;
      state.atsScore = null;
      state.analysis = null;
      state.issues = [];
      state.resumeHistory = [];
    },
  },
});

export const {
  uploadResumeStart,
  uploadResumeSuccess,
  uploadResumeFailure,
  setATSScore,
  setAnalysis,
  setIssues,
  setResumeHistory,
  clearResume,
} = resumeSlice.actions;
export default resumeSlice.reducer;

