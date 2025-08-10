import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadChatService } from "../../../services/chatService";
import { useChatStore } from "../../../stores/chatStore";
import {
  validateChatInput,
  getNextMessageIndex,
} from "../../../utils/chatValidation";
import type { ChatMessage, ChatService } from "../../../types/chat";

export function useChatFlow() {
  const currentServiceId = useChatStore((s) => s.currentServiceId);

  const {
    data: service,
    isLoading: serviceLoading,
    isError: serviceError,
    error,
  } = useQuery<ChatService>({
    queryKey: ["chat-service", currentServiceId],
    queryFn: () => loadChatService(currentServiceId as string),
    enabled: Boolean(currentServiceId),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [chatCancelled, setChatCancelled] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!service || !chatStarted) return;
    const msg = service.messages[current];
    if (!msg?.continue) return;

    const t = setTimeout(() => {
      setCurrent(getNextMessageIndex(service.messages, current));
    }, 1000);
    return () => clearTimeout(t);
  }, [service, chatStarted, current]);

  const currentMsg = useMemo<ChatMessage | null>(() => {
    if (!service) return null;
    return service.messages[current] ?? null;
  }, [service, current]);

  // Actions
  const startChat = useCallback(() => {
    setChatStarted(true);
    setCurrent(1);
  }, []);

  const startEditing = useCallback(
    (messageId: string, currentValue: string) => {
      setEditingMessageId(messageId);
      setInput(currentValue);
    },
    [],
  );

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setInput("");
  }, []);

  const handleSubmit = useCallback(() => {
    if (!service) return;

    // Edit mode
    if (editingMessageId) {
      const value = input.trim();
      if (value) {
        const editIdx = service.messages.findIndex(
          (m) => m.id === editingMessageId,
        );
        setAnswers((prev) => ({ ...prev, [editingMessageId]: value }));
        setCurrent(editIdx + 1);
        setEditingMessageId(null);
        setInput("");
        setChatStarted(true);
      }
      return;
    }

    const msg = service.messages[current];
    if (!msg || msg.type !== "input") return;

    const err = validateChatInput(msg, input);
    if (err) {
      setInputError(err);
      return;
    }

    setAnswers((prev) => ({ ...prev, [msg.id]: input }));
    setInput("");
    setInputError("");
    setCurrent(getNextMessageIndex(service.messages, current));
  }, [service, editingMessageId, input, current]);

  const handleAction = useCallback(
    (label: string) => {
      if (!service) return;

      const msg = service.messages[current];
      if (!msg || msg.type !== "action") return;

      const selected = msg.actions?.find((a) => a.label === label);
      if (selected?.type === "deny") {
        setChatCancelled(true);
        setInput("");
        setInputError("");
        return;
      }

      setAnswers((prev) => ({ ...prev, [msg.id]: label }));
      const nextIndex = getNextMessageIndex(service.messages, current);
      setCurrent(nextIndex);

      if (nextIndex >= service.messages.length) {
        setShowSummary(true);
      }
    },
    [service, current],
  );

  const resetChat = useCallback(() => {
    setAnswers({});
    setCurrent(0);
    setInput("");
    setInputError("");
    setChatStarted(false);
    setShowSummary(false);
    setChatCancelled(false);
    setEditingMessageId(null);
  }, []);

  return {
    // service
    service,
    serviceLoading,
    serviceError,
    serviceErrorObject: error as Error | undefined,

    // state
    answers,
    current,
    input,
    inputError,
    chatStarted,
    showSummary,
    chatCancelled,
    editingMessageId,
    currentMsg,

    // actions
    startChat,
    startEditing,
    cancelEdit,
    handleSubmit,
    handleAction,
    resetChat,
    setInput,
    setShowSummary,
  };
}
