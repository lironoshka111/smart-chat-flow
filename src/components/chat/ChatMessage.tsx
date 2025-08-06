import type { ChatMessage as ChatMessageType } from "../../types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
  answer?: string;
}

export const ChatMessage = ({ message, answer }: ChatMessageProps) => {
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
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 rounded-2xl rounded-br-md px-4 py-3 max-w-xs lg:max-w-md">
          <p className="text-white font-medium text-sm mb-1">
            {message.content}
          </p>
          <p className="text-blue-100 text-sm">{answer}</p>
        </div>
      </div>
    );
  }
  return null;
};
