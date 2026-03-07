import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Layouts
import AuthLayout from '@components/layout/AuthLayout';
import AppLayout from '@components/layout/AppLayout';

// Pages
import LoginPage from '@pages/Auth/LoginPage';
import SignupPage from '@pages/Auth/SignupPage';
import CareerGoalPage from '@pages/Onboarding/CareerGoalPage';
import ResumeUploadPage from '@pages/Onboarding/ResumeUploadPage';
import DashboardPage from '@pages/Dashboard/DashboardPage';
import ResumeAnalysisPage from '@pages/Resume/ResumeAnalysisPage';
import ResumeIssuesPage from '@pages/Resume/ResumeIssuesPage';
import ResumeHistoryPage from '@pages/Resume/ResumeHistoryPage';
import SkillGapPage from '@pages/Skills/SkillGapPage';
import SkillPriorityPage from '@pages/Skills/SkillPriorityPage';
import ProfilePage from '@pages/Profile/ProfilePage';
import NotFoundPage from '@pages/NotFound/NotFoundPage';
import OAuthSuccess from './OAuthSuccess';

/**
 * Application Routes Configuration
 * Defines all route paths and their components
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Redirect to dashboard if authenticated */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.SIGNUP}
        element={
          <PublicRoute>
            <AuthLayout>
              <SignupPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* Onboarding Routes - Protected */}
      <Route
        path={ROUTES.ONBOARDING_CAREER_GOAL}
        element={
          <ProtectedRoute>
            <AuthLayout>
              <CareerGoalPage />
            </AuthLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ONBOARDING_RESUME_UPLOAD}
        element={
          <ProtectedRoute>
            <AuthLayout>
              <ResumeUploadPage />
            </AuthLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - With App Layout (Sidebar + Header) */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESUME_ANALYSIS}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResumeAnalysisPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESUME_ISSUES}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResumeIssuesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESUME_HISTORY}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ResumeHistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SKILL_GAP}
        element={
          <ProtectedRoute>
            <AppLayout>
              <SkillGapPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SKILL_PRIORITY}
        element={
          <ProtectedRoute>
            <AppLayout>
              <SkillPriorityPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      {/* 404 Not Found */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;