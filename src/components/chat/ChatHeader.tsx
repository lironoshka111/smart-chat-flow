import React from "react";

interface ChatHistory {
  id: string;
  serviceId: string;
  serviceTitle: string;
  serviceDescription: string;
  timestamp: Date;
  answers: Record<string, string>;
  firstInput?: string;
}

interface ChatMessage {
  id: string;
  type: "text" | "input" | "action";
  content: string;
  continue?: boolean;
  inputType?: "text" | "select" | "date";
  options?: string[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    errorMessage?: string;
  };
  actions?: {
    type: "approve" | "deny";
    label: string;
  }[];
}

interface ChatService {
  id: string;
  title: string;
  description: string;
  messages: ChatMessage[];
}

interface ChatHeaderProps {
  viewingHistory: ChatHistory | null;
  service: ChatService | null;
  chatStarted: boolean;
  showSummary: boolean;
  chatCancelled: boolean;
  onStartNewChat: () => void;
  onLogout: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  viewingHistory,
  service,
  chatStarted,
  showSummary,
  chatCancelled,
  onStartNewChat,
  onLogout,
}) => {
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
          {!viewingHistory && chatStarted && !showSummary && !chatCancelled && (
            <button
              data-testid="new-chat-button"
              onClick={onStartNewChat}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Chat
            </button>
          )}
        </div>
        <button
          onClick={onLogout}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};
