import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * StatsCard Component
 * Displays a metric with icon and optional trend
 */
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  suffix = '', 
  variant = 'default',
  className 
}) => {
  const variantStyles = {
    default: 'bg-surface-card border-border',
    primary: 'bg-brand-primary/5 border-brand-primary/20',
    success: 'bg-status-success/5 border-status-success/20',
    warning: 'bg-status-warning/5 border-status-warning/20',
  };

  const iconVariants = {
    default: 'bg-surface-alt text-text-primary',
    primary: 'bg-brand-primary/10 text-brand-primary',
    success: 'bg-status-success/10 text-status-success',
    warning: 'bg-status-warning/10 text-status-warning',
  };

  return (
    <div
      className={cn(
        'p-6 rounded-lg border transition-all duration-200 hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        {/* Left Content */}
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-text-primary">
              {value}
              {suffix && <span className="text-xl">{suffix}</span>}
            </h3>
            
            {/* Trend Indicator */}
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  trend.direction === 'up'
                    ? 'text-status-success'
                    : 'text-status-error'
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              iconVariants[variant]
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;