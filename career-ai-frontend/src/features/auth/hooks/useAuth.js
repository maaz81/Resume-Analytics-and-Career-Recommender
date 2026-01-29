import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  signupStart,
  signupSuccess,
  signupFailure,
  logout as logoutAction,
  selectAuth,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectUser,
} from '../slices/authSlice';
import {
  loginService,
  signupService,
  oauthLoginService,
  logoutService,
} from '../services/authService';
import { ROUTES } from '@constants/routes';

/**
 * useAuth Hook
 * Centralized authentication logic
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectUser);

  /**
   * Login function
   */
  const login = async (credentials) => {
    try {
      dispatch(loginStart());
      const response = await loginService(credentials.email, credentials.password);
      dispatch(loginSuccess(response));
      
      // Navigate to dashboard or onboarding based on user state
      if (response.user.careerGoal) {
        navigate(ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.ONBOARDING_CAREER_GOAL);
      }
      
      return { success: true };
    } catch (err) {
      dispatch(loginFailure(err.message));
      return { success: false, error: err.message };
    }
  };

  /**
   * Signup function
   */
  const signup = async (userData) => {
    try {
      dispatch(signupStart());
      const response = await signupService(userData);
      dispatch(signupSuccess(response));
      
      // Navigate to onboarding after signup
      navigate(ROUTES.ONBOARDING_CAREER_GOAL);
      
      return { success: true };
    } catch (err) {
      dispatch(signupFailure(err.message));
      return { success: false, error: err.message };
    }
  };

  /**
   * OAuth login function
   */
  const oauthLogin = async (provider) => {
    try {
      dispatch(loginStart());
      const response = await oauthLoginService(provider);
      dispatch(loginSuccess(response));
      
      // Navigate to dashboard or onboarding
      if (response.user.careerGoal) {
        navigate(ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.ONBOARDING_CAREER_GOAL);
      }
      
      return { success: true };
    } catch (err) {
      dispatch(loginFailure(err.message));
      return { success: false, error: err.message };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      await logoutService();
      dispatch(logoutAction());
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if service fails
      dispatch(logoutAction());
      navigate(ROUTES.LOGIN);
    }
  };

  return {
    // State
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    signup,
    oauthLogin,
    logout,
  };
};