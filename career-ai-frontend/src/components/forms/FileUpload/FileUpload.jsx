// ===== src/components/forms/FileUpload/FileUpload.jsx =====
import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@utils/helpers';
import Button from '@common/Button';

/**
 * FileUpload Component
 * Drag-and-drop file upload with preview
 */
const FileUpload = ({
  label,
  accept = '.pdf',
  maxSize = 5, // MB
  error,
  onChange,
  value,
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Check file type
    const fileType = `.${file.name.split('.').pop()}`;
    if (!accept.includes(fileType)) {
      setUploadError(`Please upload a ${accept} file`);
      return;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setUploadError(null);
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayError = error || uploadError;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}

      {!value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg transition-all duration-200',
            isDragging
              ? 'border-brand-primary bg-brand-primary/5'
              : displayError
                ? 'border-status-error bg-status-error-light'
                : 'border-border hover:border-brand-primary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center mb-3',
                displayError ? 'bg-status-error-light' : 'bg-surface-alt'
              )}
            >
              {displayError ? (
                <AlertCircle className="w-6 h-6 text-status-error" />
              ) : (
                <Upload className="w-6 h-6 text-text-muted" />
              )}
            </div>

            <p className="text-sm font-medium text-text-primary mb-1">
              {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
            </p>
            <p className="text-xs text-text-muted mb-3">or</p>
            <Button variant="outline" size="sm" disabled={disabled} type="button">
              Browse Files
            </Button>

            <p className="text-xs text-text-muted mt-3">
              {accept} • Max {maxSize}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 bg-surface-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-brand-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary truncate">
                  {value.name}
                </p>
                <CheckCircle className="w-4 h-4 text-status-success flex-shrink-0" />
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {(value.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              onClick={handleRemove}
              className="p-1 rounded hover:bg-surface-alt transition-colors flex-shrink-0"
              type="button"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      )}

      {displayError && (
        <p className="mt-2 text-sm text-status-error flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          {displayError}
        </p>
      )}
    </div>
  );
};

export default FileUpload;