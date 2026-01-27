import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth Slice - Manages authentication state
 */
const initialState = {
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login start
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Login success
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      // Persist token
      localStorage.setItem('auth_token', action.payload.token);
    },
    // Login failure
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('auth_token');
    },
    // Signup start
    signupStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    // Signup success
    signupSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('auth_token', action.payload.token);
    },
    // Signup failure
    signupFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
    },
    // Update user profile
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set user (for token validation)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout,
  updateUser,
  clearError,
  setUser,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;