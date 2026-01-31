
// ===== src/pages/Skills/SkillPriorityPage.jsx =====
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Clock } from 'lucide-react';
import SkillPriorityList from '@features/skills/components/SkillPriorityList';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { useSkills } from '@features/skills/hooks/useSkills';
import { ROUTES } from '@constants/routes';


const SkillPriorityPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, getSkillPriority } = useSkills();
  const [priorityData, setPriorityData] = useState(null);

  useEffect(() => {
    const loadPriority = async () => {
      const result = await getSkillPriority();
      if (result.success) {
        setPriorityData(result.data);
      }
    };
    loadPriority();
  }, []);

  const handleStartLearning = (skill) => {
    // Navigate to roadmap with this skill
    navigate(ROUTES.ROADMAP_OVERVIEW);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Loading priority queue..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load skill priority: {error}
      </Alert>
    );
  }

  if (!priorityData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(ROUTES.SKILL_GAP)}
          className="mb-4"
        >
          Back to Skill Gap
        </Button>
        
        <h1 className="text-3xl font-bold text-text-primary">Learning Priority Queue</h1>
        <p className="text-text-secondary mt-1">
          Recommended order to learn skills for maximum impact
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-2 border-brand-primary/20 bg-brand-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-primary" />
            <CardTitle>Learning Plan Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Clock className="w-8 h-8 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Total Time Estimate</p>
                <p className="text-2xl font-bold text-text-primary">
                  {priorityData.totalTimeEstimate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-status-success/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-status-success">
                  {priorityData.priorityQueue.length}
                </span>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Skills in Queue</p>
                <p className="text-lg font-semibold text-text-primary">
                  Priority ranked
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-surface-card border border-border">
            <p className="text-sm font-medium text-text-primary mb-2">Recommended Learning Order:</p>
            <div className="flex flex-wrap gap-2">
              {priorityData.recommendedOrder.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-text-secondary">{skill}</span>
                  {idx < priorityData.recommendedOrder.length - 1 && (
                    <span className="text-text-muted">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How Priority Works */}
      <Card>
        <CardHeader>
          <CardTitle>How We Prioritize Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-status-error-light border border-status-error/20">
              <h4 className="font-semibold text-status-error-dark mb-2">Critical Priority</h4>
              <p className="text-sm text-status-error-dark">
                Must-have skills for 90%+ of target role jobs. Learn these first.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-status-warning-light border border-status-warning/20">
              <h4 className="font-semibold text-status-warning-dark mb-2">High Priority</h4>
              <p className="text-sm text-status-warning-dark">
                Important skills that significantly boost your competitiveness.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-status-info-light border border-status-info/20">
              <h4 className="font-semibold text-status-info-dark mb-2">Medium Priority</h4>
              <p className="text-sm text-status-info-dark">
                Nice-to-have skills that enhance your profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priority Skills List */}
      <SkillPriorityList 
        prioritySkills={priorityData.priorityQueue}
        onStartLearning={handleStartLearning}
      />

      {/* Action Card */}
      <Card className="border-2 border-brand-primary bg-gradient-to-br from-brand-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Ready to start learning?
              </h3>
              <p className="text-text-secondary">
                We've created a personalized roadmap based on this priority queue.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(ROUTES.ROADMAP_OVERVIEW)}
            >
              View Learning Roadmap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillPriorityPage;