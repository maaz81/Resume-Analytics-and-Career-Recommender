// /**
//  * Chatbot API Service
//  * Handles all API communication for the chatbot feature
//  */

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// /**
//  * Send message to AI with streaming response
//  * @param {Object} params - Request parameters
//  * @param {string} params.message - User message
//  * @param {string} params.conversationId - Active conversation ID
//  * @param {Array} params.files - Uploaded files (optional)
//  * @param {Function} onChunk - Callback for each streamed chunk
//  * @param {Function} onComplete - Callback when streaming completes
//  * @param {Function} onError - Callback for errors
//  */
// export const sendMessageStreaming = async ({
//     message,
//     conversationId,
//     files = [],
//     onChunk,
//     onComplete,
//     onError,
// }) => {
//     try {
//         const formData = new FormData();
//         formData.append('message', message);
//         formData.append('conversationId', conversationId);

//         // Attach files if any
//         files.forEach((file, index) => {
//             formData.append(`file_${index}`, file.file);
//         });

//         const response = await fetch(`${API_BASE_URL}/chat/stream`, {
//             method: 'POST',
//             headers: {
//                 // Don't set Content-Type for FormData, browser will set it with boundary
//                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//             },
//             body: formData,
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to send message');
//         }

//         // Handle Server-Sent Events (SSE)
//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';

//         while (true) {
//             const { done, value } = await reader.read();

//             if (done) {
//                 if (onComplete) onComplete();
//                 break;
//             }

//             // Decode the chunk
//             buffer += decoder.decode(value, { stream: true });

//             // Process complete lines
//             const lines = buffer.split('\n');
//             buffer = lines.pop() || ''; // Keep incomplete line in buffer

//             for (const line of lines) {
//                 if (line.startsWith('data: ')) {
//                     const data = line.slice(6); // Remove 'data: ' prefix

//                     if (data === '[DONE]') {
//                         if (onComplete) onComplete();
//                         return;
//                     }

//                     try {
//                         const parsed = JSON.parse(data);

//                         // Handle different event types
//                         if (parsed.type === 'chunk' && parsed.content) {
//                             if (onChunk) onChunk(parsed.content);
//                         } else if (parsed.type === 'error') {
//                             throw new Error(parsed.message || 'Streaming error');
//                         }
//                     } catch (parseError) {
//                         // If not JSON, treat as plain text chunk
//                         if (onChunk) onChunk(data);
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         console.error('Streaming error:', error);
//         if (onError) onError(error);
//     }
// };

// /**
//  * Upload file for chatbot context
//  * @param {File} file - File to upload
//  * @returns {Promise<Object>} - Upload response
//  */
// export const uploadFile = async (file) => {
//     try {
//         const formData = new FormData();
//         formData.append('file', file);

//         const response = await fetch(`${API_BASE_URL}/chat/upload`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//             },
//             body: formData,
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to upload file');
//         }

//         return await response.json();
//     } catch (error) {
//         console.error('File upload error:', error);
//         throw error;
//     }
// };

// /**
//  * Delete uploaded file
//  * @param {string} fileId - File ID to delete
//  */
// export const deleteFile = async (fileId) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/chat/upload/${fileId}`, {
//             method: 'DELETE',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to delete file');
//         }

//         return await response.json();
//     } catch (error) {
//         console.error('File deletion error:', error);
//         throw error;
//     }
// };

// /**
//  * Get conversation history
//  * @param {string} conversationId - Conversation ID
//  * @returns {Promise<Array>} - Array of messages
//  */
// export const getConversationHistory = async (conversationId) => {
//     try {
//         const response = await fetch(
//             `${API_BASE_URL}/chat/conversations/${conversationId}`,
//             {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//                 },
//             }
//         );

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to fetch conversation');
//         }

//         return await response.json();
//     } catch (error) {
//         console.error('Fetch conversation error:', error);
//         throw error;
//     }
// };

// /**
//  * Get all user conversations
//  * @returns {Promise<Array>} - Array of conversations
//  */
// export const getAllConversations = async () => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//             },
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to fetch conversations');
//         }

//         return await response.json();
//     } catch (error) {
//         console.error('Fetch conversations error:', error);
//         throw error;
//     }
// };

// /**
//  * Delete a conversation
//  * @param {string} conversationId - Conversation ID to delete
//  */
// export const deleteConversationAPI = async (conversationId) => {
//     try {
//         const response = await fetch(
//             `${API_BASE_URL}/chat/conversations/${conversationId}`,
//             {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//                 },
//             }
//         );

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to delete conversation');
//         }

//         return await response.json();
//     } catch (error) {
//         console.error('Delete conversation error:', error);
//         throw error;
//     }
// };

// /**
//  * Export conversation to PDF
//  * @param {string} conversationId - Conversation ID
//  * @returns {Promise<Blob>} - PDF blob
//  */
// export const exportConversationToPDF = async (conversationId) => {
//     try {
//         const response = await fetch(
//             `${API_BASE_URL}/chat/conversations/${conversationId}/export`,
//             {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//                 },
//             }
//         );

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to export conversation');
//         }

//         return await response.blob();
//     } catch (error) {
//         console.error('Export conversation error:', error);
//         throw error;
//     }
// };

/**
 * Mock Chatbot Service (Development Only)
 * Use this temporarily while backend is being built
 * 
 * TO USE:
 * Replace the import in useChatbot.js:
 * FROM: import { ... } from '../services/chatbotService';
 * TO:   import { ... } from '../services/chatbotService.mock';
 */

/**
 * Mock AI response generator
 */
const generateMockAIResponse = (userMessage) => {
    const responses = [
        "Based on your resume, I can see you have strong experience in your field. Let me analyze the key areas...",
        "That's a great question! Here are some suggestions to improve your skills:",
        "I'd be happy to help you with that. Let me break this down for you:",
        "Based on current industry trends, here's what I recommend:",
        "Your resume shows potential. Here are some areas where you can strengthen your profile:",
    ];

    return responses[Math.floor(Math.random() * responses.length)] +
        `\n\n**Key Points:**\n- First important point\n- Second consideration\n- Third recommendation\n\n` +
        `This is a mock response for development. Connect your backend to get real AI responses.`;
};

/**
 * Mock streaming function
 */
export const sendMessageStreaming = async ({
    message,
    conversationId,
    files = [],
    onChunk,
    onComplete,
    onError,
}) => {
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate mock response
        const mockResponse = generateMockAIResponse(message);

        // Stream the response character by character
        for (let i = 0; i < mockResponse.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing
            if (onChunk) onChunk(mockResponse[i]);
        }

        // Complete streaming
        if (onComplete) onComplete();
    } catch (error) {
        console.error('Mock streaming error:', error);
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
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
        {
            id: 'conv_1',
            title: 'Resume Analysis Discussion',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            messageCount: 8,
        },
        {
            id: 'conv_2',
            title: 'Career Path Guidance',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 7200000).toISOString(),
            messageCount: 5,
        },
    ];
};

/**
 * Mock get conversation history
 */
export const getConversationHistory = async (conversationId) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        id: conversationId,
        title: 'Sample Conversation',
        messages: [
            {
                id: 'msg_1',
                role: 'user',
                content: 'Can you help me with my resume?',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
                id: 'msg_2',
                role: 'assistant',
                content: 'Of course! I\'d be happy to help you with your resume. Could you share what specific areas you\'d like to improve?',
                timestamp: new Date(Date.now() - 3500000).toISOString(),
            },
        ],
    };
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