import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import ProgressBar from '@common/ProgressBar';
import { BarChart3, CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * ATSBreakdown Component
 * Detailed breakdown of ATS score components
 */
const ATSBreakdown = ({ breakdown }) => {
  const metrics = [
    {
      key: 'keywordMatch',
      label: 'Keyword Match',
      description: 'How well your resume matches job keywords',
      icon: CheckCircle2,
    },
    {
      key: 'skillCoverage',
      label: 'Skill Coverage',
      description: 'Percentage of required skills present',
      icon: BarChart3,
    },
    {
      key: 'formattingScore',
      label: 'Formatting',
      description: 'ATS-friendly structure and layout',
      icon: MinusCircle,
    },
    {
      key: 'experienceAlignment',
      label: 'Experience Alignment',
      description: 'Relevance of your experience to target role',
      icon: AlertCircle,
    },
  ];

  const getScoreVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-status-success';
    if (score >= 60) return 'text-status-warning';
    return 'text-status-error';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
        <p className="text-sm text-text-muted mt-1">
          Detailed analysis of each component
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => {
            const score = breakdown[metric.key];
            const Icon = metric.icon;
            
            return (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                      score >= 80 ? 'bg-status-success/10' : score >= 60 ? 'bg-status-warning/10' : 'bg-status-error/10'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        score >= 80 ? 'text-status-success' : score >= 60 ? 'text-status-warning' : 'text-status-error'
                      )} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-text-primary">
                        {metric.label}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        {metric.description}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-2xl font-bold',
                    getScoreColor(score)
                  )}>
                    {score}%
                  </span>
                </div>
                
                <ProgressBar
                  value={score}
                  variant={getScoreVariant(score)}
                  size="md"
                />

                {/* Improvement Tips */}
                {score < 80 && (
                  <div className="ml-11 p-3 rounded-lg bg-surface-alt">
                    <p className="text-xs text-text-secondary">
                      {score < 60 ? (
                        <span className="font-medium text-status-error">Critical: </span>
                      ) : (
                        <span className="font-medium text-status-warning">Tip: </span>
                      )}
                      {metric.key === 'keywordMatch' && 'Add more job-specific keywords from the job description'}
                      {metric.key === 'skillCoverage' && 'List all relevant technical and soft skills'}
                      {metric.key === 'formattingScore' && 'Use standard section headers and simple formatting'}
                      {metric.key === 'experienceAlignment' && 'Highlight achievements relevant to the target role'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ATSBreakdown;