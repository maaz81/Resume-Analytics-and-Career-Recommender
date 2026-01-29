import { cn } from '@utils/helpers';

/**
 * Badge Component
 * Small label for status, categories, or metadata
 * 
 * @param {string} variant - 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} dot - Show dot indicator
 * @param {React.ReactNode} icon - Icon component
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  className,
  ...props
}) => {
  // Base styles
  const baseStyles =
    'inline-flex items-center gap-1.5 font-medium rounded-full transition-colors';

  // Variant styles
  const variantStyles = {
    default: 'bg-surface-alt text-text-primary border border-border',
    primary: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
    success: 'bg-status-success-light text-status-success-dark border border-status-success/20',
    warning: 'bg-status-warning-light text-status-warning-dark border border-status-warning/20',
    error: 'bg-status-error-light text-status-error-dark border border-status-error/20',
    info: 'bg-status-info-light text-status-info-dark border border-status-info/20',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Dot size based on badge size
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  // Dot color based on variant
  const dotColor = {
    default: 'bg-text-muted',
    primary: 'bg-brand-primary',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    info: 'bg-status-info',
  };

  return (
    <span
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {/* Dot Indicator */}
      {dot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            dotSize[size],
            dotColor[variant]
          )}
        />
      )}

      {/* Icon */}
      {icon && <span className="flex-shrink-0">{icon}</span>}

      {/* Content */}
      {children}
    </span>
  );
};

export default Badge;