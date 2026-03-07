import { createSlice } from '@reduxjs/toolkit';

/**
 * Chatbot Redux Slice
 * Manages conversation state, messages, and UI state
 */

const initialState = {
    conversations: [], // Array of conversation objects
    activeConversationId: null,
    messages: [], // Messages for active conversation
    isStreaming: false,
    isLoading: false,
    error: null,
    uploadedFiles: [], // Files attached to current message
};

const chatbotSlice = createSlice({
    name: 'chatbot',
    initialState,
    reducers: {
        // Create new conversation
        createConversation: (state, action) => {
            const newConversation = {
                id: action.payload.id || Date.now().toString(),
                title: action.payload.title || 'New Chat',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messageCount: 0,
            };
            state.conversations.unshift(newConversation);
            state.activeConversationId = newConversation.id;
            state.messages = [];
            state.uploadedFiles = [];
        },

        // Set active conversation
        setActiveConversation: (state, action) => {
            state.activeConversationId = action.payload.conversationId;
            state.messages = action.payload.messages || [];
            state.uploadedFiles = [];
        },

        // Add user message
        addUserMessage: (state, action) => {
            const message = {
                id: Date.now().toString(),
                role: 'user',
                content: action.payload.content,
                files: action.payload.files || [],
                timestamp: new Date().toISOString(),
            };
            state.messages.push(message);
            state.uploadedFiles = [];

            // Update conversation
            const conversation = state.conversations.find(
                (c) => c.id === state.activeConversationId
            );
            if (conversation) {
                conversation.updatedAt = new Date().toISOString();
                conversation.messageCount += 1;
                // Auto-generate title from first message
                if (conversation.messageCount === 1) {
                    conversation.title = action.payload.content.slice(0, 50) +
                        (action.payload.content.length > 50 ? '...' : '');
                }
            }
        },

        // Add AI message (for non-streaming or complete messages)
        addAIMessage: (state, action) => {
            const message = {
                id: action.payload.id || Date.now().toString(),
                role: 'assistant',
                content: action.payload.content,
                timestamp: new Date().toISOString(),
            };
            state.messages.push(message);

            // Update conversation
            const conversation = state.conversations.find(
                (c) => c.id === state.activeConversationId
            );
            if (conversation) {
                conversation.updatedAt = new Date().toISOString();
                conversation.messageCount += 1;
            }
        },

        // Start streaming (add empty AI message)
        startStreaming: (state, action) => {
            state.isStreaming = true;
            const message = {
                id: action.payload.id || `stream-${Date.now()}`,
                role: 'assistant',
                content: '',
                timestamp: new Date().toISOString(),
                isStreaming: true,
            };
            state.messages.push(message);
        },

        // Update streaming message content
        updateStreamingMessage: (state, action) => {
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage && lastMessage.isStreaming) {
                lastMessage.content += action.payload.chunk;
            }
        },

        // Complete streaming
        completeStreaming: (state) => {
            state.isStreaming = false;
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage && lastMessage.isStreaming) {
                delete lastMessage.isStreaming;

                // Update conversation
                const conversation = state.conversations.find(
                    (c) => c.id === state.activeConversationId
                );
                if (conversation) {
                    conversation.updatedAt = new Date().toISOString();
                    conversation.messageCount += 1;
                }
            }
        },

        // Handle file uploads
        addUploadedFile: (state, action) => {
            state.uploadedFiles.push(action.payload);
        },

        removeUploadedFile: (state, action) => {
            state.uploadedFiles = state.uploadedFiles.filter(
                (file) => file.id !== action.payload.id
            );
        },

        clearUploadedFiles: (state) => {
            state.uploadedFiles = [];
        },

        // Delete conversation
        deleteConversation: (state, action) => {
            state.conversations = state.conversations.filter(
                (c) => c.id !== action.payload.conversationId
            );

            // If deleted conversation was active, clear messages
            if (state.activeConversationId === action.payload.conversationId) {
                state.activeConversationId = null;
                state.messages = [];
            }
        },

        // Clear current chat
        clearCurrentChat: (state) => {
            state.messages = [];
            state.uploadedFiles = [];
            state.activeConversationId = null;
        },

        // Set loading state
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },

        // Set error
        setError: (state, action) => {
            state.error = action.payload;
            state.isStreaming = false;
            state.isLoading = false;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },

        // Load conversations from storage
        loadConversations: (state, action) => {
            state.conversations = action.payload;
        },

        // Update conversation title
        updateConversationTitle: (state, action) => {
            const conversation = state.conversations.find(
                (c) => c.id === action.payload.conversationId
            );
            if (conversation) {
                conversation.title = action.payload.title;
            }
        },
    },
});

export const {
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
} = chatbotSlice.actions;

export default chatbotSlice.reducer;

// Selectors
export const selectActiveConversation = (state) => {
    const { activeConversationId, conversations } = state.chatbot;
    return conversations.find((c) => c.id === activeConversationId) || null;
};

export const selectMessages = (state) => state.chatbot.messages;
export const selectIsStreaming = (state) => state.chatbot.isStreaming;
export const selectIsLoading = (state) => state.chatbot.isLoading;
export const selectError = (state) => state.chatbot.error;
export const selectUploadedFiles = (state) => state.chatbot.uploadedFiles;
export const selectConversations = (state) => state.chatbot.conversations;