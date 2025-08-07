import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatHistory } from "../types/chat";

export interface CurrentChatState {
  serviceId: string;
  current: number;
  answers: Record<string, string>;
  chatStarted: boolean;
  timestamp: string;
}

interface ChatStore {
  // Service management
  currentServiceId: string;
  setCurrentServiceId: (serviceId: string) => void;

  // Chat history management
  chatHistory: ChatHistory[];
  setChatHistory: (history: ChatHistory[]) => void;
  addChatHistory: (history: ChatHistory) => void;
  clearChatHistory: () => void;

  // Current chat state management
  currentChatState: CurrentChatState | null;
  setCurrentChatState: (state: CurrentChatState | null) => void;

  // Utility methods
  resetAllChatData: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // Service management
      currentServiceId: "employee-onboarding",
      setCurrentServiceId: (serviceId: string) =>
        set({ currentServiceId: serviceId }),

      // Chat history management
      chatHistory: [],
      setChatHistory: (history: ChatHistory[]) => set({ chatHistory: history }),

      addChatHistory: (history: ChatHistory) =>
        set((state) => ({
          chatHistory: [history, ...state.chatHistory],
        })),

      clearChatHistory: () => set({ chatHistory: [] }),

      // Current chat state management
      currentChatState: null,
      setCurrentChatState: (state: CurrentChatState | null) =>
        set({ currentChatState: state }),

      // Utility methods
      resetAllChatData: () =>
        set({
          chatHistory: [],
          currentChatState: null,
          currentServiceId: "employee-onboarding",
        }),
    }),
    {
      name: "smart-chat-store",
      partialize: (state) => ({
        currentServiceId: state.currentServiceId,
        chatHistory: state.chatHistory,
        currentChatState: state.currentChatState,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert timestamp strings back to Date objects when loading from storage
        if (state?.chatHistory) {
          state.chatHistory = state.chatHistory.map((history) => ({
            ...history,
            timestamp: new Date(history.timestamp),
          }));
        }
      },
    }
  )
);
