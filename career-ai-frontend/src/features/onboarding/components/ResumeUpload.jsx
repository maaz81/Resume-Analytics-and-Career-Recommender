import { useState } from 'react';
import { FileText, Upload, CheckCircle, Shield } from 'lucide-react';
import FileUpload from '@components/forms/FileUpload';
import Button from '@common/Button';
import Alert from '@common/Alert';
import { useOnboarding } from '../hooks/useOnboarding';

/**
 * ResumeUpload Component
 * Resume upload with analysis loading state
 */
const ResumeUpload = ({ onComplete, onBack }) => {
  const { uploadResume, isLoading, error } = useOnboarding();
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setUploadError('Please select a resume file');
      return;
    }

    // Upload resume
    setIsAnalyzing(true);
    const result = await uploadResume(file);

    if (result.success) {
      // Simulate analysis delay
      setTimeout(() => {
        setIsAnalyzing(false);
        onComplete();
      }, 1500);
    } else {
      setIsAnalyzing(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {(error || uploadError) && (
        <Alert variant="error" dismissible onDismiss={() => setUploadError(null)}>
          {error || uploadError}
        </Alert>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <Alert variant="info">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-primary border-t-transparent" />
            <div>
              <p className="font-medium">Analyzing your resume...</p>
              <p className="text-sm mt-1">
                This may take a few seconds as we extract skills, experience, and optimize for ATS.
              </p>
            </div>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <FileUpload
          label="Upload Your Resume"
          accept=".pdf"
          maxSize={5}
          value={file}
          onChange={(selectedFile) => {
            setFile(selectedFile);
            setUploadError(null);
          }}
          error={uploadError}
          disabled={isLoading || isAnalyzing}
        />

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-surface-alt border border-border">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-brand-primary" />
            </div>
            <h4 className="font-medium text-text-primary mb-1">Quick Upload</h4>
            <p className="text-sm text-text-secondary">
              Drag & drop or browse to upload your PDF resume
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface-alt border border-border">
            <div className="w-10 h-10 rounded-lg bg-status-success/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-status-success" />
            </div>
            <h4 className="font-medium text-text-primary mb-1">AI Analysis</h4>
            <p className="text-sm text-text-secondary">
              Get instant ATS score and improvement suggestions
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface-alt border border-border">
            <div className="w-10 h-10 rounded-lg bg-status-info/10 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-status-info" />
            </div>
            <h4 className="font-medium text-text-primary mb-1">Secure & Private</h4>
            <p className="text-sm text-text-secondary">
              Your data is encrypted and never shared
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="p-4 rounded-lg bg-status-info-light border border-status-info/20">
          <h4 className="font-medium text-status-info-dark mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resume Tips
          </h4>
          <ul className="text-sm text-status-info-dark space-y-1 list-disc list-inside">
            <li>Use a PDF format for best results</li>
            <li>Keep file size under 5MB</li>
            <li>Use standard fonts (Arial, Calibri, Times New Roman)</li>
            <li>Include clear section headers (Experience, Education, Skills)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading || isAnalyzing}
            className="flex-1"
          >
            Back
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading || isAnalyzing}
            disabled={isLoading || isAnalyzing || !file}
            className="flex-1"
            size="lg"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading || isAnalyzing}
            className="text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Skip for now (you can upload later)
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResumeUpload;