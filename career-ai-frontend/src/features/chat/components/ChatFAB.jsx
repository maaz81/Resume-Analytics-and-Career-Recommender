import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, X } from 'lucide-react';
import { toggleChat } from '../slices/chatSlice';
import { cn } from '@utils/helpers';

/**
 * ChatFAB Component
 * Floating action button to open/close chat
 */
const ChatFAB = () => {
  const dispatch = useDispatch();
  const { isOpen, messages } = useSelector((state) => state.chat);

  // Count unread messages (messages from assistant after user's last message)
  const unreadCount = 0; // For now, we don't track unread

  return (
    <button
      onClick={() => dispatch(toggleChat())}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-14 h-14 rounded-full shadow-lg',
        'flex items-center justify-center',
        'transition-all duration-200 ease-out-expo',
        'focus:outline-none focus:ring-4 focus:ring-brand-primary/20',
        isOpen
          ? 'bg-text-muted hover:bg-text-secondary'
          : 'bg-brand-primary hover:bg-brand-primary/90 hover:scale-110'
      )}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-white" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-error text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default ChatFAB;