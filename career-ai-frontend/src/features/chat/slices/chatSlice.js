// ===== src/features/chat/slices/chatSlice.js =====
import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    conversationId: null,
    isOpen: false,
    isTyping: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setConversationId: (state, action) => {
      state.conversationId = action.payload;
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  addMessage,
  setConversationId,
  setTyping,
  toggleChat,
  openChat,
  closeChat,
  clearMessages,
} = chatSlice.actions;
export default chatSlice.reducer;

