import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Target,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Zap
} from "lucide-react";

import Card, { CardHeader, CardTitle, CardContent } from "@common/Card";
import Button from "@common/Button";
import Badge from "@common/Badge";
import { CircularProgress } from "@common/ProgressBar";

import { ROUTES } from "@constants/routes";

const SkillGapWidget = () => {
  const navigate = useNavigate();

  const { skillGap } = useSelector((state) => state.dashboard);

  if (!skillGap) {
    return (
      <Card className="h-full border-border/50 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center text-text-muted space-y-4 min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center animate-pulse">
            <Target className="w-8 h-8 text-text-muted/50" />
          </div>
          <p>Analyzing skill gaps...</p>
        </CardContent>
      </Card>
    );
  }

  // Handle both real backend format and old mock format
  const matchPercentage = skillGap.matchPercentage ?? 0;
  const gapScore = skillGap.gapScore ?? 0;

  // Extract top missing skills or default to empty
  const missingSkills = skillGap.topMissingSkills || [];
  const immediateActions = skillGap.immediateActions || [];

  // If there are no missing skills from backend but we have mock prioritySkills, use those
  const displaySkills = missingSkills.length > 0
    ? missingSkills
    : (skillGap.prioritySkills || []).map(s => ({ name: s.skill, priority: s.priority }));

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "core":
      case "high":
      case "critical":
        return "error";
      case "nice-to-have":
      case "medium":
      case "important":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm text-black">
              Skill Gap Analysis
            </CardTitle>
            <p className="text-xs text-text-muted mt-1 font-medium">
              {displaySkills.length} skills to improve
            </p>
          </div>
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-brand-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-5">

          {/* Match Overview Section */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-surface-alt/30 border border-border/50">
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <CircularProgress
                value={matchPercentage}
                size={100}
                strokeWidth={8}
                variant={matchPercentage >= 70 ? 'success' : matchPercentage >= 40 ? 'warning' : 'error'}
                label="Match"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between group hover:border-brand-primary/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-status-warning" />
                  <span className="text-sm font-medium text-text-secondary">Gap Score</span>
                </div>
                <span className="text-lg font-bold text-text-primary">{gapScore}%</span>
              </div>
            </div>
          </div>

          {/* Learn Next / Top Missing Skills */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand-primary" />
              Prioritized Skills to Learn
            </h4>

            <div className="space-y-2">
              {displaySkills.length === 0 ? (
                <div className="p-4 bg-surface-alt rounded-xl text-center">
                  <p className="text-sm font-medium text-text-primary">You have all core skills!</p>
                </div>
              ) : (
                displaySkills.slice(0, 3).map((item, index) => (
                  <div
                    key={item.name || index}
                    className="group flex items-center justify-between p-3 rounded-lg border border-border/50 bg-surface hover:bg-brand-primary/5 hover:border-brand-primary/30 cursor-pointer transition-all duration-300"
                    onClick={() => navigate(ROUTES.SKILL_GAP)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-surface-alt flex items-center justify-center text-xs font-bold text-text-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                        {index + 1}
                      </div>

                      <p className="text-sm font-medium text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                        {item.name}
                      </p>
                    </div>

                    <Badge
                      variant={getPriorityColor(item.priority)}
                      size="sm"
                      className="capitalize text-[10px]"
                    >
                      {item.priority || "Medium"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Full width button nicely placed at bottom */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.SKILL_GAP)}
            className="group transition-all duration-300 shadow-sm hover:shadow-md hover:translate-y-[-2px]"
            rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          >
            Review Skill Gaps
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default SkillGapWidget;