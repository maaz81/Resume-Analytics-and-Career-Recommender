import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * Input Component
 * Production-grade input with validation and error states
 * 
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {React.ReactNode} leftIcon - Icon on the left
 * @param {React.ReactNode} rightIcon - Icon on the right
 * @param {boolean} required - Mark as required
 * @param {boolean} disabled - Disable input
 * @param {string} type - Input type (text, email, password, etc.)
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      required = false,
      disabled = false,
      type = 'text',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Base input styles
    const baseStyles =
      'block w-full rounded-lg border transition-all duration-200 ease-out-expo focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-disabled-bg disabled:text-disabled-text disabled:cursor-not-allowed';

    // State-based styles
    const stateStyles = error
      ? 'border-status-error focus:border-status-error focus:ring-status-error/20 text-status-error-dark'
      : 'border-border focus:border-brand-primary focus:ring-brand-primary/20 text-text-primary';

    // Padding based on icons
    const paddingStyles = cn(
      'py-2.5',
      leftIcon ? 'pl-10' : 'pl-4',
      rightIcon || isPasswordType ? 'pr-10' : 'pr-4'
    );

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(baseStyles, stateStyles, paddingStyles)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || isPasswordType) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPasswordType ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-muted hover:text-text-primary transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <span className="text-text-muted">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            id={`${inputId}-error`}
            className="flex items-center gap-1.5 mt-1.5 text-sm text-status-error"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;