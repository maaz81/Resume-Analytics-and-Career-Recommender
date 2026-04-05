// ===== src/pages/Resume/ResumeAnalysisPage.jsx =====
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, ArrowRight } from 'lucide-react';
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

// ── Constants ─────────────────────────────────────────────────────────────────

/** Both columns will always show exactly this many items */
const MAX_ITEMS = 8;

// ── Static fallback data ───────────────────────────────────────────────────────

const FALLBACK_STRENGTHS = [
  'Professional summary clearly states your role and experience level',
  'Work experience is listed in reverse chronological order',
  'Contact information is complete with email, phone and LinkedIn',
  'Education section is present and properly formatted',
  'Technical skills section includes a mix of languages and tools',
  'Project descriptions mention technologies and responsibilities',
  'Resume length is appropriate for your experience level',
  'Consistent formatting across all sections improves readability',
];

const FALLBACK_GAPS = [
  "react",
  "java",
  "docker",
  "aws",
  "typescript",
  "next.js",
  "graphql",
  "kubernetes"
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalises a list to exactly MAX_ITEMS entries.
 * Real backend data comes first; remaining slots are filled from fallback.
 * Never duplicates items.
 */
function normaliseList(list, fallback) {
  const real = Array.isArray(list) && list.length > 0 ? list : [];
  const filled = [...real];

  for (const item of fallback) {
    if (filled.length >= MAX_ITEMS) break;
    if (!filled.includes(item)) filled.push(item);
  }

  return filled.slice(0, MAX_ITEMS);
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const rawStrengths = analysis.targetRoleComparison?.strengths;
  const rawGaps = analysis.targetRoleComparison?.gaps;

  const strengths = normaliseList(rawStrengths, FALLBACK_STRENGTHS);
  const gaps = normaliseList(rawGaps, FALLBACK_GAPS);

  // How many of each list came from the backend (real data)
  const realStrengthCount = Array.isArray(rawStrengths) ? rawStrengths.length : 0;
  const realGapCount = Array.isArray(rawGaps) ? rawGaps.length : 0;

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
            <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-brand-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-text-primary truncate"
                title={analysis.fileName}
              >
                {analysis.fileName}
              </h3>
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

      {/* ATS Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ATSScoreCard atsScore={analysis.atsScore} />
        </div>
        <div className="lg:col-span-2">
          <ATSBreakdown breakdown={analysis.atsScore.breakdown} />
        </div>
      </div>

      {/* Target Role Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Target Role Match</CardTitle>
              <p className="text-sm text-text-muted mt-1">
                How well you match: {analysis.targetRoleComparison?.role || 'Your target role'}
              </p>
            </div>
            <span className="text-2xl font-bold text-brand-primary">
              {analysis.targetRoleComparison?.matchPercentage ?? '—'}%
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Strengths ── */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-status-success-light flex items-center justify-center flex-shrink-0">
                  <span className="text-status-success text-[10px] font-bold">✓</span>
                </span>
                Strengths
                <span className="ml-auto text-xs font-normal text-text-muted bg-surface-alt px-2 py-0.5 rounded-full">
                  {MAX_ITEMS}
                </span>
              </h4>
              <ul className="space-y-2.5">
                {strengths.map((item, index) => {
                  const isFallback = index >= realStrengthCount;
                  return (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="text-status-success mt-0.5 flex-shrink-0 text-sm">✓</span>
                      <span
                        className={`text-sm leading-snug ${isFallback ? 'text-text-muted' : 'text-text-secondary'
                          }`}
                      >
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ── Areas to Improve ── */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-status-error-light flex items-center justify-center flex-shrink-0">
                  <span className="text-status-error text-[10px] font-bold">✗</span>
                </span>
                Areas to Improve
                <span className="ml-auto text-xs font-normal text-text-muted bg-surface-alt px-2 py-0.5 rounded-full">
                  {MAX_ITEMS}
                </span>
              </h4>
              <ul className="space-y-2.5">
                {gaps.map((item, index) => {
                  const isFallback = index >= realGapCount;
                  return (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="text-status-error mt-0.5 flex-shrink-0 text-sm">✗</span>
                      <span
                        className={`text-sm leading-snug ${isFallback ? 'text-text-muted' : 'text-text-secondary'
                          }`}
                      >
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
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
            {[
              'Upload a new version after making significant changes',
              'Keep 3–5 versions to track your improvement over time',
              'Restore previous versions if you need to revert changes',
              'Compare versions to see what improvements worked best',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-brand-primary mt-1 flex-shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
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