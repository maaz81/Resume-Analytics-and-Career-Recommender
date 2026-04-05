import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Download,
    Eye,
    Trash2,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@common/Card';
import Button from '@common/Button';
import Badge from '@common/Badge';
import { formatDate } from '@utils/helpers';
import { cn } from '@utils/helpers';
import { ROUTES } from '@constants/routes';

/**
 * ResumeHistoryWidget
 * Compact dashboard widget — vertical timeline of resume versions
 * with ATS score trend bar, delta indicator, and hover quick-actions.
 *
 * Props:
 *   resumes      – array of resume objects (defaults to mock data)
 *   onView       – (resume) => void
 *   onDownload   – (resume) => void
 *   onDelete     – (resume) => void
 */

// ── Mock data — replace with real API data ─────────────────────────────────────
const MOCK_RESUMES = [
    {
        id: 'r3',
        version: 3,
        fileName: 'Resume_v3_Final.pdf',
        uploadedAt: '2024-02-01T10:30:00Z',
        atsScore: 84,
        changes: 'Added TypeScript projects, updated skills section',
        isCurrent: true,
    },
    {
        id: 'r2',
        version: 2,
        fileName: 'Resume_v2.pdf',
        uploadedAt: '2024-01-15T09:00:00Z',
        atsScore: 71,
        changes: 'Rewrote summary, added measurable impact numbers',
        isCurrent: false,
    },
    {
        id: 'r1',
        version: 1,
        fileName: 'Resume_original.pdf',
        uploadedAt: '2024-01-02T14:20:00Z',
        atsScore: 58,
        changes: null,
        isCurrent: false,
    },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getScoreStyle(score) {
    if (score >= 80)
        return {
            bar: 'bg-status-success',
            text: 'text-status-success',
            badge: 'success',
            bg: 'bg-status-success-light',
            border: 'border-status-success/30',
        };
    if (score >= 60)
        return {
            bar: 'bg-status-warning',
            text: 'text-status-warning',
            badge: 'warning',
            bg: 'bg-status-warning-light',
            border: 'border-status-warning/30',
        };
    return {
        bar: 'bg-status-error',
        text: 'text-status-error',
        badge: 'error',
        bg: 'bg-status-error-light',
        border: 'border-status-error/30',
    };
}

// ── Score delta chip ───────────────────────────────────────────────────────────

function ScoreDelta({ current, previous }) {
    if (previous == null) return null;
    const delta = current - previous;
    if (delta === 0)
        return (
            <span className="flex items-center gap-0.5 text-xs text-text-muted">
                <Minus className="w-3 h-3" /> 0
            </span>
        );
    const positive = delta > 0;
    return (
        <span
            className={cn(
                'flex items-center gap-0.5 text-xs font-bold',
                positive ? 'text-status-success' : 'text-status-error'
            )}
        >
            {positive ? (
                <TrendingUp className="w-3 h-3" />
            ) : (
                <TrendingDown className="w-3 h-3" />
            )}
            {positive ? '+' : ''}
            {delta}
        </span>
    );
}

// ── Thin score progress bar ────────────────────────────────────────────────────

function ScoreBar({ score }) {
    const style = getScoreStyle(score);
    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-500', style.bar)}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={cn('text-xs font-bold tabular-nums w-8 text-right', style.text)}>
                {score}%
            </span>
        </div>
    );
}

// ── Single timeline entry ──────────────────────────────────────────────────────

function ResumeEntry({ resume, previousScore, isLast }) {
    const [hovered, setHovered] = useState(false);
    const style = getScoreStyle(resume.atsScore);

    return (
        <div className="flex gap-3 group">
            {/* Spine */}
            <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                <div
                    className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 transition-all',
                        resume.isCurrent
                            ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                            : `${style.bg} ${style.border} ${style.text}`
                    )}
                >
                    v{resume.version}
                </div>
                {!isLast && (
                    <div className="w-px flex-1 bg-border-light mt-1 mb-0" style={{ minHeight: '16px' }} />
                )}
            </div>

            {/* Entry card */}
            <div
                className={cn(
                    'flex-1 mb-3 p-3 rounded-lg border transition-all duration-200 cursor-default',
                    resume.isCurrent
                        ? 'border-brand-primary/40 bg-brand-primary/5'
                        : 'border-border bg-surface-card hover:border-brand-primary/30 hover:shadow-sm'
                )}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                        <p className="text-sm font-semibold text-text-primary truncate leading-snug">
                            {resume.fileName}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <ScoreDelta current={resume.atsScore} previous={previousScore} />
                        {resume.isCurrent && (
                            <Badge variant="success" size="xs">
                                Current
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Upload date */}
                <p className="flex items-center gap-1 text-xs text-text-muted mb-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(resume.uploadedAt)}
                </p>

                {/* ATS bar */}
                <ScoreBar score={resume.atsScore} />

                {/* Changes note */}
                {resume.changes && (
                    <p className="mt-2 text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {resume.changes}
                    </p>
                )}

                {/* Hover quick-actions */}
                <div
                    className={cn(
                        'flex items-center gap-1 mt-2 transition-all duration-200 overflow-hidden',
                        hovered ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'
                    )}
                >

                </div>
            </div>
        </div>
    );
}

// ── Score trend summary strip ──────────────────────────────────────────────────

function ScoreTrendSummary({ resumes }) {
    if (resumes.length < 2) return null;
    const first = resumes[resumes.length - 1].atsScore;
    const latest = resumes[0].atsScore;
    const delta = latest - first;
    const positive = delta >= 0;

    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-alt mb-4">
            <div>
                <p className="text-xs text-text-muted">Overall improvement</p>
                <p className="text-sm font-semibold text-text-primary">
                    {first}% → {latest}%
                </p>
            </div>
            <span
                className={cn(
                    'flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full',
                    positive
                        ? 'text-status-success bg-status-success-light'
                        : 'text-status-error bg-status-error-light'
                )}
            >
                {positive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                )}
                {positive ? '+' : ''}
                {delta} pts
            </span>
        </div>
    );
}

// ── Widget root ────────────────────────────────────────────────────────────────

const ResumeHistoryWidget = ({
    resumes = MOCK_RESUMES,
    onView,
    onDownload,
    onDelete,
}) => {
    const navigate = useNavigate();

    // Sort newest → oldest
    const sorted = [...resumes].sort((a, b) => b.version - a.version);

    const handleView = (r) => onView?.(r);
    const handleDownload = (r) => onDownload?.(r);
    const handleDelete = (r) => onDelete?.(r);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Resume History</CardTitle>
                        <p className="text-sm text-text-muted mt-1">
                            {resumes.length} version{resumes.length !== 1 ? 's' : ''} · hover to act
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-brand-primary" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
                {/* Trend strip */}
                <ScoreTrendSummary resumes={sorted} />

                {/* Timeline */}
                <div className="flex-1">
                    {sorted.map((resume, index) => (
                        <ResumeEntry
                            key={resume.id}
                            resume={resume}
                            previousScore={sorted[index + 1]?.atsScore ?? null}
                            isLast={index === sorted.length - 1}
                            onView={handleView}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-2 pt-4 border-t border-border-light">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={() => navigate(ROUTES.RESUME_HISTORY)}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                        View Full History
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ResumeHistoryWidget;