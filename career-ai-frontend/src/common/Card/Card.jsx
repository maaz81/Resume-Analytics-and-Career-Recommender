import { cn } from '@utils/helpers';

/**
 * Card Component
 * Flexible card container with optional header and footer
 * 
 * @param {React.ReactNode} children - Card content
 * @param {React.ReactNode} header - Card header content
 * @param {React.ReactNode} footer - Card footer content
 * @param {string} variant - 'default' | 'bordered' | 'elevated'
 * @param {boolean} hoverable - Add hover effect
 * @param {boolean} clickable - Add cursor pointer
 */
const Card = ({
  children,
  header,
  footer,
  variant = 'default',
  hoverable = false,
  clickable = false,
  className,
  ...props
}) => {
  // Base styles
  const baseStyles = 'bg-surface-card rounded-lg transition-all duration-200 ease-out-expo';

  // Variant styles
  const variantStyles = {
    default: 'border border-border',
    bordered: 'border-2 border-border',
    elevated: 'shadow-md hover:shadow-lg',
  };

  // Interactive styles
  const interactiveStyles = cn(
    hoverable && 'hover:shadow-lg hover:scale-[1.02]',
    clickable && 'cursor-pointer'
  );

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        interactiveStyles,
        className
      )}
      {...props}
    >
      {/* Header */}
      {header && (
        <div className="px-6 py-4 border-b border-border">
          {header}
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-surface-alt rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * CardHeader - Styled header for cards
 */
export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * CardTitle - Title component for cards
 */
export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn('text-xl font-semibold text-text-primary', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * CardDescription - Description component for cards
 */
export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-sm text-text-secondary mt-1', className)} {...props}>
      {children}
    </p>
  );
};

/**
 * CardContent - Content wrapper for cards
 */
export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
};

/**
 * CardFooter - Footer component for cards
 */
export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex items-center gap-3 mt-4', className)} {...props}>
      {children}
    </div>
  );
};

export default Card;