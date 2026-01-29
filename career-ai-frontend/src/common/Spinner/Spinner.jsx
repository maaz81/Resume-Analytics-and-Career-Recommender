import { cn } from '@utils/helpers';

/**
 * Spinner Component
 * Loading spinner with multiple sizes and variants
 * 
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - 'primary' | 'secondary' | 'white'
 * @param {boolean} fullScreen - Show as full screen overlay
 * @param {string} label - Loading label text
 */
const Spinner = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  label,
  className,
}) => {
  // Size styles
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Variant styles
  const variantStyles = {
    primary: 'text-brand-primary',
    secondary: 'text-text-secondary',
    white: 'text-white',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {/* Spinner SVG */}
      <svg
        className={cn('animate-spin', sizeStyles[size], variantStyles[variant])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      {/* Label */}
      {label && (
        <p className="text-sm font-medium text-text-secondary animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-background/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * DotsSpinner - Alternative dots loading animation
 */
export const DotsSpinner = ({ size = 'md', variant = 'primary', className }) => {
  const sizeStyles = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const variantStyles = {
    primary: 'bg-brand-primary',
    secondary: 'bg-text-secondary',
    white: 'bg-white',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            sizeStyles[size],
            variantStyles[variant]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * PulseSpinner - Pulsing circle animation
 */
export const PulseSpinner = ({ size = 'md', variant = 'primary', className }) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const variantStyles = {
    primary: 'border-brand-primary',
    secondary: 'border-text-secondary',
    white: 'border-white',
  };

  return (
    <div className={cn('relative', sizeStyles[size], className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-4 animate-pulse opacity-75',
          variantStyles[variant]
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full border-4 animate-pulse opacity-50',
          variantStyles[variant]
        )}
        style={{ animationDelay: '0.3s' }}
      />
    </div>
  );
};

export default Spinner;