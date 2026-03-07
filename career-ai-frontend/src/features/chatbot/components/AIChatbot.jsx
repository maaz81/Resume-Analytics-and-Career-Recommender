import { useEffect } from 'react';
import { useChatbot } from '../hooks/useChatbot';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

/**
 * AIChatbot Component
 * Main chatbot interface with message display and input
 * 
 * Features:
 * - Real-time streaming responses
 * - File upload support
 * - Message history
 * - Markdown rendering with syntax highlighting
 * - PDF export
 * - Responsive design
 */
const AIChatbot = () => {
    const {
        messages,
        isStreaming,
        isLoading,
        error,
        uploadedFiles,
        activeConversation,
        messagesEndRef,
        handleSendMessage,
        handleNewChat,
        handleFileUpload,
        handleRemoveFile,
        handleClearChat,
        handleExportToPDF,
        handleClearError,
    } = useChatbot();

    /**
     * Show welcome message if no messages
     */
    const showWelcome = messages.length === 0;

    return (
        <div className="flex flex-col h-screen bg-surface-background">
            {/* Header */}
            <ChatHeader
                conversationTitle={activeConversation?.title}
                messageCount={messages.length}
                onNewChat={handleNewChat}
                onExport={handleExportToPDF}
                onClearChat={handleClearChat}
                isStreaming={isStreaming}
            />

            {/* Error Banner */}
            {error && (
                <div className="mx-6 mt-4 animate-slideInUp">
                    <div className="flex items-center justify-between px-4 py-3 bg-status-error-light border border-status-error/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <svg
                                className="w-5 h-5 text-status-error flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm text-status-error font-medium">{error}</p>
                        </div>
                        <button
                            onClick={handleClearError}
                            className="text-status-error hover:text-status-error-dark transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-4xl mx-auto">
                    {showWelcome ? (
                        /* Welcome Screen */
                        <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                            <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-info flex items-center justify-center shadow-lg">
                                <svg
                                    className="w-10 h-10 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-3">
                                Welcome to AI Assistant
                            </h2>
                            <p className="text-text-secondary max-w-md mb-8">
                                I'm here to help you with resume analysis, career guidance, and answer any questions you might have.
                                Start a conversation below!
                            </p>

                            {/* Suggested Prompts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                {[
                                    {
                                        icon: '📄',
                                        title: 'Analyze my resume',
                                        prompt: 'Can you analyze my resume and provide feedback?',
                                    },
                                    {
                                        icon: '💼',
                                        title: 'Career advice',
                                        prompt: 'What skills should I develop for my target role?',
                                    },
                                    {
                                        icon: '✨',
                                        title: 'Improve my skills',
                                        prompt: 'How can I improve my technical skills?',
                                    },
                                    {
                                        icon: '🎯',
                                        title: 'Interview prep',
                                        prompt: 'Help me prepare for technical interviews',
                                    },
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSendMessage(suggestion.prompt)}
                                        className="flex items-start gap-3 p-4 text-left bg-surface-card border border-border rounded-lg hover:border-brand-primary hover:shadow-md transition-all group"
                                    >
                                        <span className="text-2xl">{suggestion.icon}</span>
                                        <div>
                                            <p className="text-sm font-medium text-text-primary group-hover:text-brand-primary transition-colors">
                                                {suggestion.title}
                                            </p>
                                            <p className="text-xs text-text-muted mt-1">{suggestion.prompt}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Messages */
                        <div className="space-y-6">
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    isStreaming={message.isStreaming}
                                />
                            ))}
                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Loading Indicator (when initially loading) */}
                    {isLoading && messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                                <p className="text-sm text-text-muted">Loading conversation...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <ChatInput
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
                isLoading={isLoading}
                uploadedFiles={uploadedFiles}
                onFileUpload={handleFileUpload}
                onRemoveFile={handleRemoveFile}
            />
        </div>
    );
};

export default AIChatbot;