<<<<<<< HEAD
import API from '../../auth/services/api';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

export const createConversationAPI = async () => {
    const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: "POST",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        throw new Error("Failed to create conversation");
    }

    const data = await res.json();

    return data.conversation;
=======
/**
 * Chatbot Service
 * All API calls for chat conversations.
 * Uses the shared axios instance from auth/services/api.js which
 * automatically attaches the Bearer token via its request interceptor.
 */
import API from '../../auth/services/api';

// ─── Create a new conversation ────────────────────────────────────────────────
export const createConversationAPI = async () => {
    const res = await API.post('/chat/conversations');
    return res.data.conversation;
>>>>>>> 5fa3d9102baec2cfcaa43c906d587c1d3035b768
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
<<<<<<< HEAD
        const response = await fetch(
            `${API_BASE_URL}/chat/conversations/${conversationId}/stream`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({ message }),
            }
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // keep the last potentially incomplete line in the buffer

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const data = JSON.parse(line.substring(6)); // substring(6) removes 'data: '

                        if (data.chunk && onChunk) {
                            onChunk(data.chunk);
                        }

                        if (data.done && onComplete) {
                            onComplete();
                        }
                        
                        if (data.error && onError) {
                            onError(new Error(data.error));
                        }
                    } catch (e) {
                        console.error("Failed to parse stream chunk JSON:", e, "Line:", line);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Streaming error:", error);
=======
        const token = localStorage.getItem('auth_token');
        const baseURL = 'http://localhost:5000/api/v1';

        const response = await fetch(
            `${baseURL}/chat/conversations/${conversationId}/stream`,
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
>>>>>>> 5fa3d9102baec2cfcaa43c906d587c1d3035b768
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

<<<<<<< HEAD
/**
 * Mock get all conversations
 */
export const getAllConversations = async () => {
    const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch conversations");
    }

    const data = await res.json();

    return data.conversations;
};

/**
 * Mock get conversation history
 */
export const getConversationHistory = async (conversationId) => {
    const res = await fetch(
        `${API_BASE_URL}/chat/conversations/${conversationId}/history`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch conversation history");
    }

    const data = await res.json();

    return data;
};

/**
 * Mock delete conversation
 */
export const deleteConversationAPI = async (conversationId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
};

/**
 * Mock export to PDF
 */
=======
// ─── Export conversation to PDF (mock) ───────────────────────────────────────
>>>>>>> 5fa3d9102baec2cfcaa43c906d587c1d3035b768
export const exportConversationToPDF = async (conversationId) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const pdfContent = `Career AI Chat Export\nConversation ID: ${conversationId}\n\nConnect your backend for real PDF export.`;
    return new Blob([pdfContent], { type: 'application/pdf' });
};