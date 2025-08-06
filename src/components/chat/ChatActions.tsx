import type { ChatMessage } from "../../types/chat";

interface ChatActionsProps {
  message: ChatMessage;
  onAction: (label: string) => void;
}

export const ChatActions = ({ message, onAction }: ChatActionsProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-base font-medium text-gray-900 mb-2">
          {message.content}
        </h3>
      </div>

      <div className="flex gap-3 justify-center">
        {message.actions?.map((action) => (
          <button
            key={action.type}
            className={`inline-flex items-center px-6 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-105 text-sm ${
              action.type === "approve"
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500"
                : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500"
            }`}
            onClick={() => onAction(action.label)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
