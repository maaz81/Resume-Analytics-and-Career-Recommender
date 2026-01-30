import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import ProgressBar from '@common/ProgressBar';
import { ROUTES } from '@constants/routes';
import { cn } from '@utils/helpers';

/**
 * SkillGapWidget Component
 * Displays skill gap analysis and priority skills
 */
const SkillGapWidget = () => {
  const navigate = useNavigate();

  // Mock data
  const skillGap = {
    totalGaps: 12,
    critical: 5,
    important: 4,
    optional: 3,
    coreSkills: [
      { skill: 'React', status: 'strong', proficiency: 85 },
      { skill: 'TypeScript', status: 'missing', proficiency: 0 },
      { skill: 'Node.js', status: 'weak', proficiency: 45 },
      { skill: 'GraphQL', status: 'missing', proficiency: 0 },
      { skill: 'AWS', status: 'weak', proficiency: 30 },
    ],
    prioritySkills: [
      { skill: 'TypeScript', priority: 'high', timeToLearn: '4 weeks' },
      { skill: 'GraphQL', priority: 'high', timeToLearn: '3 weeks' },
      { skill: 'Docker', priority: 'medium', timeToLearn: '2 weeks' },
    ],
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'strong':
        return <CheckCircle2 className="w-4 h-4 text-status-success" />;
      case 'weak':
        return <MinusCircle className="w-4 h-4 text-status-warning" />;
      case 'missing':
        return <AlertTriangle className="w-4 h-4 text-status-error" />;
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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Skill Gap Analysis</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              {skillGap.totalGaps} skills to improve
            </p>
          </div>
          <Target className="w-5 h-5 text-text-muted" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-status-error-light border border-status-error/20">
              <p className="text-2xl font-bold text-status-error-dark">
                {skillGap.critical}
              </p>
              <p className="text-xs text-status-error-dark mt-1">Critical</p>
            </div>
            <div className="p-3 rounded-lg bg-status-warning-light border border-status-warning/20">
              <p className="text-2xl font-bold text-status-warning-dark">
                {skillGap.important}
              </p>
              <p className="text-xs text-status-warning-dark mt-1">Important</p>
            </div>
            <div className="p-3 rounded-lg bg-status-info-light border border-status-info/20">
              <p className="text-2xl font-bold text-status-info-dark">
                {skillGap.optional}
              </p>
              <p className="text-xs text-status-info-dark mt-1">Optional</p>
            </div>
          </div>

          {/* Core Skills Status */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Core Skills Status
            </h4>
            <div className="space-y-3">
              {skillGap.coreSkills.map((item) => (
                <div key={item.skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-text-primary">
                        {item.skill}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">
                        {item.proficiency}%
                      </span>
                      <Badge variant={getStatusColor(item.status)} size="sm">
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </div>
                  <ProgressBar
                    value={item.proficiency}
                    size="sm"
                    variant={
                      item.status === 'strong'
                        ? 'success'
                        : item.status === 'weak'
                          ? 'warning'
                          : 'error'
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Priority Learning */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Learn Next
            </h4>
            <div className="space-y-2">
              {skillGap.prioritySkills.map((item, index) => (
                <div
                  key={item.skill}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-alt hover:bg-surface-alt/70 transition-colors cursor-pointer"
                  onClick={() => navigate(ROUTES.SKILL_GAP)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {item.skill}
                      </p>
                      <p className="text-xs text-text-muted">
                        {item.timeToLearn} to learn
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.priority === 'high' ? 'error' : 'warning'} size="sm">
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.SKILL_GAP)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View All Skills
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillGapWidget;