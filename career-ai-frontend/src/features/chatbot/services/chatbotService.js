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
};

/**
 * Mock streaming function
 */
export const sendMessageStreaming = async ({
    message,
    conversationId,
    onChunk,
    onComplete,
    onError,
}) => {
    try {
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
        if (onError) onError(error);
    }
};

/**
 * Mock file upload
 */
export const uploadFile = async (file) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        id: `file_${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        type: file.type,
    };
};

/**
 * Mock file deletion
 */
export const deleteFile = async (fileId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
};

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
export const exportConversationToPDF = async (conversationId) => {
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a simple text blob as mock PDF
    const pdfContent = `Mock PDF Export\nConversation ID: ${conversationId}\n\nThis is a mock PDF. Connect your backend for real PDF export.`;
    return new Blob([pdfContent], { type: 'application/pdf' });
};