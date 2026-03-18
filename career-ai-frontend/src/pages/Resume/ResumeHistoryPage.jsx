// ===== src/pages/Resume/ResumeHistoryPage.jsx =====
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, TrendingUp, History } from 'lucide-react';
import ResumeVersionCard from '@features/resume/components/ResumeVersionCard';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { ROUTES } from '@constants/routes';
import useResume from '@features/resume/hooks/useResume';

const ResumeHistoryPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, getResumeHistory } = useResume();
  const [historyData, setHistoryData] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      const result = await getResumeHistory();
      if (result.success) {
        setHistoryData(result.data);
      }
    };
    loadHistory();
  }, []);

  const handleView = (resume) => {
    navigate(ROUTES.RESUME_ANALYSIS);
  };

  const handleRestore = (resume) => {
    if (window.confirm(`Restore ${resume.fileName} as current version?`)) {
      // In real app, call API to restore
      alert('Resume restored successfully!');
    }
  };

  const handleDelete = (resume) => {
    if (window.confirm(`Delete ${resume.fileName}? This action cannot be undone.`)) {
      // In real app, call API to delete
      alert('Resume deleted successfully!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Loading resume history..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load resume history: {error}
      </Alert>
    );
  }

  if (!historyData) {
    return null;
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <History className="w-12 h-12 text-text-muted mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">No Resume History</h2>
        <p className="text-text-secondary mb-6 max-w-md">
          You haven't uploaded any resumes yet. Upload your first resume to start tracking improvements.
        </p>
        <Button
          variant="primary"
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={() => navigate(ROUTES.ONBOARDING_RESUME_UPLOAD)}
        >
          Upload Resume
        </Button>
      </div>
    );
  }

  // Calculate score improvement
  const oldestResume = historyData[historyData.length - 1];
  const currentResume = historyData[0];
  const scoreImprovement = currentResume.atsScore - oldestResume.atsScore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(ROUTES.RESUME_ANALYSIS)}
          className="mb-4"
        >
          Back to Analysis
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Resume History</h1>
            <p className="text-text-secondary mt-1">
              Track your resume improvements over time
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.ONBOARDING_RESUME_UPLOAD)}
          >
            Upload New Version
          </Button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Total Versions</p>
                <p className="text-3xl font-bold text-text-primary">
                  {historyData.length}
                </p>
              </div>
              <History className="w-8 h-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Current Score</p>
                <p className="text-3xl font-bold text-brand-primary">
                  {currentResume.atsScore}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-brand-primary">
                  {currentResume.version}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Score Improvement</p>
                <p className="text-3xl font-bold text-status-success">
                  {scoreImprovement > 0 ? `+${scoreImprovement}` : scoreImprovement}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-status-success" />
            </div>
            <p className="text-xs text-text-muted mt-2">since first version</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Score Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-2">
            {historyData.slice().reverse().map((resume, idx) => {
              const height = (resume.atsScore / 100) * 100;
              return (
                <div key={resume.id} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-brand-primary mb-1">
                      {resume.atsScore}%
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-brand-primary to-brand-primary/50 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    />
                  </div>
                  <span className="text-xs text-text-muted">v{resume.version}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          All Versions
        </h2>
        <div className="space-y-4">
          {historyData.map((resume) => (
            <ResumeVersionCard
              key={resume.id}
              resume={resume}
              isCurrent={resume.status === 'current'}
              onView={handleView}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Tips Card */}
      <Card className="border-2 border-brand-primary/20 bg-brand-primary/5">
        <CardContent className="p-6">
          <h3 className="font-semibold text-text-primary mb-3">
            💡 Resume Version Best Practices
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>Upload a new version after making significant changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>Keep 3-5 versions to track your improvement over time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>Restore previous versions if you need to revert changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-primary mt-1">•</span>
              <span>Compare versions to see what improvements worked best</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeHistoryPage;
