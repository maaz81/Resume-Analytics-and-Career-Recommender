import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Bot, Sparkles, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Button from '@common/Button';
import { cn } from '@utils/helpers';
import {
  addMessage,
  setTyping,
  closeChat,
  clearMessages,
  setConversationId
} from '../slices/chatSlice';
import { sendChatMessageService, getChatSuggestionsService, createConversationService } from '../services/chatService';

/**
 * AIChatPanel Component
 * Persistent chat panel that slides in from the right
 */
const AIChatPanel = () => {
  const dispatch = useDispatch();
  const { messages, isOpen, isTyping, conversationId } = useSelector(
    (state) => state.chat
  );
  const messagesEndRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Load suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      const result = await getChatSuggestionsService();
      setSuggestions(result);
    };
    loadSuggestions();
  }, []);

  // Send initial greeting if no messages
  useEffect(() => {
    const createConversation = async () => {
      if (isOpen && !conversationId) {
        try {
          const id = await createConversationService();
          dispatch(setConversationId(id));
        } catch (err) {
          console.error("Conversation creation failed", err);
        }
      }
    };

    createConversation();
  }, [isOpen, conversationId, dispatch]);

  const handleSendMessage = async (messageText) => {
    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      content: messageText,
      timestamp: new Date().toISOString(),
      sender: 'user',
    };
    dispatch(addMessage(userMessage));

    // Show typing indicator
    dispatch(setTyping(true));

    try {
      // Get AI response
      const response = await sendChatMessageService(
        messageText,
        conversationId
      );

      // Add AI response
      dispatch(addMessage(response));
    } catch (error) {
      const errorMessage = {
        id: `msg_${Date.now()}`,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
        sender: 'assistant',
      };
      dispatch(addMessage(errorMessage));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      dispatch(clearMessages());
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => dispatch(closeChat())}
      />

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full sm:w-96 bg-surface-card border-l border-border shadow-2xl z-50',
          'flex flex-col animate-slideInRight'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-brand-primary to-brand-primary/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                AI Career Assistant
                <Sparkles className="w-4 h-4" />
              </h3>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => dispatch(closeChat())}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-background">
          {/* Welcome Message or Chat History */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isUser={message.sender === 'user'}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="bg-surface-alt border border-border rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions (show when no messages except greeting) */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted px-2">Suggested questions:</p>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 rounded-lg border border-border bg-surface-card hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-sm text-text-secondary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-surface-card">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isTyping}
            placeholder="Ask me anything about your career..."
          />
          <p className="text-xs text-text-muted mt-2 text-center">
            AI responses are generated and may not always be accurate
          </p>
        </div>
      </div>
    </>
  );
};

export default AIChatPanel;