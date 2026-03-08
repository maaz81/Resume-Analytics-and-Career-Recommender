import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import Card, { CardHeader, CardTitle, CardContent } from "@common/Card";
import Button from "@common/Button";
import Badge from "@common/Badge";
import { CircularProgress } from "@common/ProgressBar";
import { ROUTES } from "@constants/routes";
import { formatDate } from "@utils/helpers";

const ResumeHealthWidget = () => {
  const navigate = useNavigate();

  const { atsScore } = useSelector((state) => state.dashboard);

  if (!atsScore) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          Loading resume analysis...
        </CardContent>
      </Card>
    );
  }

  const score = atsScore?.overall || 0;

  const getScoreVariant = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const breakdown = atsScore.breakdown || {};

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Resume Health Check</CardTitle>
            <p className="text-sm text-text-muted mt-1">
              Last updated: {formatDate(atsScore.scoredAt)}
            </p>
          </div>
          <FileText className="w-5 h-5 text-text-muted" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">

          {/* ATS Score */}
          <div className="flex items-center gap-6">
            <CircularProgress
              value={score}
              size={120}
              strokeWidth={10}
              variant={getScoreVariant(score)}
              label="ATS Score"
            />

            {/* Breakdown */}
            <div className="flex-1 space-y-3">

              {/* Keywords */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Keywords</span>
                <span className="text-sm font-medium text-text-primary">
                  {breakdown.keywords ?? 0}%
                </span>
              </div>

              <div className="w-full bg-surface-alt rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full"
                  style={{ width: `${breakdown.keywords ?? 0}%` }}
                />
              </div>

              {/* Formatting */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Formatting</span>
                <span className="text-sm font-medium text-text-primary">
                  {breakdown.formatting ?? 0}%
                </span>
              </div>

              <div className="w-full bg-surface-alt rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full"
                  style={{ width: `${breakdown.formatting ?? 0}%` }}
                />
              </div>

              {/* Experience */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Experience</span>
                <span className="text-sm font-medium text-text-primary">
                  {breakdown.experience ?? 0}%
                </span>
              </div>

              <div className="w-full bg-surface-alt rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full"
                  style={{ width: `${breakdown.experience ?? 0}%` }}
                />
              </div>

            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Issues */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3">
              Top Issues to Fix
            </h4>

            {atsScore.topIssues?.length === 0 ? (
              <p className="text-sm text-text-muted">
                No major issues found 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {atsScore.topIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface-alt cursor-pointer"
                    onClick={() => navigate(ROUTES.RESUME_ISSUES)}
                  >
                    <Badge
                      variant={getSeverityColor(issue.severity)}
                      size="sm"
                    >
                      {issue.severity}
                    </Badge>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {issue.title}
                      </p>

                      <p className="text-xs text-text-muted">
                        {issue.description}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.RESUME_ANALYSIS)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View Full Analysis
          </Button>

        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeHealthWidget;