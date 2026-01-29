import { cn } from '@utils/helpers';

/**
 * ProgressBar Component
 * Linear progress indicator with variants
 * 
 * @param {number} value - Progress value (0-100)
 * @param {string} variant - 'default' | 'success' | 'warning' | 'error' | 'primary'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showLabel - Show percentage label
 * @param {string} label - Custom label
 * @param {boolean} animated - Animate progress
 */
const ProgressBar = ({
  value = 0,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Size styles
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-text-muted',
    primary: 'bg-brand-primary',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-text-primary">{label}</span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-text-secondary">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div className={cn('w-full bg-surface-alt rounded-full overflow-hidden', sizeStyles[size])}>
        {/* Progress Bar */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out-expo',
            variantStyles[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

/**
 * CircularProgress Component
 * Circular progress indicator
 */
export const CircularProgress = ({
  value = 0,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  label,
  className,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  // Variant colors
  const variantColors = {
    default: '#98A4B7',
    primary: '#3F76FF',
    success: '#16A34A',
    warning: '#F5A524',
    error: '#EF4444',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0F4F9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out-expo"
        />
      </svg>

      {/* Center Label */}
      {(showLabel || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">
            {Math.round(clampedValue)}%
          </span>
          {label && <span className="text-sm text-text-secondary mt-1">{label}</span>}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;