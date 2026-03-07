import { useState, useRef, useEffect } from 'react';
import ChatFileUpload from './ChatFileUpload';

/**
 * ChatInput Component
 * Input field with send button, file upload, and auto-resize textarea
 */
const ChatInput = ({
    onSendMessage,
    isStreaming,
    isLoading,
    uploadedFiles,
    onFileUpload,
    onRemoveFile,
}) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    /**
     * Auto-resize textarea based on content
     */
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [message]);

    /**
     * Handle send message
     */
    const handleSend = () => {
        if (!message.trim() && uploadedFiles.length === 0) return;
        if (isStreaming || isLoading) return;

        onSendMessage(message);
        setMessage('');
    };

    /**
     * Handle keyboard shortcuts
     */
    const handleKeyDown = (e) => {
        // Send on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isSendDisabled = (!message.trim() && uploadedFiles.length === 0) || isStreaming || isLoading;

    return (
        <div className="px-6 py-4 bg-surface-card border-t border-border">
            <div className="max-w-4xl mx-auto space-y-3">
                {/* File Upload */}
                <ChatFileUpload
                    uploadedFiles={uploadedFiles}
                    onFileUpload={onFileUpload}
                    onRemoveFile={onRemoveFile}
                    isDisabled={isStreaming || isLoading}
                />

                {/* Input Area */}
                <div className="relative flex items-end gap-3">
                    {/* Textarea */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                isStreaming
                                    ? 'AI is responding...'
                                    : 'Type your message... (Shift + Enter for new line)'
                            }
                            disabled={isStreaming || isLoading}
                            className="w-full px-4 py-3 pr-12 bg-surface-alt border border-border rounded-lg 
                       text-text-primary placeholder-text-muted resize-none
                       focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            rows={1}
                            style={{ minHeight: '52px', maxHeight: '200px' }}
                        />

                        {/* Character count (optional) */}
                        {message.length > 0 && (
                            <div className="absolute bottom-2 right-3 text-xs text-text-muted">
                                {message.length}
                            </div>
                        )}
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={isSendDisabled}
                        className="flex-shrink-0 p-3 bg-brand-primary text-white rounded-lg 
                     hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all transform active:scale-95 shadow-md hover:shadow-lg"
                        title={isSendDisabled ? 'Type a message to send' : 'Send message (Enter)'}
                    >
                        {isStreaming || isLoading ? (
                            <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Helper text */}
                <p className="text-xs text-text-muted text-center">
                    AI can make mistakes. Verify important information.
                </p>
            </div>
        </div>
    );
};

export default ChatInput;