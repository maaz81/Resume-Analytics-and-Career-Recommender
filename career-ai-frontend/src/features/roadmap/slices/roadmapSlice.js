
// ===== src/features/roadmap/slices/roadmapSlice.js =====
import { createSlice } from '@reduxjs/toolkit';

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState: {
    roadmap: null,
    currentPhase: null,
    completedSkills: [],
    inProgressSkills: [],
    viewMode: 'weekly', // 'weekly' or 'monthly'
    isLoading: false,
    error: null,
  },
  reducers: {
    setRoadmap: (state, action) => {
      state.roadmap = action.payload;
    },
    setCurrentPhase: (state, action) => {
      state.currentPhase = action.payload;
    },
    markSkillComplete: (state, action) => {
      state.completedSkills.push(action.payload);
      state.inProgressSkills = state.inProgressSkills.filter(
        (skill) => skill !== action.payload
      );
    },
    markSkillInProgress: (state, action) => {
      if (!state.inProgressSkills.includes(action.payload)) {
        state.inProgressSkills.push(action.payload);
      }
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    generateRoadmapStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    generateRoadmapSuccess: (state, action) => {
      state.isLoading = false;
      state.roadmap = action.payload;
    },
    generateRoadmapFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setRoadmap,
  setCurrentPhase,
  markSkillComplete,
  markSkillInProgress,
  setViewMode,
  generateRoadmapStart,
  generateRoadmapSuccess,
  generateRoadmapFailure,
} = roadmapSlice.actions;
export default roadmapSlice.reducer;

