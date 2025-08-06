import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadChatService } from "../services/chatService";
import type { ChatMessage } from "../types/chat";
import { ChatMessageBubble } from "./chat/ChatMessage";
import { ChatInput } from "./chat/ChatInput";
import { ChatActions } from "./chat/ChatActions";
import { ChatSummaryModal } from "./chat/ChatSummaryModal";
import { useUserStore } from "../stores/userStore";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface ChatHistory {
  id: string;
  serviceId: string;
  serviceTitle: string;
  timestamp: Date;
  answers: Record<string, string>;
}

export const Chat: React.FC = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();

  if (!serviceId) {
    return <Navigate to="/services" replace />;
  }

  const {
    data: service,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chat-service", serviceId],
    queryFn: () => loadChatService(serviceId),
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [viewingHistory, setViewingHistory] = useState<ChatHistory | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load chat history for current user
  useEffect(() => {
    if (user?.email) {
      const savedHistory = localStorage.getItem(`chat-history-${user.email}`);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          // Convert timestamp strings back to Date objects
          const historyWithDates = parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }));
          setChatHistory(historyWithDates);
        } catch (error) {
          console.error("Failed to load chat history:", error);
        }
      }
    }
  }, [user?.email]);

  // Save chat history whenever it changes
  useEffect(() => {
    if (user?.email && chatHistory.length > 0) {
      localStorage.setItem(
        `chat-history-${user.email}`,
        JSON.stringify(chatHistory)
      );
    }
  }, [chatHistory, user?.email]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-96">
          <div className="flex flex-col items-center text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Loading chat...
            </h2>
          </div>
        </div>
      </div>
    );
  if (error || !service)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 w-96">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-red-600 font-medium">
              Failed to load chat service.
            </span>
          </div>
        </div>
      </div>
    );

  const messages = viewingHistory
    ? service.messages
    : service.messages.slice(0, current + 1);
  const currentMsg = viewingHistory ? null : service.messages[current];

  const validate = (msg: ChatMessage, value: string) => {
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
  };

  const handleInputChange = (v: string) => {
    setInput(v);
    setInputError("");
  };

  const handleInputSubmit = () => {
    if (!currentMsg) return;
    if (currentMsg.type === "input") {
      const err = validate(currentMsg, input);
      if (err) return setInputError(err);
      setAnswers((a) => ({ ...a, [currentMsg.id]: input }));
      setInput("");
      setInputError("");
      let next = current + 1;
      // Handle continue messages
      while (service.messages[next]?.continue) {
        next++;
      }
      setCurrent(next);
    }
  };

  const handleAction = (label: string) => {
    if (currentMsg) {
      setAnswers((a) => ({ ...a, [currentMsg.id]: label }));
      setShowSummary(true);
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    // Save to chat history only if not viewing history
    if (!viewingHistory) {
      const newHistory: ChatHistory = {
        id: Date.now().toString(),
        serviceId,
        serviceTitle: service.title,
        timestamp: new Date(),
        answers: { ...answers },
      };
      setChatHistory((prev) => [newHistory, ...prev]);
    }
    setCurrent(0);
    setAnswers({});
    setInput("");
    setInputError("");
    setChatStarted(false);
  };

  const viewHistory = (history: ChatHistory) => {
    setViewingHistory(history);
    setSidebarOpen(false);
  };

  const startNewChat = () => {
    setViewingHistory(null);
    setCurrent(0);
    setAnswers({});
    setInput("");
    setInputError("");
    setChatStarted(false);
    setEditingMessageId(null);
    setEditValue("");
  };

  const handleStartChat = () => {
    setChatStarted(true);
    setCurrent(1); // Move to the first input/action message
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBackToServices = () => {
    navigate("/services");
  };

  const startEditing = (messageId: string, currentValue: string) => {
    setEditingMessageId(messageId);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editingMessageId && editValue.trim()) {
      setAnswers((a) => ({ ...a, [editingMessageId]: editValue }));
      setEditingMessageId(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditValue("");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Chat History</h2>
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <button
              className="w-full mb-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={startNewChat}
            >
              New Chat
            </button>

            <div className="space-y-3">
              {chatHistory.map((history) => (
                <div
                  key={history.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  onClick={() => viewHistory(history)}
                >
                  <h3 className="font-medium text-gray-900 text-sm">
                    {history.serviceTitle}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {history.timestamp.toLocaleDateString()}
                  </p>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No chat history yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <button
                onClick={handleBackToServices}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-2"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {viewingHistory
                  ? `Viewing: ${viewingHistory.serviceTitle}`
                  : service.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {viewingHistory && (
                <button
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  onClick={startNewChat}
                >
                  New Chat
                </button>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-6">
              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  answer={
                    viewingHistory
                      ? viewingHistory.answers[msg.id]
                      : answers[msg.id]
                  }
                  isEditing={editingMessageId === msg.id}
                  editValue={editValue}
                  onEditChange={setEditValue}
                  onStartEdit={() => {
                    const currentAnswer = viewingHistory
                      ? viewingHistory.answers[msg.id]
                      : answers[msg.id];
                    if (currentAnswer) {
                      startEditing(msg.id, currentAnswer);
                    }
                  }}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  canEdit={
                    !viewingHistory &&
                    (msg.type === "input" || msg.type === "action")
                  }
                />
              ))}
            </div>

            {/* Start Chat Button - shows after first text message */}
            {!viewingHistory &&
              !chatStarted &&
              current === 0 &&
              service.messages[0]?.type === "text" && (
                <div className="flex justify-center">
                  <button
                    onClick={handleStartChat}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl text-lg transform hover:scale-105"
                  >
                    Start Chat
                  </button>
                </div>
              )}

            {viewingHistory && (
              <div className="flex justify-center">
                <button
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg"
                  onClick={() => setShowSummary(true)}
                >
                  View Summary
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom input area */}
        {!viewingHistory &&
          chatStarted &&
          currentMsg &&
          currentMsg.type === "input" &&
          !answers[currentMsg.id] && (
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
                <ChatInput
                  message={currentMsg}
                  value={input}
                  error={inputError}
                  onChange={handleInputChange}
                  onSubmit={handleInputSubmit}
                />
              </div>
            </div>
          )}

        {/* Bottom action area */}
        {!viewingHistory &&
          chatStarted &&
          currentMsg &&
          currentMsg.type === "action" &&
          !answers[currentMsg.id] && (
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="max-w-4xl mx-auto">
                <ChatActions message={currentMsg} onAction={handleAction} />
              </div>
            </div>
          )}
      </div>

      <ChatSummaryModal
        open={showSummary}
        onClose={handleCloseSummary}
        messages={service.messages}
        answers={viewingHistory ? viewingHistory.answers : answers}
      />
    </div>
  );
};
