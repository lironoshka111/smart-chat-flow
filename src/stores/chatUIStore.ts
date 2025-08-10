// src/stores/chatUIStore.ts
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";
import type { ChatHistory } from "../types/chat";

type Answers = Record<string, string>;

interface ChatUIState {
  // Ephemeral UI state
  answers: Answers;
  current: number;
  input: string;
  inputError: string;
  chatStarted: boolean;
  showSummary: boolean;
  chatCancelled: boolean;
  editingMessageId: string | null;
  viewingHistory: ChatHistory | null;

  // Actions
  reset: () => void;
  setInput: (val: string) => void;
  setError: (val: string) => void;
  setCurrent: (idx: number) => void;
  setStarted: (v: boolean) => void;
  setShowSummary: (v: boolean) => void;
  setCancelled: (v: boolean) => void;
  setEditing: (id: string | null) => void;
  setAnswers: (updater: (prev: Answers) => Answers) => void;
  setViewingHistory: (history: ChatHistory | null) => void;
}

const initial: Omit<
  ChatUIState,
  | "reset"
  | "setInput"
  | "setError"
  | "setCurrent"
  | "setStarted"
  | "setShowSummary"
  | "setCancelled"
  | "setEditing"
  | "viewHistory"
  | "setAnswers"
  | "setViewingHistory"
> = {
  answers: {},
  current: 0,
  input: "",
  inputError: "",
  chatStarted: false,
  showSummary: false,
  chatCancelled: false,
  editingMessageId: null,
  viewingHistory: null,
};

export const useChatUIStore = createWithEqualityFn<ChatUIState>()(
  (set, get) => ({
    ...initial,

    reset: () => set({ ...initial }),

    setInput: (val) => set({ input: val, inputError: "" }),
    setError: (val) => set({ inputError: val }),
    setCurrent: (idx) => set({ current: idx }),
    setStarted: (v) => set({ chatStarted: v }),
    setShowSummary: (v) => set({ showSummary: v }),
    setCancelled: (v) => set({ chatCancelled: v }),
    setEditing: (id) => set({ editingMessageId: id }),
    setAnswers: (updater) => set({ answers: updater(get().answers) }),
    setViewingHistory: (history) => set({ viewingHistory: history }),
  }),
  shallow,
);

export const chatActions = {
  reset: () => useChatUIStore.getState().reset(),
  setInput: (v: string) => useChatUIStore.getState().setInput(v),
  setError: (v: string) => useChatUIStore.getState().setError(v),
  setCurrent: (i: number) => useChatUIStore.getState().setCurrent(i),
  setStarted: (v: boolean) => useChatUIStore.getState().setStarted(v),
  setShowSummary: (v: boolean) => useChatUIStore.getState().setShowSummary(v),
  setCancelled: (v: boolean) => useChatUIStore.getState().setCancelled(v),
  setEditing: (id: string | null) => useChatUIStore.getState().setEditing(id),
  setAnswers: (updater: (prev: Answers) => Answers) =>
    useChatUIStore.getState().setAnswers(updater),
};
