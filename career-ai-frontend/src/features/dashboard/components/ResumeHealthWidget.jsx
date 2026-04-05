import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
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
      <Card className="h-full border-border/50 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center text-text-muted space-y-4 min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center animate-pulse">
            <FileText className="w-8 h-8 text-text-muted/50" />
          </div>
          <p>Analyzing your resume...</p>
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
    switch (severity?.toLowerCase()) {
      case "critical":
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
  const keywordsScore = Number(breakdown.keywords) || 0;
  const formattingScore = Number(breakdown.formatting) || 0;
  const experienceScore = Number(breakdown.experience) || 0;

  // Custom progress bar with better visuals
  const renderMiniProgress = (label, value) => (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">{label}</span>
        <span className="text-sm font-bold text-text-primary">
          {value ? `${value}%` : "0%"}
        </span>
      </div>
      <div className="w-full bg-surface-alt rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${value >= 80 ? 'bg-status-success' : value >= 60 ? 'bg-status-warning' : 'bg-status-error'
            }`}
          style={{ width: `${value || 0}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm text-black">
              Resume Health Check
            </CardTitle>
            <p className="text-xs text-text-muted mt-1 font-medium">
              Last updated: {formatDate(atsScore.scoredAt)}
            </p>
          </div>
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FileText className="w-5 h-5 text-brand-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-6">

          {/* ATS Score Section */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-surface-alt/30 border border-border/50">
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <CircularProgress
                value={score}
                size={110}
                strokeWidth={8}
                variant={getScoreVariant(score)}
                label="ATS Score"
              />
            </div>

            {/* Breakdown */}
            <div className="flex-1 space-y-4">
              {renderMiniProgress("Keywords Match", keywordsScore)}
              {renderMiniProgress("Formatting", formattingScore)}
              {renderMiniProgress("Experience", experienceScore)}
            </div>
          </div>

          {/* Top Issues Section */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 bg-surface-alt border-b border-border flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-status-warning" />
                Priority Issues
              </h4>
              <Badge variant="default" size="sm">{atsScore.topIssues?.length || 0}</Badge>
            </div>

            <div className="p-2">
              {!atsScore.topIssues || atsScore.topIssues.length === 0 ? (
                <div className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-status-success" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">Looking good!</p>
                  <p className="text-xs text-text-muted">No major issues detected.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {atsScore.topIssues.slice(0, 2).map((issue, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-surface-alt cursor-pointer transition-colors"
                      onClick={() => navigate(ROUTES.RESUME_ANALYSIS)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-brand-primary transition-colors">
                          {issue.title || issue.category || "Issue"}
                        </p>
                        <Badge variant={getSeverityColor(issue.severity)} size="sm" className="capitalize text-[10px] px-1.5 py-0">
                          {issue.severity || "Warning"}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted line-clamp-1">
                        {issue.description || issue.suggestion || "Action required to improve score."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Full width button nicely placed at bottom */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(ROUTES.RESUME_ANALYSIS)}
            className="group hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300"
            rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          >
            Review Full Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeHealthWidget;