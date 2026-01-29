// ===== src/components/ui/Skeleton/Skeleton.jsx =====
import { cn } from '@utils/helpers';

/**
 * Skeleton Component
 * Loading placeholder with shimmer effect
 */
const Skeleton = ({ variant = 'text', className, ...props }) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    title: 'h-6 w-3/4 rounded',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-lg',
    card: 'h-32 w-full rounded-lg',
  };

  return (
    <div
      className={cn(
        'skeleton bg-surface-alt animate-pulse',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
};

/**
 * SkeletonGroup - Multiple skeleton lines
 */
export const SkeletonGroup = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" />
      ))}
    </div>
  );
};

/**
 * CardSkeleton - Skeleton for card content
 */
export const CardSkeleton = ({ className }) => {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <Skeleton variant="title" />
      <SkeletonGroup lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
};

export default Skeleton;