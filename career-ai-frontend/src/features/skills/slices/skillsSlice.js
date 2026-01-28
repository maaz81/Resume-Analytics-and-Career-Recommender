
// ===== src/features/skills/slices/skillsSlice.js =====
import { createSlice } from '@reduxjs/toolkit';

const skillsSlice = createSlice({
  name: 'skills',
  initialState: {
    userSkills: [],
    requiredSkills: [],
    skillGaps: {
      core: [],
      niceToHave: [],
      emerging: [],
    },
    prioritySkills: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setUserSkills: (state, action) => {
      state.userSkills = action.payload;
    },
    setRequiredSkills: (state, action) => {
      state.requiredSkills = action.payload;
    },
    setSkillGaps: (state, action) => {
      state.skillGaps = action.payload;
    },
    setPrioritySkills: (state, action) => {
      state.prioritySkills = action.payload;
    },
    analyzeSkillsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    analyzeSkillsSuccess: (state) => {
      state.isLoading = false;
    },
    analyzeSkillsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setUserSkills,
  setRequiredSkills,
  setSkillGaps,
  setPrioritySkills,
  analyzeSkillsStart,
  analyzeSkillsSuccess,
  analyzeSkillsFailure,
} = skillsSlice.actions;
export default skillsSlice.reducer;

