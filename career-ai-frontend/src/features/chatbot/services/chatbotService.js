/**
 * Chatbot Service
 * All API calls for chat conversations.
 * Uses the shared axios instance from auth/services/api.js which
 * automatically attaches the Bearer token via its request interceptor.
 */
import API from '../../auth/services/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ─── Create a new conversation ────────────────────────────────────────────────
export const createConversationAPI = async () => {
    const res = await API.post('/chat/conversations');
    return res.data.conversation;
};

// ─── Get all conversations ────────────────────────────────────────────────────
export const getAllConversations = async () => {
    const res = await API.get('/chat/conversations');
    return res.data.conversations;
};

// ─── Get conversation history ─────────────────────────────────────────────────
export const getConversationHistory = async (conversationId) => {
    const res = await API.get(`/chat/conversations/${conversationId}/history`);
    return res.data; // { messages: [...] }
};

// ─── Delete a conversation ────────────────────────────────────────────────────
export const deleteConversationAPI = async (conversationId) => {
    // No backend delete route yet — graceful no-op
    return { success: true };
};

// ─── Send a message with SSE streaming ───────────────────────────────────────
/**
 * Uses the native fetch API for SSE (Server-Sent Events) streaming.
 * Axios does not support ReadableStream, so we fall back to fetch here
 * and manually attach the Bearer token.
 */
export const sendMessageStreaming = async ({
    message,
    conversationId,
    onChunk,
    onComplete,
    onError,
}) => {
    try {
        const token = localStorage.getItem('auth_token');
        const baseURL = BACKEND_URL;

        const response = await fetch(
            `${baseURL}/api/v1/chat/conversations/${conversationId}/stream`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ message }),
            }
        );

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.replace('data: ', ''));

                        if (data.chunk && onChunk) {
                            onChunk(data.chunk);
                        }

                        if (data.done && onComplete) {
                            onComplete();
                        }

                        if (data.error && onError) {
                            onError(new Error(data.error));
                        }
                    } catch {
                        // Ignore malformed SSE lines
                    }
                }
            }
        }
    } catch (error) {
        console.error('Streaming error:', error);
        if (onError) onError(error);
    }
};

// ─── File upload (local / mock) ───────────────────────────────────────────────
export const uploadFile = async (file) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        id: `file_${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
    };
};

// ─── File deletion (mock) ─────────────────────────────────────────────────────
export const deleteFile = async (_fileId) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
};

// ─── Export conversation to PDF (mock) ───────────────────────────────────────
export const exportConversationToPDF = async (conversationId) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pdfContent = `Career AI Chat Export\nConversation ID: ${conversationId}\n\nConnect your backend for real PDF export.`;
    return new Blob([pdfContent], { type: 'application/pdf' });
};