import type { ChatMessage as ChatMessageType } from "../../types/chat";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

interface ChatMessageBubbleProps {
  message: ChatMessageType;
  answer?: string;
  onStartEdit?: () => void;
  canEdit?: boolean;
}

export const ChatMessageBubble = ({
  message,
  answer,
  onStartEdit,
  canEdit = false,
}: ChatMessageBubbleProps) => {
  if (message.type === "text") {
    return (
      <div className="flex justify-start">
        <div
          data-testid="chat-message"
          className="bg-white rounded-2xl rounded-bl-md px-6 py-4 max-w-2xl shadow-sm border border-gray-100"
        >
          <p className="text-gray-800 leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.type === "input") {
    return (
      <div className="flex justify-start">
        <div
          data-testid="chat-message"
          className="bg-white rounded-2xl rounded-bl-md px-6 py-4 max-w-2xl shadow-sm border border-gray-100"
        >
          <p className="text-gray-800 leading-relaxed font-medium mb-2">
            {message.content}
          </p>
          {answer && (
            <div
              data-testid="chat-answer"
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 relative group"
            >
              <p className="text-blue-800 text-sm">{answer}</p>
              {canEdit && onStartEdit && (
                <button
                  data-testid="edit-answer-button"
                  onClick={onStartEdit}
                  className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit answer"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.type === "action" && answer) {
    return (
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl rounded-br-md px-6 py-4 max-w-2xl relative group shadow-lg">
          <p className="text-white font-medium text-sm mb-2">
            {message.content}
          </p>
          <p className="text-blue-100 text-sm leading-relaxed">{answer}</p>
          {canEdit && onStartEdit && (
            <button
              data-testid="edit-action-button"
              onClick={onStartEdit}
              className="absolute -top-2 -left-2 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit answer"
            >
              <PencilSquareIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
