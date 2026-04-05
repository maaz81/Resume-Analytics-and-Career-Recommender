import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import Badge from '@common/Badge';
import Button from '@common/Button';
import { CircularProgress } from '@common/ProgressBar';
import { formatDate } from '@utils/helpers';
import { cn } from '@utils/helpers';

/**
 * ResumeVersionCard Component
 * Displays individual resume version with actions
 */
const ResumeVersionCard = ({ resume, isCurrent, onView, onDownload, onRestore, onDelete }) => {
    const getScoreVariant = (score) => {
        if (score >= 80) return 'success';
        if (score >= 60) return 'warning';
        return 'error';
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-status-success';
        if (score >= 60) return 'text-status-warning';
        return 'text-status-error';
    };

    return (
        <div
            className={cn(
                'p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
                isCurrent
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border bg-surface-card'
            )}
        >
            <div className="flex items-start gap-6">

                {/* ATS Score Circle — relative wrapper so the label sits centered inside */}
                <div className="flex-shrink-0 relative w-[100px] h-[100px]">
                    <CircularProgress
                        value={resume.atsScore}
                        size={100}
                        strokeWidth={8}
                        variant={getScoreVariant(resume.atsScore)}
                        showLabel={false}
                    />
                    {/* Score label absolutely centered over the SVG */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={cn('text-2xl font-bold leading-none', getScoreColor(resume.atsScore))}>
                            {resume.atsScore}
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5 font-medium tracking-wide">
                            ATS
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3
                                        className="font-semibold text-text-primary truncate max-w-[180px]"
                                        title={resume.fileName}
                                    >
                                        {resume.fileName}
                                    </h3>
                                    {isCurrent && (
                                        <Badge variant="success" size="sm">
                                            Current
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-text-muted">
                                    Version {resume.version} • Uploaded {formatDate(resume.uploadedAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Changes Summary */}
                    {resume.changes && (
                        <div className="mb-4 p-3 rounded-lg bg-surface-alt">
                            <p className="text-xs font-medium text-text-primary mb-1">Changes:</p>
                            <p className="text-sm text-text-secondary">{resume.changes}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Eye className="w-4 h-4" />}
                            onClick={() => onView(resume)}
                        >
                            View
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={() => onDownload?.(resume)}
                        >
                            Download
                        </Button>

                        {!isCurrent && (
                            <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Trash2 className="w-4 h-4" />}
                                onClick={() => onDelete(resume)}
                                className="text-status-error hover:text-status-error hover:border-status-error"
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeVersionCard;