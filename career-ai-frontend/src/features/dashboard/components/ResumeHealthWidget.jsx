import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import { CircularProgress } from '@common/ProgressBar';
import { ROUTES } from '@constants/routes';
import { getATSScoreColor, formatDate } from '@utils/helpers';

/**
 * ResumeHealthWidget Component
 * Displays ATS score and top resume issues
 */
const ResumeHealthWidget = () => {
  const navigate = useNavigate();
  const dashboardData = useSelector((state) => state.dashboard.stats);

  // Mock data - in real app this comes from Redux
  const resumeHealth = {
    atsScore: 72,
    breakdown: {
      keywordMatch: 68,
      skillCoverage: 75,
      formattingScore: 80,
    },
    lastUpdated: new Date('2024-01-20').toISOString(),
    topIssues: [
      {
        id: 1,
        severity: 'high',
        title: 'Missing Keywords',
        description: 'Add 5 key skills',
      },
      {
        id: 2,
        severity: 'medium',
        title: 'Weak Action Verbs',
        description: '8 bullet points to improve',
      },
      {
        id: 3,
        severity: 'low',
        title: 'Formatting Issues',
        description: 'Minor spacing issues',
      },
    ],
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getScoreVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Resume Health Check</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              Last updated: {formatDate(resumeHealth.lastUpdated)}
            </p>
          </div>
          <FileText className="w-5 h-5 text-text-muted" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="flex items-center gap-6">
            <CircularProgress
              value={resumeHealth.atsScore}
              size={120}
              strokeWidth={10}
              variant={getScoreVariant(resumeHealth.atsScore)}
              label="ATS Score"
            />

            {/* Breakdown */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Keyword Match</span>
                <span className="text-sm font-medium text-text-primary">
                  {resumeHealth.breakdown.keywordMatch}%
                </span>
              </div>
              <div className="w-full bg-surface-alt rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${resumeHealth.breakdown.keywordMatch}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Skill Coverage</span>
                <span className="text-sm font-medium text-text-primary">
                  {resumeHealth.breakdown.skillCoverage}%
                </span>
              </div>
              <div className="w-full bg-surface-alt rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${resumeHealth.breakdown.skillCoverage}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Formatting</span>
                <span className="text-sm font-medium text-text-primary">
                  {resumeHealth.breakdown.formattingScore}%
                </span>
              </div>
              <div className="w-full bg-surface-alt rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${resumeHealth.breakdown.formattingScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Top Issues */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Top Issues to Fix
            </h4>
            <div className="space-y-2">
              {resumeHealth.topIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-surface-alt hover:bg-surface-alt/70 transition-colors cursor-pointer"
                  onClick={() => navigate(ROUTES.RESUME_ISSUES)}
                >
                  <Badge
                    variant={getSeverityColor(issue.severity)}
                    size="sm"
                    className="mt-0.5"
                  >
                    {issue.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {issue.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {issue.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.RESUME_ANALYSIS)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Full Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeHealthWidget;