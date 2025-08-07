import { useUpdateEffect } from "ahooks";
import type {
  ChatService,
  ChatMessage,
  ChatHistory,
} from "../../../types/chat";
import {
  validateChatInput,
  getNextMessageIndex,
} from "../../../utils/chatValidation";

/**
 * Manages chat flow - much simpler with state object
 */
export const useChatFlow = (
  service: ChatService | null,
  chatState: {
    current: number;
    input: string;
    editingMessageId: string | null;
    chatStarted: boolean;
    viewingHistory: ChatHistory | null;
  },
  actions: {
    setCurrent: (current: number) => void;
    setAnswers: (
      fn: (prev: Record<string, string>) => Record<string, string>,
    ) => void;
    setInput: (input: string) => void;
    setInputError: (error: string) => void;
    setChatStarted: (started: boolean) => void;
    setShowSummary: (show: boolean) => void;
    setChatCancelled: (cancelled: boolean) => void;
    setEditingMessageId: (id: string | null) => void;
  },
) => {
  const { current, input, editingMessageId, chatStarted, viewingHistory } =
    chatState;
  const {
    setCurrent,
    setAnswers,
    setInput,
    setInputError,
    setChatStarted,
    setShowSummary,
    setChatCancelled,
    setEditingMessageId,
  } = actions;

  // Auto-advance continue messages
  useUpdateEffect(() => {
    if (!chatStarted || viewingHistory || !service) return;

    const currentMsg = service.messages[current];
    if (!currentMsg?.continue) return;

    const timer = setTimeout(() => {
      setCurrent(getNextMessageIndex(service.messages, current));
    }, 1000);

    return () => clearTimeout(timer);
  }, [chatStarted, viewingHistory, current, service]);

  const startChat = () => {
    setChatStarted(true);
    setCurrent(1); // Start with first message after welcome
  };

  const handleSubmit = () => {
    if (!service) return;

    if (editingMessageId) {
      if (input.trim()) {
        const editIdx = service.messages.findIndex(
          (m: ChatMessage) => m.id === editingMessageId,
        );
        setAnswers((prev) => ({ ...prev, [editingMessageId]: input }));
        setCurrent(editIdx + 1);
        setEditingMessageId(null);
        setInput("");
        setChatStarted(true);
      }
      return;
    }

    const currentMsg = service.messages[current];
    if (!currentMsg || currentMsg.type !== "input") return;

    const error = validateChatInput(currentMsg, input);
    if (error) {
      setInputError(error);
      return;
    }

    setAnswers((prev) => ({ ...prev, [currentMsg.id]: input }));
    setInput("");
    setInputError("");

    const nextIndex = getNextMessageIndex(service.messages, current);
    setCurrent(nextIndex);
  };

  const handleAction = (label: string) => {
    if (!service) return;

    const currentMsg = service.messages[current];
    if (!currentMsg || currentMsg.type !== "action") return;

    // Find the action that was selected
    const selectedAction = currentMsg.actions?.find(
      (action) => action.label === label,
    );

    // If it's a deny action, cancel the chat
    if (selectedAction?.type === "deny") {
      setChatCancelled(true);
      setInput("");
      setInputError("");
      return;
    }

    // For approve actions, continue with normal flow
    setAnswers((prev) => ({ ...prev, [currentMsg.id]: label }));
    const nextIndex = getNextMessageIndex(service.messages, current);
    setCurrent(nextIndex);

    // Check if we've reached the end
    if (nextIndex >= service.messages.length) {
      setShowSummary(true);
    }
  };

  const startEditing = (messageId: string, currentValue: string) => {
    setEditingMessageId(messageId);
    setInput(currentValue);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setInput("");
  };

  return {
    startChat,
    handleSubmit,
    handleAction,
    startEditing,
    cancelEdit,
  };
};
