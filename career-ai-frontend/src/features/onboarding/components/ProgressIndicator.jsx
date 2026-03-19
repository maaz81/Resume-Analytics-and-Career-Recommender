import { Check } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * ProgressIndicator Component
 * Visual stepper showing onboarding progress
 */
const ProgressIndicator = ({ currentStep, totalSteps = 3 }) => {
  const steps = [
    { number: 1, label: 'Career Goal' },
    { number: 2, label: 'Resume Upload' },
    { number: 3, label: 'Job Description' }
  ];

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200',
                    isCompleted &&
                    'bg-status-success text-white ring-4 ring-status-success/20',
                    isActive &&
                    'bg-brand-primary text-white ring-4 ring-brand-primary/20',
                    !isActive &&
                    !isCompleted &&
                    'bg-surface-alt text-text-muted border-2 border-border'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    isActive && 'text-brand-primary',
                    isCompleted && 'text-status-success',
                    !isActive && !isCompleted && 'text-text-muted'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 -mt-8 transition-all duration-200',
                    isCompleted ? 'bg-status-success' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-4">
        <p className="text-sm text-text-secondary">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

export default ProgressIndicator;