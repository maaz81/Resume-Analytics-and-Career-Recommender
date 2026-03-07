import { useRef } from 'react';

/**
 * ChatFileUpload Component
 * Handles file uploads with preview and removal
 */
const ChatFileUpload = ({ uploadedFiles, onFileUpload, onRemoveFile, isDisabled }) => {
    const fileInputRef = useRef(null);

    /**
     * Handle file selection
     */
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file) => {
            onFileUpload(file);
        });
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Format file size
     */
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    /**
     * Get file icon based on type
     */
    const getFileIcon = (type) => {
        if (type.startsWith('image/')) {
            return (
                <svg className="w-5 h-5 text-brand-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            );
        }
        if (type === 'application/pdf') {
            return (
                <svg className="w-5 h-5 text-status-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
        );
    };

    return (
        <div className="space-y-3">
            {/* File Upload Button */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={isDisabled}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                multiple
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach files"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                </svg>
                <span>Attach files</span>
            </button>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-2 px-3 py-2 bg-surface-alt border border-border rounded-lg group hover:border-brand-primary transition-colors"
                        >
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">
                                    {file.name}
                                </p>
                                <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                                onClick={() => onRemoveFile(file.id)}
                                className="p-1 text-text-muted hover:text-status-error transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove file"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatFileUpload;