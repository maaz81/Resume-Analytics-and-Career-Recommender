import { CheckCircle2, AlertTriangle, MinusCircle, TrendingUp, Award } from 'lucide-react';
import Badge from '@common/Badge';
import ProgressBar from '@common/ProgressBar';
import { cn } from '@utils/helpers';

/**
 * SkillCard Component
 * Displays individual skill with status and proficiency
 */
const SkillCard = ({ skill, onClick, compact = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'strong':
        return <CheckCircle2 className="w-5 h-5 text-status-success" />;
      case 'weak':
        return <MinusCircle className="w-5 h-5 text-status-warning" />;
      case 'missing':
        return <AlertTriangle className="w-5 h-5 text-status-error" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'strong':
        return 'Strong';
      case 'weak':
        return 'Needs Work';
      case 'missing':
        return 'Missing';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'strong':
        return 'success';
      case 'weak':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressVariant = (status) => {
    switch (status) {
      case 'strong':
        return 'success';
      case 'weak':
        return 'warning';
      case 'missing':
        return 'error';
      default:
        return 'default';
    }
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'p-3 rounded-lg border transition-all duration-200 cursor-pointer',
          skill.status === 'strong' && 'border-status-success/20 bg-status-success/5 hover:bg-status-success/10',
          skill.status === 'weak' && 'border-status-warning/20 bg-status-warning/5 hover:bg-status-warning/10',
          skill.status === 'missing' && 'border-status-error/20 bg-status-error/5 hover:bg-status-error/10'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(skill.status)}
            <span className="font-medium text-text-primary">{skill.name}</span>
          </div>
          <Badge variant={getStatusColor(skill.status)} size="sm">
            {skill.proficiency}%
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer',
        skill.status === 'strong' && 'border-status-success/30 bg-status-success/5 hover:border-status-success',
        skill.status === 'weak' && 'border-status-warning/30 bg-status-warning/5 hover:border-status-warning',
        skill.status === 'missing' && 'border-status-error/30 bg-status-error/5 hover:border-status-error'
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getStatusIcon(skill.status)}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-text-primary">{skill.name}</h4>
                {skill.trendingUp && (
                  <TrendingUp className="w-3.5 h-3.5 text-status-success" />
                )}
              </div>
              <p className="text-xs text-text-muted mt-1">
                {skill.userLevel ? `Your level: ${skill.userLevel}` : 'Not learned yet'}
                {' • '}
                Required: {skill.requiredLevel}
              </p>
            </div>
          </div>
          <Badge variant={getStatusColor(skill.status)} size="sm">
            {getStatusLabel(skill.status)}
          </Badge>
        </div>

        {/* Proficiency Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Proficiency</span>
            <span className="text-sm font-semibold text-text-primary">
              {skill.proficiency}%
            </span>
          </div>
          <ProgressBar
            value={skill.proficiency}
            variant={getProgressVariant(skill.status)}
            size="sm"
          />
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            {skill.yearsExperience > 0 && (
              <span>{skill.yearsExperience}y experience</span>
            )}
            {skill.lastUsed && (
              <span>Last used: {new Date(skill.lastUsed).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            )}
          </div>
          {skill.inDemand && (
            <Badge variant="info" size="sm" icon={<Award className="w-3 h-3" />}>
              In Demand
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;