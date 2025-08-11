import { ChatInput } from "./ChatInput";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { ChatMessage, ChatHistory } from "../../../types/chat";
import { ChatActions } from "./ChatActions";

interface ChatInputAreaProps {
  viewingHistory: ChatHistory | null;
  chatStarted: boolean;
  currentMsg: ChatMessage | null;
  answers: Record<string, string>;
  chatCancelled: boolean;
  input: string;
  inputError: string;
  editingMessageId: string | null;
  onInputChange: (value: string) => void;
  onInputSubmit: () => void;
  onAction: (label: string) => void;
  onCancelEdit: () => void;
  onStartNewChat: () => void;
}

export const ChatInputArea = ({
  viewingHistory,
  chatStarted,
  currentMsg,
  answers,
  chatCancelled,
  input,
  inputError,
  editingMessageId,
  onInputChange,
  onInputSubmit,
  onAction,
  onCancelEdit,
  onStartNewChat,
}: ChatInputAreaProps) => {
  if (viewingHistory) return null;

  const shouldShowInput =
    chatStarted &&
    (currentMsg?.type === "input" || editingMessageId) &&
    !chatCancelled;
  const shouldShowAction =
    chatStarted &&
    currentMsg?.type === "action" &&
    !answers[currentMsg?.id] &&
    !chatCancelled;

  // Show cancelled message if chat was cancelled
  if (chatCancelled && chatStarted) {
    return (
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center space-y-3">
            <p className="text-red-600 font-medium">
              ❌ Request has been cancelled
            </p>
            <button
              data-testid="new-chat-cancelled-button"
              onClick={onStartNewChat}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Start New Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!shouldShowInput && !shouldShowAction) return null;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {shouldShowInput && (
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <ChatInput
                message={
                  editingMessageId
                    ? { id: "edit", content: "Edit your answer", type: "input" }
                    : currentMsg!
                }
                value={input}
                error={inputError}
                onChange={onInputChange}
                onSubmit={onInputSubmit}
              />
            </div>
            {editingMessageId && (
              <button
                data-testid="cancel-edit-button"
                onClick={onCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        )}
        {shouldShowAction && (
          <ChatActions message={currentMsg} onAction={onAction} />
        )}
      </div>
    </div>
  );
};
