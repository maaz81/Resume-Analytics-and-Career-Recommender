import { useState, useEffect } from 'react';
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
import { getResumeHistoryService } from '../../resume/services/resumeService';
import Spinner from '@common/Spinner';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getScoreStyle(score) {
    if (score >= 80)
        return {
            bar: 'bg-status-success',
            text: 'text-status-success',
            bg: 'bg-status-success-light',
            border: 'border-status-success/30',
        };
    if (score >= 60)
        return {
            bar: 'bg-status-warning',
            text: 'text-status-warning',
            bg: 'bg-status-warning-light',
            border: 'border-status-warning/30',
        };
    return {
        bar: 'bg-status-error',
        text: 'text-status-error',
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
            <span className="flex items-center gap-0.5 text-xs text-text-muted whitespace-nowrap">
                <Minus className="w-3 h-3" /> 0
            </span>
        );
    const positive = delta > 0;
    return (
        <span
            className={cn(
                'flex items-center gap-0.5 text-xs font-bold whitespace-nowrap',
                positive ? 'text-status-success' : 'text-status-error'
            )}
        >
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {positive ? '+' : ''}{delta}
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
            <span className={cn('text-xs font-bold tabular-nums w-8 text-right flex-shrink-0', style.text)}>
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
        <div className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center flex-shrink-0 pt-1">
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
                    <div className="w-px flex-1 bg-border-light mt-1" style={{ minHeight: '16px' }} />
                )}
            </div>

            {/* Entry card — key fix: overflow-hidden on the card itself */}
            <div
                className={cn(
                    'flex-1 min-w-0 mb-3 p-3 rounded-lg border transition-all duration-200 cursor-default overflow-hidden',
                    resume.isCurrent
                        ? 'border-brand-primary/40 bg-brand-primary/5'
                        : 'border-border bg-surface-card hover:border-brand-primary/30 hover:shadow-sm'
                )}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* ── Row 1: filename (left, truncated) + badges (right, fixed width) ── */}
                <div className="flex items-start gap-2 w-full">
                    {/* Left: icon + filename — takes remaining space, truncates */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <FileText className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                        <p
                            className="text-sm font-semibold text-text-primary truncate"
                            title={resume.fileName}
                        >
                            {resume.fileName}
                        </p>
                    </div>

                    {/* Right: delta + current badge — never shrinks, never wraps */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                        <ScoreDelta current={resume.atsScore} previous={previousScore} />
                        {resume.isCurrent && (
                            <Badge variant="success" size="xs">
                                Current
                            </Badge>
                        )}
                    </div>
                </div>

                {/* ── Row 2: Upload date ── */}
                <p className="flex items-center gap-1 text-xs text-text-muted mt-1 mb-0.5">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(resume.uploadedAt)}</span>
                </p>

                {/* ── Row 3: ATS score bar ── */}
                <ScoreBar score={resume.atsScore} />

                {/* ── Row 4: Changes note ── */}
                {resume.changes && (
                    <p className="mt-1.5 text-xs text-text-secondary leading-relaxed line-clamp-2">
                        {resume.changes}
                    </p>
                )}

                {/* ── Row 5: Hover quick-actions ── */}
                <div
                    className={cn(
                        'flex items-center gap-1 mt-2 transition-all duration-200 overflow-hidden',
                        hovered ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-brand-primary transition-colors px-2 py-1 rounded hover:bg-brand-primary/5">
                        <Eye className="w-3 h-3" /> View
                    </button>
                    <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-brand-primary transition-colors px-2 py-1 rounded hover:bg-brand-primary/5">
                        <Download className="w-3 h-3" /> Download
                    </button>
                    {!resume.isCurrent && (
                        <button className="flex items-center gap-1 text-xs text-text-secondary hover:text-status-error transition-colors px-2 py-1 rounded hover:bg-status-error-light ml-auto">
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    )}
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
                    'flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full flex-shrink-0',
                    positive
                        ? 'text-status-success bg-status-success-light'
                        : 'text-status-error bg-status-error-light'
                )}
            >
                {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {positive ? '+' : ''}{delta} pts
            </span>
        </div>
    );
}

// ── Widget root ────────────────────────────────────────────────────────────────

const ResumeHistoryWidget = ({ onView, onDownload, onDelete }) => {
    const navigate = useNavigate();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getResumeHistoryService();
                const resumesArray = data?.resumes || [];
                if (Array.isArray(resumesArray)) {
                    const mappedData = resumesArray.map(r => ({
                        ...r,
                        isCurrent: r.status === 'current',
                        atsScore: typeof r.atsScore === 'number' ? Math.round(r.atsScore) : 0,
                    }));
                    setResumes(mappedData);
                }
            } catch (error) {
                console.error('Failed to fetch resume history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Sort newest → oldest, show last 3
    const sorted = [...resumes].sort((a, b) => b.version - a.version).slice(0, 3);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <CardTitle>Resume History</CardTitle>
                        <p className="text-sm text-text-muted mt-1">
                            {resumes.length} version{resumes.length !== 1 ? 's' : ''} · hover to act
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0 ml-3">
                        <FileText className="w-4 h-4 text-brand-primary" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-8">
                        <Spinner size="md" className="text-brand-primary" />
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8 text-sm text-text-muted">
                        No resumes uploaded yet.
                    </div>
                ) : (
                    <>
                        <ScoreTrendSummary resumes={sorted} />
                        <div className="flex-1">
                            {sorted.map((resume, index) => (
                                <ResumeEntry
                                    key={resume.id}
                                    resume={resume}
                                    previousScore={sorted[index + 1]?.atsScore ?? null}
                                    isLast={index === sorted.length - 1}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="mt-2 pt-4 border-t border-border-light">
                    <Button
                        variant="outline"
                        fullWidth
                        onClick={() => navigate(ROUTES.RESUME_HISTORY)}
                        className="group hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300"
                        rightIcon={
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        }
                    >
                        View Full History
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ResumeHistoryWidget;