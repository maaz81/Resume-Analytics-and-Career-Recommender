// ===== src/components/forms/FormTextarea/FormTextarea.jsx =====
import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * FormTextarea Component
 * Multi-line text input
 */
const FormTextarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      rows = 4,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles =
      'block w-full rounded-lg border transition-all duration-200 ease-out-expo focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed px-4 py-2.5 resize-y';

    const stateStyles = error
      ? 'border-status-error focus:border-status-error focus:ring-status-error/20 text-status-error-dark'
      : 'border-border focus:border-brand-primary focus:ring-brand-primary/20 text-text-primary';

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={cn(baseStyles, stateStyles)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {error && (
          <div
            id={`${textareaId}-error`}
            className="flex items-center gap-1.5 mt-1.5 text-sm text-status-error"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && helperText && (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;