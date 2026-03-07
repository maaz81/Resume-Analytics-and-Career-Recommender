import { useState } from 'react';

/**
 * ChatHeader Component
 * Header with title, actions (new chat, export, settings)
 */
const ChatHeader = ({
    conversationTitle,
    onNewChat,
    onExport,
    onClearChat,
    isStreaming,
    messageCount,
}) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-surface-card border-b border-border">
            {/* Left: Title and Status */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary/10">
                    <svg
                        className="w-6 h-6 text-brand-primary"
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
                <div>
                    <h1 className="text-lg font-semibold text-text-primary">
                        {conversationTitle || 'AI Assistant'}
                    </h1>
                    <p className="text-xs text-text-muted">
                        {isStreaming ? (
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                                Responding...
                            </span>
                        ) : messageCount > 0 ? (
                            `${messageCount} messages`
                        ) : (
                            'Start a new conversation'
                        )}
                    </p>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* New Chat Button */}
                <button
                    onClick={onNewChat}
                    disabled={isStreaming}
                    className="px-4 py-2 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-lg hover:bg-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Start new chat"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>

                {/* Menu Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-lg transition-colors"
                        title="More options"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-dropdown"
                                onClick={() => setShowMenu(false)}
                            />

                            {/* Menu */}
                            <div className="absolute right-0 mt-2 w-48 bg-surface-card border border-border rounded-lg shadow-lg z-popover animate-fadeIn">
                                <button
                                    onClick={() => {
                                        onExport();
                                        setShowMenu(false);
                                    }}
                                    disabled={messageCount === 0}
                                    className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-alt disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Export to PDF
                                </button>

                                <button
                                    onClick={() => {
                                        onClearChat();
                                        setShowMenu(false);
                                    }}
                                    disabled={messageCount === 0}
                                    className="w-full px-4 py-2.5 text-left text-sm text-status-error hover:bg-status-error-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors rounded-b-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    Clear Chat
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;