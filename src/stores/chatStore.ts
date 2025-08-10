// src/stores/chatStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatHistory, CurrentChatState } from "../types/chat";

interface ChatStore {
  // --- NON-PERSISTED ---
  currentServiceId: string | null;
  currentChatState: CurrentChatState | null;
  setCurrentServiceId: (serviceId: string | null) => void;
  setCurrentChatState: (state: CurrentChatState | null) => void;

  viewingHistory: ChatHistory | null;
  setViewingHistory: (history: ChatHistory | null) => void;

  // --- PERSISTED (BY USER EMAIL) ---
  historyByUser: Record<string, ChatHistory[]>;

  getHistoryForUser: (email: string) => ChatHistory[];
  addHistoryForUser: (email: string, history: ChatHistory) => void;
  clearHistoryForUser: (email: string) => void;

  // --- UTIL ---
  resetAllChatData: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // --- non-persisted ---
      currentServiceId: null,
      currentChatState: null,
      viewingHistory: null,

      setCurrentServiceId: (serviceId) => set({ currentServiceId: serviceId }),
      setCurrentChatState: (state) => set({ currentChatState: state }),
      setViewingHistory: (history) => set({ viewingHistory: history }),

      // --- persisted ---
      historyByUser: {},

      getHistoryForUser: (email) => get().historyByUser[email] || [],
      addHistoryForUser: (email, history) =>
        set((state) => ({
          historyByUser: {
            ...state.historyByUser,
            [email]: [history, ...(state.historyByUser[email] || [])],
          },
        })),
      clearHistoryForUser: (email) =>
        set((state) => ({
          historyByUser: {
            ...state.historyByUser,
            [email]: [],
          },
        })),

      // --- utilities ---
      resetAllChatData: () =>
        set({
          currentServiceId: null,
          currentChatState: null,
          historyByUser: {},
        }),
    }),
    {
      name: "smart-chat-store",
      partialize: (state) => ({
        historyByUser: state.historyByUser,
      }),
      onRehydrateStorage: () => (state) => {
        // Rehydrate timestamps
        if (state?.historyByUser) {
          for (const email in state.historyByUser) {
            state.historyByUser[email] = state.historyByUser[email].map(
              (h) => ({
                ...h,
                timestamp:
                  typeof h.timestamp === "string"
                    ? new Date(h.timestamp)
                    : h.timestamp,
              }),
            );
          }
        }
      },
    },
  ),
);
