import { useState, useEffect, useCallback } from "react";
import type { ChatMessage, ChatService } from "../../../types/chat";

// LocalStorage keys organization
const LOCAL_STORAGE_KEYS = {
  CHAT_HISTORY: (userEmail: string) => `chat-history-${userEmail}`,
  CURRENT_CHAT: (userEmail: string) => `chat-current-${userEmail}`,
  USER_PREFERENCES: (userEmail: string) => `chat-preferences-${userEmail}`,
} as const;

interface ChatHistory {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceDescription: string;
  timestamp: Date;
  answers: Record<string, string>;
  firstInput?: string;
}

interface UseChatProps {
  userEmail?: string;
  serviceId: string;
  service?: ChatService;
  onServiceSelect: (serviceId: string) => void;
}

export const useChat = ({
  userEmail,
  serviceId,
  service,
  onServiceSelect,
}: UseChatProps) => {
  // Core state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [chatCancelled, setChatCancelled] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // History state
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [viewingHistory, setViewingHistory] = useState<ChatHistory | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Define resetChat first to avoid initialization issues
  const resetChat = useCallback(() => {
    setCurrent(0);
    setAnswers({});
    setInput("");
    setInputError("");
    setChatStarted(false);
    setChatCancelled(false);
    setEditingMessageId(null);
  }, []);

  // Load chat history
  useEffect(() => {
    if (userEmail) {
      const saved = localStorage.getItem(
        LOCAL_STORAGE_KEYS.CHAT_HISTORY(userEmail)
      );
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const historyWithDates = parsed.map(
            (item: ChatHistory & { timestamp: string }) => ({
              ...item,
              timestamp: new Date(item.timestamp),
            })
          );
          setChatHistory(historyWithDates);
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }
    }
  }, [userEmail]);

  // Save chat history
  useEffect(() => {
    if (userEmail && chatHistory.length > 0) {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CHAT_HISTORY(userEmail),
        JSON.stringify(chatHistory)
      );
    }
  }, [chatHistory, userEmail]);

  // Save current chat state
  useEffect(() => {
    if (userEmail && chatStarted) {
      const currentState = {
        serviceId,
        current,
        answers,
        chatStarted,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CURRENT_CHAT(userEmail),
        JSON.stringify(currentState)
      );
    }
  }, [userEmail, serviceId, current, answers, chatStarted]);

  // Load current chat state
  useEffect(() => {
    if (userEmail && !chatStarted) {
      const saved = localStorage.getItem(
        LOCAL_STORAGE_KEYS.CURRENT_CHAT(userEmail)
      );
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only restore if it's from the same service
          if (parsed.serviceId === serviceId) {
            setCurrent(parsed.current || 0);
            setAnswers(parsed.answers || {});
            setChatStarted(parsed.chatStarted || false);
          }
        } catch (error) {
          console.error("Failed to load current chat state:", error);
        }
      }
    }
  }, [userEmail, serviceId, chatStarted]);

  // Save user preferences
  const saveUserPreferences = useCallback(
    (preferences: Record<string, any>) => {
      if (userEmail) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.USER_PREFERENCES(userEmail),
          JSON.stringify(preferences)
        );
      }
    },
    [userEmail]
  );

  // Load user preferences
  const loadUserPreferences = useCallback(() => {
    if (userEmail) {
      const saved = localStorage.getItem(
        LOCAL_STORAGE_KEYS.USER_PREFERENCES(userEmail)
      );
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error("Failed to load user preferences:", error);
        }
      }
    }
    return {};
  }, [userEmail]);

  // Clear all localStorage data for user
  const clearUserData = useCallback(() => {
    if (userEmail) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CHAT_HISTORY(userEmail));
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_CHAT(userEmail));
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES(userEmail));
      setChatHistory([]);
      setViewingHistory(null);
      resetChat();
    }
  }, [userEmail, resetChat]);

  // Handle continue messages - advance to next non-continue message
  const advanceToNextMessage = useCallback(
    (service: ChatService, currentIndex: number) => {
      let next = currentIndex + 1;
      while (
        next < service.messages.length &&
        service.messages[next]?.continue
      ) {
        next++;
      }
      return next;
    },
    []
  );

  // Reset when service changes
  useEffect(() => {
    if (viewingHistory && viewingHistory.serviceId !== serviceId) {
      setViewingHistory(null);
      resetChat();
    }
  }, [serviceId, viewingHistory, resetChat]);

  // Auto-load correct service when viewing history
  useEffect(() => {
    if (viewingHistory && viewingHistory.serviceId !== serviceId) {
      onServiceSelect(viewingHistory.serviceId);
    }
  }, [viewingHistory, serviceId, onServiceSelect]);

  // Auto-advance continue messages
  useEffect(() => {
    if (chatStarted && !viewingHistory && service) {
      const currentMsg = service.messages[current];
      if (currentMsg && currentMsg.continue) {
        const timer = setTimeout(() => {
          const nextIndex = advanceToNextMessage(service, current);
          setCurrent(nextIndex);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [chatStarted, viewingHistory, current, service, advanceToNextMessage]);

  const startChat = useCallback(() => {
    setChatStarted(true);
    // Start with the first message (welcome message) and advance to show the first input
    setCurrent(1);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setInputError("");
  }, []);

  const validate = useCallback((msg: ChatMessage, value: string) => {
    if (msg.validation?.required && !value) return "This field is required.";
    if (msg.validation?.minLength && value.length < msg.validation.minLength)
      return (
        msg.validation.errorMessage ||
        `Minimum ${msg.validation.minLength} characters.`
      );
    if (msg.validation?.maxLength && value.length > msg.validation.maxLength)
      return (
        msg.validation.errorMessage ||
        `Maximum ${msg.validation.maxLength} characters.`
      );
    if (
      msg.validation?.pattern &&
      !new RegExp(msg.validation.pattern).test(value)
    )
      return msg.validation.errorMessage || `Invalid format.`;
    return "";
  }, []);

  const handleSubmit = useCallback(
    (service: ChatService) => {
      if (editingMessageId) {
        if (input.trim()) {
          const editIdx = service.messages.findIndex(
            (m: ChatMessage) => m.id === editingMessageId
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

      const error = validate(currentMsg, input);
      if (error) {
        setInputError(error);
        return;
      }

      setAnswers((prev) => ({ ...prev, [currentMsg.id]: input }));
      setInput("");
      setInputError("");

      // Use the new advanceToNextMessage function
      const nextIndex = advanceToNextMessage(service, current);
      setCurrent(nextIndex);
    },
    [current, input, editingMessageId, validate, advanceToNextMessage]
  );

  const handleAction = useCallback(
    (label: string, service: ChatService) => {
      const currentMsg = service.messages[current];
      if (!currentMsg) return;

      if (label.toLowerCase() === "cancel" || label.toLowerCase() === "deny") {
        setChatCancelled(true);
        setAnswers((prev) => ({ ...prev, [currentMsg.id]: label }));
        setChatStarted(false);
        setShowSummary(false);
        return;
      }

      setAnswers((prev) => ({ ...prev, [currentMsg.id]: label }));

      // Use advanceToNextMessage to handle continue messages
      const nextIndex = advanceToNextMessage(service, current);
      setCurrent(nextIndex);

      setShowSummary(true);
    },
    [current, advanceToNextMessage]
  );

  const handleCloseSummary = useCallback(
    (service: ChatService) => {
      setShowSummary(false);
      if (!viewingHistory && service) {
        const firstInput = service.messages.find(
          (msg: ChatMessage) => msg.type === "input"
        );
        const firstInputAnswer = firstInput
          ? answers[firstInput.id]
          : undefined;

        const newHistory = {
          id: Date.now().toString(),
          serviceId: service.id,
          serviceTitle: service.title,
          serviceDescription: service.description,
          timestamp: new Date(),
          answers: { ...answers },
          firstInput: firstInputAnswer,
        };
        setChatHistory((prev) => [newHistory, ...prev]);
      }
      resetChat();
    },
    [viewingHistory, answers, resetChat]
  );

  const startEditing = useCallback(
    (messageId: string, currentValue: string) => {
      setEditingMessageId(messageId);
      setInput(currentValue);
    },
    []
  );

  const cancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setInput("");
  }, []);

  const viewHistory = useCallback(
    (history: ChatHistory) => {
      if (history.serviceId !== serviceId) {
        onServiceSelect(history.serviceId);
      }
      setViewingHistory(history);
      resetChat();
    },
    [serviceId, onServiceSelect, resetChat]
  );

  const startNewChat = useCallback(() => {
    setViewingHistory(null);
    resetChat();
    // Clear current chat state from localStorage
    if (userEmail) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_CHAT(userEmail));
    }
    // Keep the currently selected service instead of switching to default
    // The service will remain the same as what's currently active
  }, [resetChat, userEmail]);

  const handleServiceSelect = useCallback(
    (newServiceId: string) => {
      if (viewingHistory && viewingHistory.serviceId !== newServiceId) {
        setViewingHistory(null);
      }
      resetChat();
      onServiceSelect(newServiceId);
    },
    [viewingHistory, resetChat, onServiceSelect]
  );

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
    searchQuery,

    // Actions
    startChat,
    handleInputChange,
    handleSubmit,
    handleAction,
    handleCloseSummary,
    startEditing,
    cancelEdit,
    viewHistory,
    startNewChat,
    handleServiceSelect,
    setSearchQuery,
    clearUserData,

    // LocalStorage utilities
    saveUserPreferences,
    loadUserPreferences,
  };
};
