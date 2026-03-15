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