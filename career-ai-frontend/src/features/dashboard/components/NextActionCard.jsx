import { useNavigate } from 'react-router-dom';
import { Zap, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Card from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import { cn } from '@utils/helpers';
import { useDashboard } from '../hooks/useDashboard';

/**
 * NextActionCard Component
 * Highlights the most important action for the user
 */
const NextActionCard = () => {
  const { atsScore, nextAction: apiNextAction } = useDashboard({ autoLoad: false });
  const navigate = useNavigate();

  // Use real backend data, fallback to sensible defaults
  const nextAction = apiNextAction
    ? {
      type: apiNextAction.type,
      priority: apiNextAction.priority,
      title: apiNextAction.title,
      description: apiNextAction.description,
      actionLabel: 'Take Action',
      actionRoute: apiNextAction.actionUrl || '/resume/issues',
      estimatedTime: '10 minutes',
      impact: 'High - Improves interview chances',
    }
    : {
      type: 'fix_resume',
      priority: 'high',
      title: 'Fix Critical Resume Issues',
      description: `Your ATS score is at ${atsScore?.overall ?? '--'}. Add missing keywords to reach 85%+`,
      actionLabel: 'Fix Issues Now',
      actionRoute: '/resume/issues',
      estimatedTime: '10 minutes',
      impact: 'High - Improves interview chances by 40%',
    };

  const getPriorityIcon = (priority) => {
    return <Zap className="w-5 h-5" />;
  };

  return (
    <Card className="relative overflow-hidden border-2 border-brand-primary bg-gradient-to-br from-brand-primary/5 to-transparent">
      {/* Priority Badge */}
      <div className="absolute top-4 right-4">
        <Badge variant="error" className="font-semibold">
          {nextAction.priority.toUpperCase()} PRIORITY
        </Badge>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
              {getPriorityIcon(nextAction.priority)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">
                  Next Recommended Action
                </span>
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                {nextAction.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-text-secondary">
            {nextAction.description}
          </p>

          {/* Metrics */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-secondary">
                {nextAction.estimatedTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-status-success" />
              <span className="text-sm text-text-secondary">
                {nextAction.impact}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Action Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(nextAction.actionRoute)}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="bg-brand-primary hover:bg-brand-primary/90 shadow-lg hover:shadow-xl"
          >
            {nextAction.actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NextActionCard;