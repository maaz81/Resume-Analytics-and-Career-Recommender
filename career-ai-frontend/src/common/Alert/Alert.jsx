import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * Alert Component
 * Contextual feedback messages
 * 
 * @param {string} variant - 'success' | 'error' | 'warning' | 'info'
 * @param {string} title - Alert title
 * @param {React.ReactNode} children - Alert content
 * @param {boolean} dismissible - Show close button
 * @param {function} onDismiss - Dismiss handler
 * @param {React.ReactNode} action - Action button/link
 */
const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  action,
  className,
  ...props
}) => {
  // Variant configurations
  const variantConfig = {
    success: {
      icon: CheckCircle,
      containerStyles: 'bg-status-success-light border-status-success text-status-success-dark',
      iconStyles: 'text-status-success',
    },
    error: {
      icon: AlertCircle,
      containerStyles: 'bg-status-error-light border-status-error text-status-error-dark',
      iconStyles: 'text-status-error',
    },
    warning: {
      icon: AlertTriangle,
      containerStyles: 'bg-status-warning-light border-status-warning text-status-warning-dark',
      iconStyles: 'text-status-warning',
    },
    info: {
      icon: Info,
      containerStyles: 'bg-status-info-light border-status-info text-status-info-dark',
      iconStyles: 'text-status-info',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        'relative flex gap-3 p-4 rounded-lg border',
        config.containerStyles,
        className
      )}
      {...props}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className={cn('w-5 h-5', config.iconStyles)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1 text-sm">
            {title}
          </h4>
        )}
        {children && (
          <div className="text-sm">
            {children}
          </div>
        )}
      </div>

      {/* Action */}
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors',
            config.iconStyles
          )}
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;