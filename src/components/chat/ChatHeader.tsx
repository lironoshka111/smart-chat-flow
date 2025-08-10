import { useUserStore } from "../../stores/userStore";
import type { ChatHistory, ChatService } from "../../types/chat";
import { PlusIcon } from "@heroicons/react/24/outline";

interface ChatHeaderProps {
  viewingHistory: ChatHistory | null;
  service: ChatService | null;
  chatStarted: boolean;
  showSummary: boolean;
  chatCancelled: boolean;
  onStartNewChat: () => void;
}

export const ChatHeader = ({
  viewingHistory,
  service,
  chatStarted,
  showSummary,
  chatCancelled,
  onStartNewChat,
}: ChatHeaderProps) => {
  const { logout } = useUserStore();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {viewingHistory
                ? `Viewing: ${viewingHistory.serviceTitle}`
                : service?.title}
            </h1>
            {!viewingHistory && service && (
              <p className="text-sm text-gray-500 mt-1">
                {service.description}
              </p>
            )}
          </div>
          {!viewingHistory && (chatStarted || showSummary || chatCancelled) && (
            <button
              data-testid="new-chat-button"
              onClick={onStartNewChat}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Chat
            </button>
          )}
        </div>
        <button
          onClick={logout}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
