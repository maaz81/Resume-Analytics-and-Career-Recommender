// ===== src/pages/Roadmap/RoadmapDetailPage.jsx =====
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, BookOpen, Code } from 'lucide-react';
import ResourceList from '@features/roadmap/components/ResourceList';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import ProgressBar from '@common/ProgressBar';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { useRoadmap } from '@features/roadmap/hooks/useRoadmap';
import { ROUTES } from '@constants/routes';
import { cn } from '@utils/helpers';
import { formatDate } from '@utils/helpers';

const RoadmapDetailPage = () => {
  const navigate = useNavigate();
  const { skillId } = useParams();
  const { isLoading, error, getRoadmapDetail, markTopicComplete } = useRoadmap();
  const [phaseData, setPhaseData] = useState(null);

  useEffect(() => {
    const loadDetail = async () => {
      const result = await getRoadmapDetail(skillId);
      if (result.success) {
        setPhaseData(result.data.phase);
      }
    };
    loadDetail();
  }, [skillId]);

  const handleMarkComplete = async (topicId) => {
    const result = await markTopicComplete(topicId);
    if (result.success) {
      // Refresh data
      const refreshResult = await getRoadmapDetail(skillId);
      if (refreshResult.success) {
        setPhaseData(refreshResult.data.phase);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Loading phase details..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load phase details: {error}
      </Alert>
    );
  }

  if (!phaseData) {
    return null;
  }

  const getTopicIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-status-success" />;
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-brand-primary" />;
      default:
        return <Circle className="w-5 h-5 text-text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(ROUTES.ROADMAP_OVERVIEW)}
          className="mb-4"
        >
          Back to Roadmap
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="primary" size="lg">
                Week {phaseData.week}
              </Badge>
              <Badge 
                variant={phaseData.status === 'completed' ? 'success' : 'warning'}
                size="lg"
              >
                {phaseData.status === 'completed' ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-text-primary">{phaseData.title}</h1>
            <p className="text-text-secondary mt-1">{phaseData.description}</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-2 border-brand-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Progress</p>
              <p className="text-3xl font-bold text-brand-primary">{phaseData.progress}%</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Time Spent</p>
              <p className="text-3xl font-bold text-text-primary">
                {phaseData.hoursSpent}h
              </p>
              <p className="text-xs text-text-muted mt-1">of {phaseData.estimatedHours}h</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Start Date</p>
              <p className="text-lg font-semibold text-text-primary">
                {formatDate(phaseData.startDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">End Date</p>
              <p className="text-lg font-semibold text-text-primary">
                {formatDate(phaseData.endDate)}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <ProgressBar value={phaseData.progress} variant="primary" showLabel />
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {phaseData.objectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                <span className="text-text-secondary">{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Topics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Topics to Cover</CardTitle>
            <span className="text-sm text-text-muted">
              {phaseData.topics.filter(t => t.status === 'completed').length} of {phaseData.topics.length} completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phaseData.topics.map((topic) => (
              <div
                key={topic.id}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-200',
                  topic.status === 'completed' && 'border-status-success/30 bg-status-success/5',
                  topic.status === 'in_progress' && 'border-brand-primary/30 bg-brand-primary/5',
                  topic.status === 'locked' && 'border-border bg-surface-alt opacity-60'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getTopicIcon(topic.status)}
                    <div>
                      <h4 className="font-semibold text-text-primary">{topic.title}</h4>
                      <p className="text-sm text-text-muted">Duration: {topic.duration}</p>
                    </div>
                  </div>
                  
                  {topic.status === 'in_progress' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarkComplete(topic.id)}
                    >
                      Mark Complete
                    </Button>
                  )}
                  
                  {topic.status === 'completed' && (
                    <Badge variant="success">
                      Completed {formatDate(topic.completedAt)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Resources */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-primary" />
            <CardTitle>Learning Resources</CardTitle>
          </div>
          <p className="text-sm text-text-muted mt-1">
            {phaseData.resources.length} curated resources to help you learn
          </p>
        </CardHeader>
        <CardContent>
          <ResourceList resources={phaseData.resources} />
        </CardContent>
      </Card>

      {/* Practice Exercises */}
      {phaseData.exercises && phaseData.exercises.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-status-warning" />
              <CardTitle>Practice Exercises</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phaseData.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-4 rounded-lg border border-border bg-surface-card hover:border-brand-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary mb-1">
                        {exercise.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>Difficulty: {exercise.difficulty}</span>
                        <span>•</span>
                        <span>Est. time: {exercise.estimatedTime}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start Exercise
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites Check */}
      {phaseData.prerequisites && phaseData.prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {phaseData.prerequisites.map((prereq, idx) => (
                <Badge
                  key={idx}
                  variant={prereq.status === 'completed' ? 'success' : 'default'}
                  size="md"
                >
                  {prereq.status === 'completed' && '✓ '}
                  {prereq.skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoadmapDetailPage;