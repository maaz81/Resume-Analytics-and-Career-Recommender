// ===== src/pages/Onboarding/ResumeUploadPage.jsx =====
import Card, { CardContent } from '@common/Card';
import ProgressIndicator from '@features/onboarding/components/ProgressIndicator';
import ResumeUpload from '@features/onboarding/components/ResumeUpload';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';

const ResumeUploadPage = () => {
  const { currentStep, finishOnboarding, goToPreviousStep } = useOnboarding();

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} totalSteps={2} />

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">
          Upload your resume
        </h1>
        <p className="text-text-secondary">
          Get instant AI-powered analysis and ATS optimization suggestions
        </p>
      </div>

      {/* Upload Card */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <ResumeUpload
            onComplete={finishOnboarding}
            onBack={goToPreviousStep}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUploadPage;