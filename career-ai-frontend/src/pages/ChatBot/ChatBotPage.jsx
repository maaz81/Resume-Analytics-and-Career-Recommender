import { AIChatbot } from '../../features/chatbot';

/**
 * ChatBotPage Component
 * 
 * Page-level wrapper for the AI Chatbot feature.
 * This component lives in src/pages/ChatBot/ChatBotPage.jsx
 * 
 * The actual chatbot logic and UI is in the AIChatbot component
 * from the features/chatbot module.
 * 
 * Usage in AppRoutes.jsx:
 * <Route
 *   path={ROUTES.CHAT_BOT}
 *   element={
 *     <ProtectedRoute>
 *       <AppLayout>
 *         <ChatBotPage />
 *       </AppLayout>
 *     </ProtectedRoute>
 *   }
 * />
 */
const ChatBotPage = () => {
    return <AIChatbot />;
};

export default ChatBotPage;