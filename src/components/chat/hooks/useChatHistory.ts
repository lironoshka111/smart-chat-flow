import { useMemo } from "react";
import { useChatStore } from "../../../stores/chatStore";
import { useUserStore } from "../../../stores/userStore";
import type { ChatHistory } from "../../../types/chat";

export const useChatHistory = () => {
  const email = useUserStore((s) => s.user?.email ?? null);
  const viewingHistory = useChatStore((s) => s.viewingHistory);
  const setViewingHistory = useChatStore((s) => s.setViewingHistory);

  const getHistoryForUser = useChatStore((s) => s.getHistoryForUser);
  const addHistoryForUser = useChatStore((s) => s.addHistoryForUser);
  const setCurrentServiceId = useChatStore((s) => s.setCurrentServiceId);

  const chatHistory = useMemo<ChatHistory[]>(
    () => (email ? getHistoryForUser(email) : []),
    [email, getHistoryForUser, viewingHistory],
  );

  const viewHistory = (history: ChatHistory) => {
    setCurrentServiceId(history.serviceId);
    setViewingHistory(history);
  };

  const exitHistoryView = () => setViewingHistory(null);

  const saveToHistory = (
    serviceId: string,
    serviceTitle: string,
    serviceDescription: string,
    answers: Record<string, string>,
  ) => {
    if (!email) return;

    const firstKey = Object.keys(answers)[0];
    const firstInput = firstKey ? answers[firstKey] : undefined;

    const newHistory: ChatHistory = {
      id: Date.now().toString(),
      serviceId,
      serviceTitle,
      serviceDescription,
      timestamp: new Date(),
      answers: { ...answers },
      firstInput,
    };

    addHistoryForUser(email, newHistory);
    setViewingHistory(newHistory);
  };

  return {
    viewingHistory,
    chatHistory,
    viewHistory,
    exitHistoryView,
    saveToHistory,
  };
};
