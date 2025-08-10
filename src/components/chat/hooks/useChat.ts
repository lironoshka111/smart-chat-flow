import type { ChatService, ChatHistory } from "../../../types/chat";
import { useChatStore } from "../../../stores/chatStore";

// Focused hooks
import { useChatState } from "./useChatState";
import { useChatHistory } from "./useChatHistory";
import { useChatFlow } from "./useChatFlow";
import { useChatPersistence } from "./useChatPersistence";

interface UseChatProps {
  service?: ChatService;
}

/**
 * Main chat hook - orchestrates smaller focused hooks
 * Now much cleaner and easier to understand!
 */
export const useChat = ({ service }: UseChatProps) => {
  const { currentServiceId: serviceId, setCurrentServiceId } = useChatStore();
  // Core chat state management
  const {
    answers,
    current,
    input,
    inputError,
    chatStarted,
    showSummary,
    chatCancelled,
    editingMessageId,
    setAnswers,
    setCurrent,
    setInput,
    setInputError,
    setChatStarted,
    setShowSummary,
    setChatCancelled,
    setEditingMessageId,
    resetChat,
    handleInputChange,
  } = useChatState();

  // History management
  const {
    viewingHistory,
    chatHistory,
    viewHistory,
    exitHistoryView,
    saveToHistory,
  } = useChatHistory();

  // Chat flow (start, submit, actions, editing)
  const { startChat, handleSubmit, handleAction, startEditing, cancelEdit } =
    useChatFlow(
      service || null,
      { current, input, editingMessageId, chatStarted, viewingHistory },
      {
        setCurrent,
        setAnswers,
        setInput,
        setInputError,
        setChatStarted,
        setShowSummary,
        setChatCancelled,
        setEditingMessageId,
      },
    );

  // Persistence
  const { clearPersistedState } = useChatPersistence(
    { current, answers, chatStarted },
    { setCurrent, setAnswers, setChatStarted },
  );

  // Summary and history actions
  const handleCloseSummary = () => {
    setShowSummary(false);
    if (!viewingHistory && service) {
      saveToHistory(service.id, service.title, service.description, answers);
    }
    resetChat();
  };

  const startNewChat = () => {
    exitHistoryView();
    resetChat();
    clearPersistedState();
  };

  const handleServiceSelect = (newServiceId: string) => {
    // Exit history view and reset chat state when switching services
    exitHistoryView();
    resetChat();
    clearPersistedState();
    setCurrentServiceId(newServiceId);
  };

  return {
    // State
    answers,
    current,
    input,
    inputError,
    chatStarted,
    showSummary,
    chatCancelled,
    editingMessageId,
    chatHistory,
    viewingHistory,

    // Actions
    startChat,
    handleInputChange,
    handleSubmit,
    handleAction,
    handleCloseSummary,
    startEditing,
    cancelEdit,
    viewHistory: (history: ChatHistory) => viewHistory(history, serviceId),
    startNewChat,
    handleServiceSelect,
  };
};
