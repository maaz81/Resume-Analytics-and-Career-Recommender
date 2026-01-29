// ===== src/components/ui/EmptyState/EmptyState.jsx =====
import { cn } from '@utils/helpers';
import Button from '@common/Button';

/**
 * EmptyState Component
 * Display when there's no data to show
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-4">
          <div className="text-text-muted">{icon}</div>
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {(action || actionLabel) && (
        <div>
          {action || (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;