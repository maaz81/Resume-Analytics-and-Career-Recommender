// ===== src/pages/Roadmap/RoadmapOverviewPage.jsx =====
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Flame, Clock, Award, Calendar, TrendingUp } from 'lucide-react';
import PhaseCard from '@features/roadmap/components/PhaseCard';
import RoadmapTimeline from '@features/roadmap/components/RoadmapTimeline';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import Tabs from '@common/Tabs';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { useRoadmap } from '@features/roadmap/hooks/useRoadmap';
import { ROUTES, generatePath } from '@constants/routes';
import { formatDate } from '@utils/helpers';

const RoadmapOverviewPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, getLearningRoadmap, viewMode, changeViewMode } = useRoadmap();
  const [roadmapData, setRoadmapData] = useState(null);
  useEffect(() => {
    const loadRoadmap = async () => {
      const result = await getLearningRoadmap();
      if (result.success) {
        setRoadmapData(result.data);
      }
    };
    loadRoadmap();
  }, []);

  const handlePhaseClick = (phase) => {
    if (phase.status !== 'locked') {
      navigate(generatePath(ROUTES.ROADMAP_DETAIL, { skillId: phase.id }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Loading roadmap..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load roadmap: {error}
      </Alert>
    );
  }

  if (!roadmapData) {
    return null;
  }

  // Create view tabs
  const viewTabs = [
    {
      id: 'grid',
      label: 'Grid View',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roadmapData.phases.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              onClick={() => handlePhaseClick(phase)}
              isActive={phase.week === roadmapData.progress.currentWeek}
            />
          ))}
        </div>
      ),
    },
    {
      id: 'timeline',
      label: 'Timeline View',
      content: (
        <RoadmapTimeline
          phases={roadmapData.phases}
          currentWeek={roadmapData.progress.currentWeek}
          onPhaseClick={handlePhaseClick}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Learning Roadmap</h1>
          <p className="text-text-secondary mt-1">
            Your personalized path to becoming a {roadmapData.targetRole}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="lg">
            {roadmapData.totalDuration}
          </Badge>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Overall Progress</p>
                <p className="text-3xl font-bold text-brand-primary">
                  {roadmapData.progress.overallProgress}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-brand-primary" />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {roadmapData.progress.completedSkills} of {roadmapData.progress.totalSkills} skills
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Weekly Streak</p>
                <p className="text-3xl font-bold text-status-warning">
                  {roadmapData.progress.weeklyStreak}
                </p>
              </div>
              <Flame className="w-8 h-8 text-status-warning" />
            </div>
            <p className="text-xs text-text-muted mt-2">days active</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Time Spent</p>
                <p className="text-3xl font-bold text-status-success">
                  {roadmapData.progress.totalHoursSpent}
                </p>
              </div>
              <Clock className="w-8 h-8 text-status-success" />
            </div>
            <p className="text-xs text-text-muted mt-2">hours learning</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Current Week</p>
                <p className="text-3xl font-bold text-text-primary">
                  {roadmapData.progress.currentWeek}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-text-primary" />
            </div>
            <p className="text-xs text-text-muted mt-2">
              of {roadmapData.progress.totalWeeks} weeks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Phase Highlight */}
      <Card className="border-2 border-brand-primary bg-gradient-to-br from-brand-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-brand-primary" />
            <CardTitle>Currently Learning</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                {roadmapData.currentPhase.title}
              </h3>
              <p className="text-text-secondary mb-4">
                {roadmapData.currentPhase.topic}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-text-muted mb-1">Progress</p>
                  <p className="text-lg font-bold text-brand-primary">
                    {roadmapData.currentPhase.progress}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Time Spent</p>
                  <p className="text-lg font-bold text-text-primary">
                    {roadmapData.currentPhase.hoursSpent}h / {roadmapData.currentPhase.estimatedHours}h
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => handlePhaseClick(roadmapData.currentPhase)}
              >
                Continue Learning
              </Button>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-muted mb-1">Due Date</p>
              <p className="text-sm font-semibold text-text-primary">
                {formatDate(roadmapData.currentPhase.endDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-status-warning" />
            <CardTitle>Upcoming Milestones</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {roadmapData.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-surface-alt"
              >
                <div className="w-10 h-10 rounded-lg bg-status-warning/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-status-warning" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary">{milestone.title}</h4>
                  <p className="text-sm text-text-muted mt-0.5">{milestone.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">Due</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatDate(milestone.dueDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Phases */}
      <Card>
        <CardHeader>
          <CardTitle>All Phases</CardTitle>
          <p className="text-sm text-text-muted mt-1">
            {roadmapData.phases.length} weeks of structured learning
          </p>
        </CardHeader>
        <CardContent>
          <Tabs tabs={viewTabs} variant="underline" />
        </CardContent>
      </Card>
    </div>
  );
};

export default RoadmapOverviewPage;