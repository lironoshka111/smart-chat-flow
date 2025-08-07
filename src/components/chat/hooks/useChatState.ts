import { useState } from "react";

/**
 * Manages core chat state - answers, current position, input, etc.
 */
export const useChatState = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [chatCancelled, setChatCancelled] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const resetChat = () => {
    setCurrent(0);
    setAnswers({});
    setInput("");
    setInputError("");
    setChatStarted(false);
    setChatCancelled(false);
    setEditingMessageId(null);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setInputError("");
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

    // Setters
    setAnswers,
    setCurrent,
    setInput,
    setInputError,
    setChatStarted,
    setShowSummary,
    setChatCancelled,
    setEditingMessageId,

    // Actions
    resetChat,
    handleInputChange,
  };
};
