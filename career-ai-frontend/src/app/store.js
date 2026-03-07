import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slices/authSlice';
import onboardingReducer from '../features/onboarding/slices/onboardingSlice';
import resumeReducer from '../features/resume/slices/resumeSlice';
import skillsReducer from '../features/skills/slices/skillsSlice';
import dashboardReducer from '../features/dashboard/slices/dashboardSlice';
import chatReducer from '../features/chat/slices/chatSlice';
import profileReducer from '../features/profile/slices/profileSlice';

/**
 * Redux Store Configuration
 * Centralized state management for the application
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    onboarding: onboardingReducer,
    resume: resumeReducer,
    skills: skillsReducer,
    dashboard: dashboardReducer,
    chat: chatReducer,
    profile: profileReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.lastLogin'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export const selectAuthState = (state) => state.auth;
export const selectOnboardingState = (state) => state.onboarding;
export const selectResumeState = (state) => state.resume;
export const selectSkillsState = (state) => state.skills;
export const selectDashboardState = (state) => state.dashboard;
export const selectChatState = (state) => state.chat;
export const selectProfileState = (state) => state.profile;