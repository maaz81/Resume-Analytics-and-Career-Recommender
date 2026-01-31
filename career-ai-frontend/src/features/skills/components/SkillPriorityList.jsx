import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import Card from '@common/Card';
import Badge from '@common/Badge';
import Button from '@common/Button';
import ProgressBar from '@common/ProgressBar';
import { cn } from '@utils/helpers';

/**
 * SkillPriorityList Component
 * Ranked list of skills to learn with detailed info
 */
const SkillPriorityList = ({ prioritySkills, onStartLearning }) => {
  const [expandedSkill, setExpandedSkill] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-status-success';
      case 'medium':
        return 'text-status-warning';
      case 'hard':
        return 'text-status-error';
      default:
        return 'text-text-muted';
    }
  };

  return (
    <div className="space-y-3">
      {prioritySkills.map((skill, index) => {
        const isExpanded = expandedSkill === skill.id;
        
        return (
          <Card
            key={skill.id}
            className={cn(
              'transition-all duration-200',
              isExpanded && 'ring-2 ring-brand-primary'
            )}
          >
            {/* Card Header - Always Visible */}
            <button
              onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
              className="w-full p-5 text-left hover:bg-surface-alt/50 transition-colors rounded-lg"
            >
              <div className="flex items-start gap-4">
                {/* Rank Number */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0',
                  index === 0 && 'bg-brand-primary text-white',
                  index === 1 && 'bg-brand-primary/70 text-white',
                  index === 2 && 'bg-brand-primary/50 text-white',
                  index > 2 && 'bg-surface-alt text-text-primary'
                )}>
                  {index + 1}
                </div>

                {/* Skill Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-text-primary">{skill.name}</h4>
                        <Badge variant={getPriorityColor(skill.priority)} size="sm">
                          {skill.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary">{skill.reasoning}</p>
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-text-muted flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{skill.timeToLearn}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{skill.marketDemand}% demand</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className={getDifficultyColor(skill.difficulty)}>
                        {skill.difficulty} difficulty
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-5 pb-5 space-y-4 border-t border-border/50 mt-2 pt-4">
                {/* Impact */}
                <div className="p-3 rounded-lg bg-brand-primary/5 border border-brand-primary/20">
                  <p className="text-xs font-medium text-brand-primary mb-1">Impact</p>
                  <p className="text-sm text-text-primary">{skill.impact}</p>
                </div>

                {/* Market Demand Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-text-primary">Market Demand</span>
                    <span className="text-sm font-semibold text-brand-primary">
                      {skill.marketDemand}%
                    </span>
                  </div>
                  <ProgressBar value={skill.marketDemand} variant="primary" size="sm" />
                </div>

                {/* Prerequisites */}
                {skill.prerequisites && skill.prerequisites.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-primary mb-2">Prerequisites</p>
                    <div className="flex flex-wrap gap-2">
                      {skill.prerequisites.map((prereq, idx) => (
                        <Badge key={idx} variant="default" size="sm">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Path */}
                {skill.learningPath && skill.learningPath.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-primary mb-2">Learning Path</p>
                    <ol className="space-y-2">
                      {skill.learningPath.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Resources */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-alt">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Learning Resources</p>
                    <p className="text-xs text-text-muted">{skill.resources} curated resources available</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onStartLearning?.(skill)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Start Learning
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default SkillPriorityList;