import { CheckCircle2, AlertTriangle, MinusCircle, TrendingUp } from 'lucide-react';
import Badge from '@common/Badge';
import { cn } from '@utils/helpers';

const SkillCard = ({ skill, onClick }) => {

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
        return 'Core Skill';
      case 'weak':
        return 'Nice to Have';
      case 'missing':
        return 'Emerging Tech';
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

  const getInsightText = (status) => {
    switch (status) {
      case 'strong':
        return 'Detected in your resume';
      case 'weak':
        return 'Recommended to strengthen your profile';
      case 'missing':
        return 'Trending technology in the industry';
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer',
        skill.status === 'strong' && 'border-status-success/30 bg-status-success/5',
        skill.status === 'weak' && 'border-status-warning/30 bg-status-warning/5',
        skill.status === 'missing' && 'border-status-error/30 bg-status-error/5'
      )}
    >
      <div className="flex items-start justify-between">

        <div className="flex items-start gap-3">
          {getStatusIcon(skill.status)}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-text-primary">
                {skill.name}
              </h4>

              {skill.trendingUp && (
                <TrendingUp className="w-4 h-4 text-status-success" />
              )}
            </div>

            <p className="text-xs text-text-muted mt-1">
              {getInsightText(skill.status)}
            </p>
          </div>
        </div>

        <Badge variant={getStatusColor(skill.status)} size="sm">
          {getStatusLabel(skill.status)}
        </Badge>

      </div>
    </div>
  );
};

export default SkillCard;