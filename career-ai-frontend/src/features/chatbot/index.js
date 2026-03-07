/**
 * Chatbot Feature Exports
 * Centralized exports for easy importing
 */

// Components
export { default as AIChatbot } from './components/AIChatbot';
export { default as ChatMessage } from './components/ChatMessage';
export { default as ChatInput } from './components/ChatInput';
export { default as ChatHeader } from './components/ChatHeader';
export { default as ChatFileUpload } from './components/ChatFileUpload';

// Hooks
export { useChatbot } from './hooks/useChatbot';

// Services
export * as chatbotService from './services/chatbotService';

// Redux
export {
    default as chatbotReducer,
    createConversation,
    setActiveConversation,
    addUserMessage,
    addAIMessage,
    startStreaming,
    updateStreamingMessage,
    completeStreaming,
    addUploadedFile,
    removeUploadedFile,
    clearUploadedFiles,
    deleteConversation,
    clearCurrentChat,
    setLoading,
    setError,
    clearError,
    loadConversations,
    updateConversationTitle,
    selectActiveConversation,
    selectMessages,
    selectIsStreaming,
    selectIsLoading,
    selectError,
    selectUploadedFiles,
    selectConversations,
} from './slices/chatbotSlice';