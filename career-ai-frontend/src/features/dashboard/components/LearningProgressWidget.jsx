import { useNavigate } from 'react-router-dom';
import { Map, ArrowRight, Flame, Clock, CheckCircle2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import ProgressBar from '@common/ProgressBar';
import Badge from '@common/Badge';
import { ROUTES } from '@constants/routes';
import { formatDate } from '@utils/helpers';

/**
 * LearningProgressWidget Component
 * Displays current learning roadmap progress
 */
const LearningProgressWidget = () => {
  const navigate = useNavigate();

  // Mock data
  const learningProgress = {
    currentPhase: 'Week 2: TypeScript Fundamentals',
    completedSkills: 2,
    totalSkills: 12,
    progressPercentage: 17,
    currentSkill: {
      name: 'TypeScript',
      topic: 'Advanced Types & Generics',
      progress: 60,
      dueDate: new Date('2024-02-05').toISOString(),
    },
    weeklyStreak: 5,
    totalHoursLearned: 18,
    upcomingMilestones: [
      { skill: 'TypeScript', milestone: 'Complete basics', dueDate: '2024-02-05' },
      { skill: 'GraphQL', milestone: 'Start fundamentals', dueDate: '2024-02-12' },
    ],
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Learning Progress</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              {learningProgress.currentPhase}
            </p>
          </div>
          <Map className="w-5 h-5 text-text-muted" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">
                Overall Progress
              </span>
              <span className="text-sm font-semibold text-brand-primary">
                {learningProgress.completedSkills}/{learningProgress.totalSkills} skills
              </span>
            </div>
            <ProgressBar
              value={learningProgress.progressPercentage}
              variant="primary"
              size="md"
            />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-status-warning-light border border-status-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-status-warning-dark" />
                <p className="text-xs font-medium text-status-warning-dark">
                  Streak
                </p>
              </div>
              <p className="text-2xl font-bold text-status-warning-dark">
                {learningProgress.weeklyStreak}
              </p>
              <p className="text-xs text-status-warning-dark mt-0.5">days</p>
            </div>

            <div className="p-4 rounded-lg bg-status-info-light border border-status-info/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-status-info-dark" />
                <p className="text-xs font-medium text-status-info-dark">
                  Time Spent
                </p>
              </div>
              <p className="text-2xl font-bold text-status-info-dark">
                {learningProgress.totalHoursLearned}
              </p>
              <p className="text-xs text-status-info-dark mt-0.5">hours</p>
            </div>
          </div>

          {/* Current Skill */}
          <div className="p-4 rounded-lg bg-brand-primary/5 border border-brand-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-brand-primary mb-1">
                  Currently Learning
                </p>
                <h4 className="text-sm font-semibold text-text-primary">
                  {learningProgress.currentSkill.name}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {learningProgress.currentSkill.topic}
                </p>
              </div>
              <Badge variant="primary" size="sm">
                {learningProgress.currentSkill.progress}%
              </Badge>
            </div>
            <ProgressBar
              value={learningProgress.currentSkill.progress}
              variant="primary"
              size="sm"
            />
            <p className="text-xs text-text-muted mt-2">
              Due: {formatDate(learningProgress.currentSkill.dueDate)} (
              {getDaysUntil(learningProgress.currentSkill.dueDate)} days left)
            </p>
          </div>

          {/* Upcoming Milestones */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Upcoming Milestones
            </h4>
            <div className="space-y-2">
              {learningProgress.upcomingMilestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt"
                >
                  <div className="w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {milestone.milestone}
                    </p>
                    <p className="text-xs text-text-muted">
                      {milestone.skill} • {milestone.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.ROADMAP_OVERVIEW)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Full Roadmap
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningProgressWidget;