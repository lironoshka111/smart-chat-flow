import React from "react";
import { useQuery } from "@tanstack/react-query";
import { loadChatService } from "../services/chatService";
import { useUserStore } from "../stores/userStore";
import { useChat } from "./chat/hooks/useChat";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatInputArea } from "./chat/ChatInputArea";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatSummaryModal } from "./chat/ChatSummaryModal";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorMessage } from "./ui/ErrorMessage";

interface ChatProps {
  serviceId: string;
  onServiceSelect: (serviceId: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ serviceId, onServiceSelect }) => {
  const { user, logout } = useUserStore();

  const {
    data: service,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chat-service", serviceId],
    queryFn: () => loadChatService(serviceId),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
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
  } = useChat({
    userEmail: user?.email,
    serviceId,
    service,
    onServiceSelect,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading chat service..." />;
  }

  if (error || !service) {
    return (
      <ErrorMessage
        title="Failed to load chat service"
        message={error?.message}
      />
    );
  }

  const currentMsg = viewingHistory ? null : service.messages[current];

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        chatHistory={chatHistory}
        viewingHistory={viewingHistory}
        searchQuery={searchQuery}
        currentServiceId={serviceId}
        onServiceSelect={handleServiceSelect}
        onViewHistory={viewHistory}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          viewingHistory={viewingHistory}
          service={service}
          chatStarted={chatStarted}
          showSummary={showSummary}
          chatCancelled={chatCancelled}
          onStartNewChat={startNewChat}
          onLogout={logout}
        />

        <ChatMessages
          answers={answers}
          viewingHistory={viewingHistory}
          chatStarted={chatStarted}
          current={current}
          service={service}
          onStartChat={startChat}
          onStartEdit={startEditing}
          canEdit={!viewingHistory}
        />

        <ChatInputArea
          viewingHistory={viewingHistory}
          chatStarted={chatStarted}
          currentMsg={currentMsg}
          answers={answers}
          chatCancelled={chatCancelled}
          input={input}
          inputError={inputError}
          editingMessageId={editingMessageId}
          onInputChange={handleInputChange}
          onInputSubmit={() => handleSubmit(service)}
          onAction={(label) => handleAction(label, service)}
          onCancelEdit={cancelEdit}
        />
      </div>

      <ChatSummaryModal
        open={showSummary}
        onClose={() => handleCloseSummary(service)}
        messages={service.messages}
        answers={viewingHistory ? viewingHistory.answers : answers}
      />
    </div>
  );
};
