import { useEffect } from "react";
import { ChatMessageBubble } from "./ChatMessageBubble";
import type {
  ChatMessage,
  ChatService,
  ChatHistory,
} from "../../../types/chat";
import { useScroll } from "../../hooks/useScroll";

export interface ChatMessagesProps {
  answers: Record<string, string>;
  viewingHistory: ChatHistory | null;
  chatStarted: boolean;
  current: number;
  service: ChatService | null;
  onStartChat: () => void;
  onStartEdit?: (messageId: string, currentValue: string) => void;
  canEdit?: boolean;
}

export const ChatMessages = ({
  answers,
  viewingHistory,
  chatStarted,
  current,
  service,
  onStartChat,
  onStartEdit,
  canEdit = false,
}: ChatMessagesProps) => {
  const getAnswer = (messageId: string): string | undefined => {
    return viewingHistory
      ? viewingHistory.answers[messageId]
      : answers[messageId];
  };

  const getDisplayMessages = () => {
    if (!service) return [];

    if (viewingHistory) {
      if (viewingHistory.serviceId !== service.id) return [];
      return service.messages.map((msg: ChatMessage) => ({
        ...msg,
        hasAnswer: !!viewingHistory.answers[msg.id],
      }));
    }

    return service.messages.slice(0, current + 1);
  };

  const displayMessages = getDisplayMessages();

  // Simple scroll management
  const { containerRef, scrollToBottom } = useScroll();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, scrollToBottom]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50" ref={containerRef}>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6 mb-6">
          {displayMessages.map((msg: ChatMessage & { hasAnswer?: boolean }) => (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              answer={getAnswer(msg.id)}
              onStartEdit={() => {
                const currentAnswer = getAnswer(msg.id);
                if (currentAnswer && onStartEdit) {
                  onStartEdit(msg.id, currentAnswer);
                }
              }}
              canEdit={
                canEdit &&
                !viewingHistory &&
                (msg.type === "input" || msg.type === "action") &&
                !!getAnswer(msg.id)
              }
            />
          ))}
        </div>

        {!viewingHistory &&
          !chatStarted &&
          current === 0 &&
          service?.messages[0]?.type === "text" && (
            <div className="flex justify-center py-8">
              <button
                data-testid="start-chat-button"
                onClick={onStartChat}
                className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl text-lg transform hover:scale-105"
              >
                Start Chat
              </button>
            </div>
          )}
      </div>
    </div>
  );
};
