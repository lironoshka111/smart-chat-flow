import type { ChatMessage as ChatMessageType } from "../../types/chat";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ChatMessageBubbleProps {
  message: ChatMessageType;
  answer?: string;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  onStartEdit?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  canEdit?: boolean;
}

export const ChatMessageBubble = ({
  message,
  answer,
  isEditing = false,
  editValue = "",
  onEditChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  canEdit = false,
}: ChatMessageBubbleProps) => {
  if (message.type === "text") {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs lg:max-w-md">
          <p className="text-gray-800">{message.content}</p>
        </div>
      </div>
    );
  }

  if ((message.type === "input" || message.type === "action") && answer) {
    if (isEditing && canEdit) {
      return (
        <div className="flex justify-end mb-4">
          <div className="bg-blue-600 rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md">
            <p className="text-white font-medium text-sm mb-2">
              {message.content}
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => onEditChange?.(e.target.value)}
                className="w-full px-2 py-1 text-sm bg-white text-gray-900 rounded border-0 focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="Edit your answer..."
              />
              <div className="flex gap-1">
                <button
                  onClick={onSaveEdit}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  <CheckIcon className="w-3 h-3 inline mr-1" />
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
                >
                  <XMarkIcon className="w-3 h-3 inline mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md relative group">
          <p className="text-white font-medium text-sm mb-1">
            {message.content}
          </p>
          <p className="text-blue-100 text-sm">{answer}</p>
          {canEdit && (
            <button
              onClick={onStartEdit}
              className="absolute -top-2 -left-2 bg-gray-600 hover:bg-gray-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit answer"
            >
              <PencilIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
