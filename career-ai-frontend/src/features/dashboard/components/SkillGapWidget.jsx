import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Target,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Layers,
} from "lucide-react";

import Card, { CardHeader, CardTitle, CardContent } from "@common/Card";
import Button from "@common/Button";
import { ROUTES } from "@constants/routes";

// ─── Priority badge pill ──────────────────────────────────────────────────────
const PriorityPill = ({ priority }) => {
  const map = {
    core: { label: "Core", cls: "bg-status-error/10 text-status-error border border-status-error/30" },
    "nice-to-have": { label: "Nice", cls: "bg-status-warning/10 text-status-warning border border-status-warning/30" },
    emerging: { label: "Trending", cls: "bg-status-info/10 text-status-info border border-status-info/30" },
  };
  const cfg = map[priority?.toLowerCase?.()] || map["nice-to-have"];
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ─── Match arc gauge ──────────────────────────────────────────────────────────
const MatchGauge = ({ matchPct, gapPct }) => {
  const color =
    matchPct >= 70 ? "#22c55e" : matchPct >= 40 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (matchPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="absolute" width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" strokeWidth="8"
            className="text-surface-alt" />
          <circle cx="48" cy="48" r="36" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "48px 48px", transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="text-center z-10">
          <p className="text-xl font-bold text-text-primary leading-none">{matchPct}%</p>
          <p className="text-[9px] text-text-muted uppercase tracking-wide mt-0.5">Match</p>
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs text-text-muted">Gap: </span>
        <span className="text-xs font-bold text-status-error">{gapPct}%</span>
      </div>
    </div>
  );
};

// ─── Widget ───────────────────────────────────────────────────────────────────
const SkillGapWidget = () => {
  const navigate = useNavigate();
  const { skillGap } = useSelector((state) => state.dashboard);

  // ── Loading / empty state ─────────────────────────────────────────────────
  if (!skillGap) {
    return (
      <Card className="h-full border-border/50 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center animate-pulse">
            <Target className="w-8 h-8 text-text-muted/50" />
          </div>
          <p className="text-sm text-text-muted">Analyzing skill gaps...</p>
        </CardContent>
      </Card>
    );
  }

  const matchPct = Math.round(skillGap.matchPercentage || 0);
  const gapPct = Math.round(skillGap.gapScore || Math.max(0, 100 - matchPct));
  const missing = skillGap.topMissingSkills || [];  // [{ name, priority }]
  const known = skillGap.resumeSkills || [];  // string[]

  return (
    <Card className="h-full border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* ── Header ── */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm text-black">
              Skill Gap Analysis
            </CardTitle>
            <p className="text-xs text-text-muted mt-1 font-medium">
              {missing.length} skill{missing.length !== 1 ? "s" : ""} to improve
            </p>
          </div>
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-brand-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-4">

        {/* ── Top section: Gauge + quick stats ── */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-alt/30 border border-border/50">
          <MatchGauge matchPct={matchPct} gapPct={gapPct} />

          {/* ── Stats ── */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 p-2.5 bg-surface rounded-lg border border-border/80">
              <CheckCircle2 className="w-4 h-4 text-status-success flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted uppercase tracking-wide">You Have</p>
                <p className="text-sm font-bold text-text-primary truncate">
                  {known.length > 0 ? `${known.length} skills` : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-surface rounded-lg border border-border/80">
              <AlertTriangle className="w-4 h-4 text-status-error flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted uppercase tracking-wide">Missing</p>
                <p className="text-sm font-bold text-text-primary truncate">
                  {missing.length > 0 ? `${missing.length} skills` : "None!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Missing skills list ── */}
        {missing.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-status-error" />
              Skills to Acquire
            </h4>
            <div className="space-y-1.5">
              {missing.slice(0, 4).map((item, idx) => (
                <div
                  key={item.name || idx}
                  className="group flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-surface hover:bg-brand-primary/5 hover:border-brand-primary/30 cursor-pointer transition-all duration-200"
                  onClick={() => navigate(ROUTES.SKILL_GAP)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-surface-alt flex items-center justify-center text-[10px] font-bold text-text-muted group-hover:bg-brand-primary group-hover:text-white transition-colors flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-text-primary group-hover:text-brand-primary transition-colors truncate">
                      {item.name}
                    </span>
                  </div>
                  <PriorityPill priority={item.priority} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Known skills chips ── */}
        {known.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-status-success" />
              Skills You Have
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {known.slice(0, 8).map((skill, idx) => (
                <span
                  key={skill || idx}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20"
                >
                  {skill}
                </span>
              ))}
              {known.length > 8 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-alt text-text-muted border border-border/50">
                  +{known.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Empty state when no data ── */}
        {missing.length === 0 && known.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-status-success" />
            </div>
            <p className="text-sm font-semibold text-text-primary">You&apos;re fully matched!</p>
            <p className="text-xs text-text-muted">Upload a resume with a job description to see skill gaps.</p>
          </div>
        )}

        {/* ── Footer button ── */}
        <div className="pt-3 border-t border-border/50 mt-auto ">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(ROUTES.SKILL_GAP)}
            className="group hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300"
            rightIcon={
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            }
          >
            View Full Skill Report
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default SkillGapWidget;