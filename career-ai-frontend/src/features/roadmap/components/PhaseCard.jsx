import { Lock, CheckCircle2, PlayCircle, Calendar, Clock } from 'lucide-react';
import Badge from '@common/Badge';
import ProgressBar from '@common/ProgressBar';
import { cn } from '@utils/helpers';
import { formatDate } from '@utils/helpers';

/**
 * PhaseCard Component
 * Displays individual roadmap phase/week
 */
const PhaseCard = ({ phase, onClick, isActive = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-status-success" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-brand-primary" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-text-muted" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'locked':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'locked':
        return 'Locked';
      default:
        return status;
    }
  };

  const getBorderColor = (status, active) => {
    if (active) return 'border-brand-primary ring-2 ring-brand-primary/20';
    if (status === 'completed') return 'border-status-success/30';
    if (status === 'in_progress') return 'border-brand-primary/30';
    return 'border-border';
  };

  const getBgColor = (status) => {
    if (status === 'completed') return 'bg-status-success/5';
    if (status === 'in_progress') return 'bg-brand-primary/5';
    return 'bg-surface-card';
  };

  const isClickable = phase.status !== 'locked';

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        'p-5 rounded-lg border-2 transition-all duration-200',
        getBorderColor(phase.status, isActive),
        getBgColor(phase.status),
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-60'
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon(phase.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Week {phase.week}
                </span>
                {isActive && (
                  <Badge variant="primary" size="sm">
                    Current
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-text-primary">{phase.title}</h4>
              <p className="text-sm text-text-muted mt-0.5">{phase.skillName}</p>
            </div>
          </div>
          <Badge variant={getStatusColor(phase.status)} size="sm">
            {getStatusLabel(phase.status)}
          </Badge>
        </div>

        {/* Progress Bar (only if started) */}
        {phase.status !== 'locked' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-muted">Progress</span>
              <span className="text-sm font-semibold text-text-primary">
                {phase.progress}%
              </span>
            </div>
            <ProgressBar
              value={phase.progress}
              variant={phase.status === 'completed' ? 'success' : 'primary'}
              size="sm"
            />
          </div>
        )}

        {/* Topics List */}
        {phase.topics && phase.topics.length > 0 && (
          <div>
            <p className="text-xs font-medium text-text-primary mb-2">Topics:</p>
            <ul className="space-y-1">
              {phase.topics.slice(0, 3).map((topic, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="w-1 h-1 rounded-full bg-text-muted flex-shrink-0" />
                  <span className="truncate">{topic}</span>
                </li>
              ))}
              {phase.topics.length > 3 && (
                <li className="text-xs text-text-muted ml-3">
                  +{phase.topics.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(phase.startDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {phase.status === 'completed' 
                ? `${phase.hoursSpent}h spent`
                : `${phase.estimatedHours}h estimated`
              }
            </span>
          </div>
        </div>

        {/* Completion Date */}
        {phase.completedAt && (
          <div className="text-xs text-status-success">
            ✓ Completed on {formatDate(phase.completedAt)}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseCard;