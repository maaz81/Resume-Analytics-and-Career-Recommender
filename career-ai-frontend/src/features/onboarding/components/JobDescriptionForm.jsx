import { useState } from 'react';
import { FileText, Sparkles, SkipForward } from 'lucide-react';
import Button from '@common/Button';
import Alert from '@common/Alert';
import { useOnboarding } from '../hooks/useOnboarding';

const JobDescriptionForm = ({ onComplete, onBack }) => {
    const { saveJobDescription, isLoading, error } = useOnboarding();

    const [jdText, setJdText] = useState('');
    const [mode, setMode] = useState('manual'); // manual | auto

    const handleSubmit = async () => {
        let payload = null;

        if (mode === 'manual') {
            if (!jdText.trim()) {
                return;
            }
            payload = { type: 'manual', content: jdText };
        } else {
            payload = { type: 'auto' };
        }

        const result = await saveJobDescription(payload);

        if (result.success) {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <div className="space-y-6">

            {/* Error */}
            {error && (
                <Alert variant="error">
                    {error}
                </Alert>
            )}

            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-4">

                {/* Manual */}
                <button
                    onClick={() => setMode('manual')}
                    className={`p-4 rounded-lg border-2 text-left transition ${mode === 'manual'
                            ? 'border-brand-primary bg-brand-primary/5'
                            : 'border-border hover:border-brand-primary/50'
                        }`}
                >
                    <FileText className="w-5 h-5 mb-2 text-brand-primary" />
                    <p className="font-medium text-text-primary">Paste Job Description</p>
                    <p className="text-sm text-text-secondary">
                        Add real job posting for accurate ATS analysis
                    </p>
                </button>

                {/* Auto */}
                <button
                    onClick={() => setMode('auto')}
                    className={`p-4 rounded-lg border-2 text-left transition ${mode === 'auto'
                            ? 'border-brand-primary bg-brand-primary/5'
                            : 'border-border hover:border-brand-primary/50'
                        }`}
                >
                    <Sparkles className="w-5 h-5 mb-2 text-brand-primary" />
                    <p className="font-medium text-text-primary">Use AI Generated JD</p>
                    <p className="text-sm text-text-secondary">
                        We’ll generate based on your career goal
                    </p>
                </button>
            </div>

            {/* Manual Input */}
            {mode === 'manual' && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Job Description
                    </label>

                    <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste job description here..."
                        className="w-full h-40 p-3 rounded-lg border border-border focus:ring-2 focus:ring-border-focus outline-none"
                        disabled={isLoading}
                    />

                    <p className="text-xs text-text-muted mt-2">
                        Tip: Copy from LinkedIn, Indeed, or company careers page
                    </p>
                </div>
            )}

            {/* Auto Info */}
            {mode === 'auto' && (
                <div className="p-4 rounded-lg bg-status-info-light border border-status-info/20">
                    <p className="text-sm text-status-info-dark">
                        We’ll generate a job description based on your selected role and industry.
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex-1"
                >
                    Back
                </Button>

                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    className="flex-1"
                >
                    Analyze Resume
                </Button>
            </div>

            {/* Skip */}
            <div className="text-center">
                <button
                    onClick={handleSkip}
                    disabled={isLoading}
                    className="text-sm text-text-muted hover:text-text-primary flex items-center justify-center gap-1"
                >
                    <SkipForward className="w-4 h-4" />
                    Continue without job description
                </button>
            </div>

        </div>
    );
};

export default JobDescriptionForm;