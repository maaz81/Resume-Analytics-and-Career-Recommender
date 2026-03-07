import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    createConversation,
    setActiveConversation,
    addUserMessage,
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
    selectMessages,
    selectIsStreaming,
    selectIsLoading,
    selectError,
    selectUploadedFiles,
    selectConversations,
    selectActiveConversation,
} from '../slices/chatbotSlice';
import {
    sendMessageStreaming,
    uploadFile,
    deleteFile,
    getAllConversations,
    getConversationHistory,
    deleteConversationAPI,
    exportConversationToPDF,
} from '../services/chatbotService';

/**
 * Custom hook for chatbot functionality
 * Encapsulates all chatbot logic, state management, and API interactions
 */
export const useChatbot = () => {
    const dispatch = useDispatch();
    const messages = useSelector(selectMessages);
    const isStreaming = useSelector(selectIsStreaming);
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const uploadedFiles = useSelector(selectUploadedFiles);
    const conversations = useSelector(selectConversations);
    const activeConversation = useSelector(selectActiveConversation);

    const messagesEndRef = useRef(null);

    /**
     * Auto-scroll to bottom when new messages arrive
     */
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    /**
     * Load conversations on mount
     */
    useEffect(() => {
        loadConversationsFromAPI();
    }, []);

    /**
     * Load all conversations from API
     */
    const loadConversationsFromAPI = async () => {
        try {
            dispatch(setLoading(true));
            const conversationsData = await getAllConversations();
            dispatch(loadConversations(conversationsData));
        } catch (err) {
            console.error('Failed to load conversations:', err);
            dispatch(setError(err.message));
        } finally {
            dispatch(setLoading(false));
        }
    };

    /**
     * Create a new conversation
     */
    const handleNewChat = useCallback(() => {
        const conversationId = `conv_${Date.now()}`;
        dispatch(createConversation({ id: conversationId }));
    }, [dispatch]);

    /**
     * Switch to a different conversation
     */
    const handleSwitchConversation = useCallback(async (conversationId) => {
        try {
            dispatch(setLoading(true));
            const conversationData = await getConversationHistory(conversationId);
            dispatch(
                setActiveConversation({
                    conversationId,
                    messages: conversationData.messages || [],
                })
            );
        } catch (err) {
            console.error('Failed to load conversation:', err);
            dispatch(setError(err.message));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    /**
     * Send a message to the AI
     */
    const handleSendMessage = useCallback(
        async (messageContent) => {
            if (!messageContent.trim() && uploadedFiles.length === 0) return;

            // Ensure we have an active conversation
            let conversationId = activeConversation?.id;
            if (!conversationId) {
                conversationId = `conv_${Date.now()}`;
                dispatch(createConversation({ id: conversationId }));
            }

            // Clear any previous errors
            dispatch(clearError());

            // Add user message to state
            dispatch(
                addUserMessage({
                    content: messageContent,
                    files: uploadedFiles.map((f) => ({
                        id: f.id,
                        name: f.name,
                        type: f.type,
                    })),
                })
            );

            // Start streaming response
            const streamId = `msg_${Date.now()}`;
            dispatch(startStreaming({ id: streamId }));

            // Send message to API with streaming
            await sendMessageStreaming({
                message: messageContent,
                conversationId,
                files: uploadedFiles,
                onChunk: (chunk) => {
                    dispatch(updateStreamingMessage({ chunk }));
                },
                onComplete: () => {
                    dispatch(completeStreaming());
                },
                onError: (err) => {
                    dispatch(setError(err.message || 'Failed to send message'));
                    dispatch(completeStreaming());
                },
            });
        },
        [dispatch, uploadedFiles, activeConversation]
    );

    /**
     * Handle file upload
     */
    const handleFileUpload = useCallback(
        async (file) => {
            try {
                dispatch(setLoading(true));
                const uploadedFile = await uploadFile(file);

                dispatch(
                    addUploadedFile({
                        id: uploadedFile.id || Date.now().toString(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: uploadedFile.url,
                        file: file,
                    })
                );
            } catch (err) {
                console.error('File upload failed:', err);
                dispatch(setError(err.message || 'Failed to upload file'));
            } finally {
                dispatch(setLoading(false));
            }
        },
        [dispatch]
    );

    /**
     * Remove uploaded file
     */
    const handleRemoveFile = useCallback(
        async (fileId) => {
            try {
                await deleteFile(fileId);
                dispatch(removeUploadedFile({ id: fileId }));
            } catch (err) {
                console.error('File removal failed:', err);
                // Still remove from UI even if API call fails
                dispatch(removeUploadedFile({ id: fileId }));
            }
        },
        [dispatch]
    );

    /**
     * Delete a conversation
     */
    const handleDeleteConversation = useCallback(
        async (conversationId) => {
            try {
                await deleteConversationAPI(conversationId);
                dispatch(deleteConversation({ conversationId }));
            } catch (err) {
                console.error('Failed to delete conversation:', err);
                dispatch(setError(err.message || 'Failed to delete conversation'));
            }
        },
        [dispatch]
    );

    /**
     * Clear current chat
     */
    const handleClearChat = useCallback(() => {
        dispatch(clearCurrentChat());
    }, [dispatch]);

    /**
     * Export conversation to PDF
     */
    const handleExportToPDF = useCallback(async () => {
        if (!activeConversation?.id) {
            dispatch(setError('No active conversation to export'));
            return;
        }

        try {
            dispatch(setLoading(true));
            const pdfBlob = await exportConversationToPDF(activeConversation.id);

            // Create download link
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `conversation_${activeConversation.id}_${new Date().toISOString()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export conversation:', err);
            dispatch(setError(err.message || 'Failed to export conversation'));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, activeConversation]);

    /**
     * Clear error
     */
    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        // State
        messages,
        isStreaming,
        isLoading,
        error,
        uploadedFiles,
        conversations,
        activeConversation,
        messagesEndRef,

        // Actions
        handleSendMessage,
        handleNewChat,
        handleSwitchConversation,
        handleFileUpload,
        handleRemoveFile,
        handleDeleteConversation,
        handleClearChat,
        handleExportToPDF,
        handleClearError,
        scrollToBottom,
    };
};