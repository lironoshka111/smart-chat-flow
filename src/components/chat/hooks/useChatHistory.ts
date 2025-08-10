import { useState } from "react";
import { useChatStore } from "../../../stores/chatStore";
import type { ChatHistory } from "../../../types/chat";

/**
 * Manages chat history viewing and navigation
 */
export const useChatHistory = () => {
  const [viewingHistory, setViewingHistory] = useState<ChatHistory | null>(
    null,
  );
  const { chatHistory, addChatHistory, setCurrentServiceId } = useChatStore();

  const viewHistory = (history: ChatHistory, currentServiceId: string) => {
    if (history.serviceId !== currentServiceId) {
      setCurrentServiceId(history.serviceId);
    }
    setViewingHistory(history);
  };

  const exitHistoryView = () => setViewingHistory(null);

  const saveToHistory = (
    serviceId: string,
    serviceTitle: string,
    serviceDescription: string,
    answers: Record<string, string>,
  ) => {
    const firstInputMessage = Object.keys(answers)[0];
    const firstInput = firstInputMessage
      ? answers[firstInputMessage]
      : undefined;

    const newHistory: ChatHistory = {
      id: Date.now().toString(),
      serviceId,
      serviceTitle,
      serviceDescription,
      timestamp: new Date(),
      answers: { ...answers },
      firstInput,
    };

    addChatHistory(newHistory);
  };

  return {
    viewingHistory,
    chatHistory,
    viewHistory,
    exitHistoryView,
    saveToHistory,
  };
};
