import { ChatInput } from "./ChatInput";
import { ChatActions } from "./ChatActions";
import type { ChatMessage, ChatHistory } from "../../types/chat";

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
                Cancel
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
