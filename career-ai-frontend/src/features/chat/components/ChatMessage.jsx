import { Bot, User } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * ChatMessage Component
 * Displays individual chat message
 */
const ChatMessage = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format message content (support markdown-like formatting)
  const formatContent = (content) => {
    // Split by newlines and format
    return content.split('\n').map((line, idx) => {
      // Bold text **text**
      const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Bullet points
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <li key={idx} className="ml-4" dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        );
      }
      
      // Numbered lists
      if (/^\d+\./.test(line)) {
        return (
          <li key={idx} className="ml-4" dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        );
      }
      
      // Checkmarks
      if (line.startsWith('✓') || line.startsWith('✗') || line.startsWith('⚠️')) {
        return (
          <p key={idx} className="my-1" dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        );
      }
      
      // Regular text
      if (line.trim()) {
        return (
          <p key={idx} className="my-1" dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        );
      }
      
      return <br key={idx} />;
    });
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-fadeIn',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-brand-primary' : 'bg-surface-alt'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-brand-primary" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex-1 max-w-[80%]',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm',
            isUser
              ? 'bg-brand-primary text-white'
              : 'bg-surface-alt text-text-primary border border-border'
          )}
        >
          <div className="prose prose-sm max-w-none">
            {formatContent(message.content)}
          </div>
        </div>
        
        <span className="text-xs text-text-muted mt-1 px-2">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;