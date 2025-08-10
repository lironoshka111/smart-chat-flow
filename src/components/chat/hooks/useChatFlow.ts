import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadChatService } from "../../../services/chatService";
import { useChatStore } from "../../../stores/chatStore";
import { useChatUIStore, chatActions } from "../../../stores/chatUIStore";
import {
  validateChatInput,
  getNextMessageIndex,
} from "../../../utils/chatValidation";
import type { ChatMessage } from "../../../types/chat";

export function useChatFlow() {
  const currentServiceId = useChatStore((s) => s.currentServiceId);

  const {
    data: service,
    isLoading: serviceLoading,
    isError: serviceError,
    error,
  } = useQuery({
    queryKey: ["chat-service", currentServiceId],
    queryFn: () => loadChatService(currentServiceId as string),
    enabled: Boolean(currentServiceId),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const current = useChatUIStore((s) => s.current);
  const input = useChatUIStore((s) => s.input);
  const inputError = useChatUIStore((s) => s.inputError);
  const chatStarted = useChatUIStore((s) => s.chatStarted);
  const showSummary = useChatUIStore((s) => s.showSummary);
  const chatCancelled = useChatUIStore((s) => s.chatCancelled);
  const editingMessageId = useChatUIStore((s) => s.editingMessageId);
  const answers = useChatUIStore((s) => s.answers);

  // Auto-advance when a message has `continue: true`
  useEffect(() => {
    if (!chatStarted || !service) return;
    const msg = service.messages[current];
    if (!msg?.continue) return;

    const t = setTimeout(() => {
      chatActions.setCurrent(getNextMessageIndex(service.messages, current));
    }, 1000);
    return () => clearTimeout(t);
  }, [chatStarted, current, service]);

  // Actions (stable because they call `chatActions` directly)
  const startChat = () => {
    chatActions.setStarted(true);
    chatActions.setCurrent(1);
  };

  const startEditing = (messageId: string, currentValue: string) => {
    chatActions.setEditing(messageId);
    chatActions.setInput(currentValue);
  };

  const cancelEdit = () => {
    chatActions.setEditing(null);
    chatActions.setInput("");
  };

  const handleSubmit = () => {
    if (!service) return;

    // Edit mode
    if (editingMessageId) {
      if (input.trim()) {
        const editIdx = service.messages.findIndex(
          (m: ChatMessage) => m.id === editingMessageId,
        );
        chatActions.setAnswers((prev) => ({
          ...prev,
          [editingMessageId]: input,
        }));
        chatActions.setCurrent(editIdx + 1);
        chatActions.setEditing(null);
        chatActions.setInput("");
        chatActions.setStarted(true);
      }
      return;
    }

    const msg = service.messages[current];
    if (!msg || msg.type !== "input") return;

    const err = validateChatInput(msg, input);
    if (err) {
      chatActions.setError(err);
      return;
    }

    chatActions.setAnswers((prev) => ({ ...prev, [msg.id]: input }));
    chatActions.setInput("");
    chatActions.setError("");

    chatActions.setCurrent(getNextMessageIndex(service.messages, current));
  };

  const handleAction = (label: string) => {
    if (!service) return;

    const msg = service.messages[current];
    if (!msg || msg.type !== "action") return;

    const selected = msg.actions?.find((a) => a.label === label);
    if (selected?.type === "deny") {
      chatActions.setCancelled(true);
      chatActions.setInput("");
      chatActions.setError("");
      return;
    }

    chatActions.setAnswers((prev) => ({ ...prev, [msg.id]: label }));
    const nextIndex = getNextMessageIndex(service.messages, current);
    chatActions.setCurrent(nextIndex);

    if (nextIndex >= service.messages.length) {
      chatActions.setShowSummary(true);
    }
  };

  return {
    // service
    service,
    serviceLoading,
    serviceError,
    serviceErrorObject: error as Error | undefined,

    // readonly slices (for convenience; use selectors in components ideally)
    current,
    input,
    inputError,
    chatStarted,
    showSummary,
    chatCancelled,
    editingMessageId,
    answers,

    // actions
    startChat,
    startEditing,
    cancelEdit,
    handleSubmit,
    handleAction,
  };
}
