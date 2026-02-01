import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@utils/helpers';

/**
 * ChatInput Component
 * Input field for sending chat messages
 */
const ChatInput = ({ onSend, isLoading, placeholder = "Ask me anything..." }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
        className={cn(
          'w-full px-4 py-3 pr-12 rounded-lg border border-border',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary',
          'resize-none overflow-hidden',
          'disabled:bg-disabled-bg disabled:cursor-not-allowed',
          'transition-all duration-200'
        )}
        style={{
          minHeight: '48px',
          maxHeight: '120px',
        }}
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className={cn(
          'absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-brand-primary',
          message.trim() && !isLoading
            ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
            : 'bg-surface-alt text-text-muted cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default ChatInput;