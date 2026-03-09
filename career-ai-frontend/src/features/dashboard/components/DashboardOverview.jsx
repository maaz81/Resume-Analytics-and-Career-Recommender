import { FileText, Target, Map, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from './StatsCard';
import NextActionCard from './NextActionCard';
import ResumeHealthWidget from './ResumeHealthWidget';
import SkillGapWidget from './SkillGapWidget';
import LearningProgressWidget from './LearningProgressWidget';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { useDashboard } from '../hooks/useDashboard';
import { ROUTES } from '@constants/routes';

/**
 * DashboardOverview Component
 * Main dashboard layout with all widgets
 */
const DashboardOverview = () => {
  const { isLoading, error, atsScore, stats, profile } = useDashboard();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'User';
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="mb-6">
        Failed to load dashboard: {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome back, {firstName}!
        </h1>
        <p className="text-text-secondary mt-1">
          Here's your career progress at a glance
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="ATS Score"
          value={atsScore?.overall ? Math.round(atsScore.overall) : 0}
          suffix="%"
          icon={FileText}
          variant="primary"
          trend={{ direction: 'up', value: 5 }}
        />
        <StatsCard
          title="Total Resumes"
          value={stats?.total_resumes || 0}
          icon={FileText}
          variant="warning"
        />
        <StatsCard
          title="Total ATS Scans"
          value={stats?.total_ats_scans || 0}
          icon={Target}
          variant="success"
        />
        <StatsCard
          title="Job Matches"
          value={24}
          icon={Briefcase}
          variant="default"
        />
      </div>

      {/* Next Action Card */}
      <NextActionCard />

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Health - Full width on mobile, spans 1 col on desktop */}
        <div className="lg:col-span-1">
          <ResumeHealthWidget />
        </div>

        {/* Skill Gap - Full width on mobile, spans 1 col on desktop */}
        <div className="lg:col-span-1">
          <SkillGapWidget />
        </div>

        {/* Learning Progress - Full width on mobile, spans 1 col on desktop */}
        <div className="lg:col-span-1">
          <LearningProgressWidget />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button className="p-4 rounded-lg border border-border hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group" onClick={() => navigate(ROUTES.ONBOARDING_RESUME_UPLOAD)}>
          <FileText className="w-6 h-6 text-brand-primary mb-2" />
          <h4 className="font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
            Upload New Resume
          </h4>
          <p className="text-sm text-text-muted mt-1">
            Get instant ATS analysis
          </p>
        </button>

        <button className="p-4 rounded-lg border border-border hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group"
          onClick={() => navigate(ROUTES.SKILL_GAP)}>
          <Target className="w-6 h-6 text-brand-primary mb-2" />
          <h4 className="font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
            Explore Skills
          </h4>
          <p className="text-sm text-text-muted mt-1">
            View all skill gaps
          </p>
        </button>

        <button className="p-4 rounded-lg border border-border hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left group">
          <Briefcase className="w-6 h-6 text-brand-primary mb-2" />
          <h4 className="font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
            Browse Jobs
          </h4>
          <p className="text-sm text-text-muted mt-1">
            24 matches available
          </p>
        </button>
      </div>
    </div>
  );
};

export default DashboardOverview;