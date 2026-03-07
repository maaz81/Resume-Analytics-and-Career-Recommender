// ===== src/pages/Skills/SkillGapPage.jsx =====
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, ArrowRight } from 'lucide-react';
import SkillCard from '@features/skills/components/SkillCard';
import SkillMatrix from '@features/skills/components/SkillMatrix';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Tabs from '@common/Tabs';
import Spinner from '@common/Spinner';
import Alert from '@common/Alert';
import { useSkills } from '@features/skills/hooks/useSkills';
import { ROUTES } from '@constants/routes';

const SkillGapPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, getSkillGapAnalysis } = useSkills();
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      const result = await getSkillGapAnalysis();
      if (result.success) {
        setAnalysisData(result.data);
      }
    };
    loadAnalysis();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" label="Analyzing skills..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Failed to load skill analysis: {error}
      </Alert>
    );
  }

  if (!analysisData) {
    return null;
  }

  // Create tabs for skill categories
  const skillTabs = [
    {
      id: 'core',
      label: 'Core Skills',
      badge: analysisData.skillsByCategory.core.filter(s => s.status === 'missing').length > 0
        ? analysisData.skillsByCategory.core.filter(s => s.status === 'missing').length
        : null,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisData.skillsByCategory.core.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ),
    },
    {
      id: 'niceToHave',
      label: 'Nice to Have',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisData.skillsByCategory.niceToHave.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ),
    },
    {
      id: 'emerging',
      label: 'Emerging Tech',
      icon: <TrendingUp className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysisData.skillsByCategory.emerging.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Skill Gap Analysis</h1>
          <p className="text-text-secondary mt-1">
            Compare your skills with {analysisData.targetRole}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.SKILL_PRIORITY)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          View Priority Queue
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Overall Match</p>
                <p className="text-3xl font-bold text-brand-primary">
                  {analysisData.summary.overallMatch}%
                </p>
              </div>
              <Target className="w-8 h-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Skills Matched</p>
              <p className="text-3xl font-bold text-status-success">
                {analysisData.summary.skillsMatched}
              </p>
              <p className="text-xs text-text-muted mt-1">
                of {analysisData.summary.totalSkillsRequired} required
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Skills Missing</p>
              <p className="text-3xl font-bold text-status-error">
                {analysisData.summary.skillsMissing}
              </p>
              <p className="text-xs text-text-muted mt-1">critical gaps</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div>
              <p className="text-sm text-text-muted mb-1">Time to Ready</p>
              <p className="text-2xl font-bold text-text-primary">
                {analysisData.summary.estimatedTimeToReady}
              </p>
              <p className="text-xs text-text-muted mt-1">estimated learning time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Matrix */}
      {/* <SkillMatrix skillsByCategory={analysisData.skillsByCategory} /> */}

      {/* Skills by Category (Tabs) */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Details by Category</CardTitle>
          <p className="text-sm text-text-muted mt-1">
            Explore your skill proficiency in each category
          </p>
        </CardHeader>
        <CardContent>
          <Tabs tabs={skillTabs} variant="underline" />
        </CardContent>
      </Card>

      {/* Market Insights */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-status-success" />
            <CardTitle>Market Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
      {/* Trending Skills */}
      {/* <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Top Trending Skills
              </h4>
              <ul className="space-y-2">
                {analysisData.marketInsights.topTrendingSkills.map((skill, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="text-status-success">↑</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div> */}

      {/* Salary Impact */}
      {/* <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                Average Salary Impact
              </h4>
              <ul className="space-y-2">
                {Object.entries(analysisData.marketInsights.averageSalaryImpact).map(([skill, impact]) => (
                  <li key={skill} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{skill}</span>
                    <span className="font-semibold text-status-success">{impact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default SkillGapPage;