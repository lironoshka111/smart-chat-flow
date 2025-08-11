import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listChatServices } from "../../services/chatService";
import { useChatStore } from "../../stores/chatStore";
import { useChatFlow } from "./hooks/useChatFlow";
import { useChatHistory } from "./hooks/useChatHistory";

import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./messages/ChatMessages";
import { ChatInputArea } from "./input/ChatInputArea";
import { ChatSummaryModal } from "./ChatSummaryModal";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import type { ChatMessage, ServiceLite } from "../../types/chat";
import { ChatSidebar } from "./sidebar/ChatSidebar";

export const Chat = () => {
  // 1) Load services metadata
  const {
    data: services,
    isLoading: listLoading,
    isError: listError,
    error: listErr,
  } = useQuery<ServiceLite[]>({
    queryKey: ["chat-services-list"],
    queryFn: listChatServices,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Select current service id; set default when list arrives
  const currentServiceId = useChatStore((s) => s.currentServiceId);
  const setCurrentServiceId = useChatStore((s) => s.setCurrentServiceId);

  useEffect(() => {
    if (!currentServiceId && services?.length) {
      setCurrentServiceId(services[0].id);
    }
  }, [currentServiceId, services, setCurrentServiceId]);

  // 2) Chat flow: service load + actions
  const {
    service,
    serviceLoading,
    serviceError,
    startChat,
    startEditing,
    cancelEdit,
    handleSubmit,
    handleAction,

    answers,
    current,
    input,
    showSummary,
    inputError,
    chatStarted,
    chatCancelled,
    editingMessageId,

    resetChat,
    setShowSummary,
    setInput,
  } = useChatFlow();

  // 3) History
  const { viewingHistory, exitHistoryView, saveToHistory } = useChatHistory();

  const currentMsg = useMemo(
    () => (!viewingHistory && service ? service.messages[current] : null),
    [viewingHistory, service, current],
  );

  const handleCloseSummary = () => {
    setShowSummary(false);
    if (!viewingHistory && service) {
      saveToHistory(service.id, service.title, service.description, answers);
    }
  };

  const startNewChat = () => {
    exitHistoryView();
    resetChat();
  };

  const handleServiceSelect = (serviceId: string) => {
    setCurrentServiceId(serviceId);
    startNewChat();
  };

  if (listLoading) {
    return <LoadingSpinner message="Loading services..." />;
  }
  if (listError || !services) {
    return (
      <ErrorMessage
        title="Failed to load services"
        message={(listErr as Error)?.message}
      />
    );
  }

  if (serviceError || (!serviceLoading && !service)) {
    return (
      <ErrorMessage
        title="Failed to load chat"
        message="Please try another service."
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar services={services} onServiceSelect={handleServiceSelect} />

      {serviceLoading ? (
        <div />
      ) : (
        <div className="flex-1 flex flex-col">
          <ChatHeader
            service={service}
            chatStarted={chatStarted}
            chatCancelled={chatCancelled}
            onStartNewChat={startNewChat}
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
            currentMsg={currentMsg as ChatMessage}
            answers={answers}
            chatCancelled={chatCancelled}
            input={input}
            inputError={inputError}
            editingMessageId={editingMessageId}
            onInputChange={setInput}
            onInputSubmit={handleSubmit}
            onAction={handleAction}
            onCancelEdit={cancelEdit}
            onStartNewChat={startNewChat}
          />
        </div>
      )}

      <ChatSummaryModal
        open={showSummary}
        onClose={handleCloseSummary}
        messages={(service?.messages || []) as ChatMessage[]}
        answers={viewingHistory ? viewingHistory.answers : answers}
      />
    </div>
  );
};
