import { CircularProgress } from '@common/ProgressBar';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Badge from '@common/Badge';
import { TrendingUp, Award } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * ATSScoreCard Component
 * Displays ATS score with grade and status
 */
const ATSScoreCard = ({ atsScore }) => {
  const getScoreVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'success' };
    if (score >= 60) return { label: 'Good', color: 'warning' };
    return { label: 'Needs Improvement', color: 'error' };
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
      case 'A+':
        return 'text-status-success';
      case 'B':
      case 'B+':
        return 'text-status-warning';
      default:
        return 'text-status-error';
    }
  };

  const status = getScoreStatus(atsScore.overall);

  return (
    <Card className="border-2 border-brand-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ATS Score</CardTitle>
          <Award className="w-5 h-5 text-brand-primary" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Score Display */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <CircularProgress
                value={atsScore.overall}
                size={180}
                strokeWidth={12}
                variant={getScoreVariant(atsScore.overall)}
                showLabel={false}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-text-primary">
                  {atsScore.overall}
                </span>
                <span className="text-sm text-text-muted mt-1">out of 100</span>
                <span className={cn('text-3xl font-bold mt-2', getGradeColor(atsScore.grade))}>
                  {atsScore.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant={status.color} size="lg" className="px-4 py-2">
              {status.label}
            </Badge>
          </div>

          {/* Interpretation */}
          <div className="p-4 rounded-lg bg-surface-alt">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                {atsScore.overall >= 80 && (
                  <>
                    <p className="font-medium text-text-primary mb-1">Great job!</p>
                    <p>Your resume is well-optimized for ATS systems. You're likely to pass most automated screenings.</p>
                  </>
                )}
                {atsScore.overall >= 60 && atsScore.overall < 80 && (
                  <>
                    <p className="font-medium text-text-primary mb-1">You're on the right track!</p>
                    <p>Your resume is good but has room for improvement. Fix the critical issues to reach 85%+.</p>
                  </>
                )}
                {atsScore.overall < 60 && (
                  <>
                    <p className="font-medium text-text-primary mb-1">Action needed</p>
                    <p>Your resume needs significant improvements to pass ATS screening. Start with the high-priority issues.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Score Target */}
          <div className="text-center">
            <p className="text-xs text-text-muted">
              Target score for most jobs: <span className="font-semibold text-text-primary">85+</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATSScoreCard;