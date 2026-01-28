// ===== src/features/onboarding/slices/onboardingSlice.js =====
import { createSlice } from '@reduxjs/toolkit';

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState: {
    currentStep: 1,
    careerGoal: null,
    isCompleted: false,
  },
  reducers: {
    setCareerGoal: (state, action) => {
      state.careerGoal = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    previousStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1;
    },
    completeOnboarding: (state) => {
      state.isCompleted = true;
    },
    resetOnboarding: (state) => {
      state.currentStep = 1;
      state.careerGoal = null;
      state.isCompleted = false;
    },
  },
});

export const { setCareerGoal, nextStep, previousStep, completeOnboarding, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;

