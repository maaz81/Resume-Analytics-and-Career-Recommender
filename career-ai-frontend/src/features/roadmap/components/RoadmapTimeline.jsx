import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * RoadmapTimeline Component
 * Visual timeline showing all phases
 */
const RoadmapTimeline = ({ phases, currentWeek, onPhaseClick }) => {
  const getStatusIcon = (phase, index) => {
    if (phase.status === 'completed') {
      return <CheckCircle2 className="w-6 h-6 text-status-success" />;
    }
    if (phase.status === 'in_progress') {
      return <PlayCircle className="w-6 h-6 text-brand-primary" />;
    }
    return <Circle className="w-6 h-6 text-text-muted" />;
  };

  const getLineColor = (phase) => {
    if (phase.status === 'completed') return 'bg-status-success';
    return 'bg-border';
  };

  return (
    <div className="relative py-4">
      {phases.map((phase, index) => {
        const isLast = index === phases.length - 1;
        const isActive = phase.week === currentWeek;
        
        return (
          <div key={phase.id} className="relative">
            {/* Timeline Item */}
            <div className="flex gap-4">
              {/* Timeline Line & Icon */}
              <div className="relative flex flex-col items-center">
                {/* Icon */}
                <button
                  onClick={() => phase.status !== 'locked' && onPhaseClick?.(phase)}
                  disabled={phase.status === 'locked'}
                  className={cn(
                    'relative z-10 rounded-full bg-surface-card transition-all duration-200',
                    phase.status !== 'locked' && 'cursor-pointer hover:scale-110',
                    isActive && 'ring-4 ring-brand-primary/20'
                  )}
                >
                  {getStatusIcon(phase, index)}
                </button>

                {/* Vertical Line */}
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-20 mt-2 transition-colors duration-300',
                      getLineColor(phase)
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <button
                  onClick={() => phase.status !== 'locked' && onPhaseClick?.(phase)}
                  disabled={phase.status === 'locked'}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all duration-200',
                    isActive && 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20',
                    !isActive && phase.status === 'completed' && 'border-status-success/30 bg-status-success/5',
                    !isActive && phase.status === 'in_progress' && 'border-brand-primary/30 bg-brand-primary/5',
                    !isActive && phase.status === 'locked' && 'border-border bg-surface-alt opacity-60',
                    phase.status !== 'locked' && 'hover:shadow-md cursor-pointer'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                          Week {phase.week}
                        </span>
                        {isActive && (
                          <span className="text-xs font-semibold text-brand-primary">
                            • Current
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-text-primary">{phase.title}</h4>
                      <p className="text-sm text-text-muted mt-0.5">{phase.skillName}</p>
                    </div>
                    {phase.status !== 'locked' && (
                      <span className="text-sm font-semibold text-brand-primary">
                        {phase.progress}%
                      </span>
                    )}
                  </div>

                  {/* Progress Bar (compact) */}
                  {phase.status !== 'locked' && (
                    <div className="w-full h-1 bg-surface-alt rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-300 rounded-full',
                          phase.status === 'completed' ? 'bg-status-success' : 'bg-brand-primary'
                        )}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapTimeline;