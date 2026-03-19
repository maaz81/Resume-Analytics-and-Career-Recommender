// ===== src/pages/Resume/ResumeAnalysisPage.jsx =====
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Share2, Upload, ArrowRight } from 'lucide-react';
import ATSScoreCard from '@features/resume/components/ATSScoreCard';
import ATSBreakdown from '@features/resume/components/ATSBreakdown';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { ROUTES } from '@constants/routes';
import { formatDate } from '@utils/helpers';
import useResume from '@features/resume/hooks/useResume';

const ResumeAnalysisPage = () => {
  const navigate = useNavigate();
  const { analysis, isLoading, error, getResumeAnalysis } = useResume();

  useEffect(() => {
    getResumeAnalysis();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Analyzing resume..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load resume analysis: {error}
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Alert variant="info">
        No resume found. Please upload your resume first.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Resume Analysis</h1>
          <p className="text-text-secondary mt-1">
            Comprehensive ATS analysis of your resume
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => navigate(ROUTES.ONBOARDING_RESUME_UPLOAD)}
          >
            Upload New Version
          </Button>

        </div>
      </div>

      {/* Resume Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">{analysis.fileName}</h3>
              <p className="text-sm text-text-muted">
                Version {analysis.version} • Uploaded {formatDate(analysis.uploadedAt)}
              </p>
            </div>
            <Badge variant="success" size="lg">
              Current Version
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Score - Spans 1 column */}
        <div className="lg:col-span-1">
          <ATSScoreCard atsScore={analysis.atsScore} />
        </div>

        {/* Score Breakdown - Spans 2 columns */}
        <div className="lg:col-span-2">
          <ATSBreakdown breakdown={analysis.atsScore.breakdown} />
        </div>
      </div>

      {/* Target Role Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Target Role Match</CardTitle>
          <p className="text-sm text-text-muted mt-1">
            How well you match: {analysis.targetRoleComparison.role}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Match Percentage */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Overall Match</span>
              <span className="text-2xl font-bold text-brand-primary">
                {analysis.targetRoleComparison.matchPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Strengths</h4>
                <ul className="space-y-2">
                  {analysis.targetRoleComparison.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-status-success mt-1">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Areas to Improve</h4>
                <ul className="space-y-2">
                  {analysis.targetRoleComparison.gaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-status-error mt-1">✗</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(ROUTES.SKILL_GAP)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="flex-1"
        >
          View Detailed Issues
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate(ROUTES.RESUME_HISTORY)}
          className="flex-1"
        >
          View Resume History
        </Button>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;