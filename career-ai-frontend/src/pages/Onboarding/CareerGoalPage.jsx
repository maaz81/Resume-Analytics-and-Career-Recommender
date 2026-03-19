import { useEffect } from 'react';
import Card, { CardContent } from '@common/Card';
import ProgressIndicator from '@features/onboarding/components/ProgressIndicator';
import CareerGoalForm from '@features/onboarding/components/CareerGoalForm';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';

const CareerGoalPage = () => {
  const { currentStep, setStep, goToNextStep } = useOnboarding();

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} totalSteps={3} />

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">
          Let's set up your career goals
        </h1>
        <p className="text-text-secondary">
          Tell us about your career aspirations so we can personalize your experience
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <CareerGoalForm onComplete={goToNextStep} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerGoalPage;
