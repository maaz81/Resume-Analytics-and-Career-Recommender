// ===== src/pages/Resume/ResumeIssuesPage.jsx =====
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import ResumeIssuesList from '@features/resume/components/ResumeIssuesList';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { ROUTES } from '@constants/routes';

const ResumeIssuesPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, getResumeIssues } = useResume();
  const [issuesData, setIssuesData] = React.useState(null);

  useEffect(() => {
    const loadIssues = async () => {
      const result = await getResumeIssues();
      if (result.success) {
        setIssuesData(result.data);
      }
    };
    loadIssues();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Loading issues..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load resume issues: {error}
      </Alert>
    );
  }

  if (!issuesData) {
    return null;
  }

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

        <h1 className="text-3xl font-bold text-text-primary">Resume Issues</h1>
        <p className="text-text-secondary mt-1">
          Fix these issues to improve your ATS score
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Total Issues</p>
                <p className="text-3xl font-bold text-text-primary">
                  {issuesData.totalIssues}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Badge variant="default" size="lg">
                  All
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Critical</p>
                <p className="text-3xl font-bold text-status-error">
                  {issuesData.criticalIssues}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-error/10 flex items-center justify-center">
                <Badge variant="error" size="lg">
                  High
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Potential Gain</p>
                <p className="text-3xl font-bold text-status-success">
                  +19
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
                <Badge variant="success" size="lg">
                  pts
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Fixes */}
      {issuesData.quickFixes && issuesData.quickFixes.length > 0 && (
        <Card className="border-2 border-brand-primary/20 bg-brand-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-primary" />
              <CardTitle>Quick Fixes</CardTitle>
            </div>
            <p className="text-sm text-text-muted mt-1">
              Apply these fixes to get immediate improvements
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issuesData.quickFixes.map((fix) => (
                <div
                  key={fix.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface-card border border-border hover:border-brand-primary transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{fix.action}</p>
                    <p className="text-xs text-status-success mt-1">{fix.impact}</p>
                  </div>
                  <Button variant="primary" size="sm">
                    Apply Fix
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      <ResumeIssuesList issues={issuesData.issues} />
    </div>
  );
};

export default ResumeIssuesPage;
