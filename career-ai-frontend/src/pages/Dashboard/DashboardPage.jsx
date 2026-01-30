// ===== src/pages/Dashboard/DashboardPage.jsx =====
import DashboardOverview from '@features/dashboard/components/DashboardOverview';

const DashboardPage = () => {
  return <DashboardOverview />;
};

const ResumeAnalysisPage = () => {
  return <div>Resume Analysis Page - Will implement soon</div>;
};

const ResumeIssuesPage = () => {
  return <div>Resume Issues Page - Will implement soon</div>;
};

const ResumeHistoryPage = () => {
  return <div>Resume History Page - Will implement soon</div>;
};

const SkillGapPage = () => {
  return <div>Skill Gap Page - Will implement soon</div>;
};

const SkillPriorityPage = () => {
  return <div>Skill Priority Page - Will implement soon</div>;
};

const RoadmapOverviewPage = () => {
  return <div>Roadmap Overview Page - Will implement soon</div>;
};

const RoadmapDetailPage = () => {
  return <div>Roadmap Detail Page - Will implement soon</div>;
};

const ProfilePage = () => {
  return <div>Profile Page - Will implement soon</div>;
};

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">404</h1>
        <p className="text-text-secondary">Page not found</p>
      </div>
    </div>
  );
};

export default DashboardPage;