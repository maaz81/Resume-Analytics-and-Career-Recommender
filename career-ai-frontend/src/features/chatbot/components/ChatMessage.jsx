import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * ChatMessage Component
 * Displays individual chat messages with markdown support
 */
const ChatMessage = ({ message, isStreaming }) => {
    const [copied, setCopied] = useState(false);

    const isUser = message.role === 'user';

    /**
     * Copy message content to clipboard
     */
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    /**
     * Format timestamp
     */
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}
        >
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isUser
                            ? 'bg-brand-primary text-white'
                            : 'bg-surface-alt text-text-primary border border-border'
                        }`}
                >
                    {isUser ? 'U' : 'AI'}
                </div>

                {/* Message Content */}
                <div className="flex flex-col gap-1.5 min-w-0">
                    {/* Message Bubble */}
                    <div
                        className={`rounded-lg px-4 py-3 ${isUser
                                ? 'bg-brand-primary text-white'
                                : 'bg-surface-card border border-border text-text-primary'
                            } shadow-sm`}
                    >
                        {isUser ? (
                            // User message (plain text)
                            <div className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                            </div>
                        ) : (
                            // AI message (markdown with code highlighting)
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        margin: '0.5rem 0',
                                                        borderRadius: '4px',
                                                    }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code
                                                    className="bg-surface-alt text-brand-accent px-1.5 py-0.5 rounded text-xs font-mono"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        },
                                        a({ node, children, ...props }) {
                                            return (
                                                <a
                                                    className="text-brand-info hover:underline"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    {...props}
                                                >
                                                    {children}
                                                </a>
                                            );
                                        },
                                        p({ children }) {
                                            return <p className="mb-2 last:mb-0">{children}</p>;
                                        },
                                        ul({ children }) {
                                            return <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>;
                                        },
                                        ol({ children }) {
                                            return <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>;
                                        },
                                        h1({ children }) {
                                            return <h1 className="text-xl font-bold mb-2">{children}</h1>;
                                        },
                                        h2({ children }) {
                                            return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
                                        },
                                        h3({ children }) {
                                            return <h3 className="text-base font-semibold mb-1">{children}</h3>;
                                        },
                                        blockquote({ children }) {
                                            return (
                                                <blockquote className="border-l-4 border-border pl-4 italic my-2 text-text-secondary">
                                                    {children}
                                                </blockquote>
                                            );
                                        },
                                        strong({ children }) {
                                            return <strong className="font-semibold">{children}</strong>;
                                        },
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        )}

                        {/* Streaming indicator */}
                        {isStreaming && !isUser && (
                            <div className="flex items-center gap-1 mt-2">
                                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                        )}

                        {/* File attachments */}
                        {message.files && message.files.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border-light flex flex-wrap gap-2">
                                {message.files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-surface-alt px-3 py-1.5 rounded-md text-xs"
                                    >
                                        <svg
                                            className="w-4 h-4 text-text-muted"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                            />
                                        </svg>
                                        <span className="text-text-secondary">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message footer */}
                    <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-xs text-text-muted">{formatTime(message.timestamp)}</span>

                        {/* Copy button for AI messages */}
                        {!isUser && !isStreaming && (
                            <button
                                onClick={handleCopy}
                                className="text-text-muted hover:text-text-secondary transition-colors"
                                title="Copy message"
                            >
                                {copied ? (
                                    <svg className="w-4 h-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;