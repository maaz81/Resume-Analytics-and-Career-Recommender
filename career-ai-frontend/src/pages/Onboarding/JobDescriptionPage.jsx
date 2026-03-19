import Card, { CardContent } from '@common/Card';
import ProgressIndicator from '@features/onboarding/components/ProgressIndicator';
import JobDescriptionForm from '@features/onboarding/components/JobDescriptionForm';
import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';

const JobDescriptionPage = () => {
    const { currentStep, finishOnboarding, goToPreviousStep } = useOnboarding();

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 py-8">
            <ProgressIndicator currentStep={currentStep} totalSteps={3} />

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-text-primary">
                    Add Job Description
                </h1>
                <p className="text-text-secondary">
                    Improve your ATS score by matching your resume with a job description (optional)
                </p>
            </div>

            <Card className="shadow-lg">
                <CardContent className="p-8">
                    <JobDescriptionForm
                        onComplete={finishOnboarding}
                        onBack={goToPreviousStep}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default JobDescriptionPage;