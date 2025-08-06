import type { ChatMessage } from "../../types/chat";

interface ChatActionsProps {
  message: ChatMessage;
  onAction: (label: string) => void;
}

export const ChatActions = ({ message, onAction }: ChatActionsProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message.content}
          </h3>
        </div>
        <div className="flex gap-4 justify-center">
          {message.actions?.map((action) => (
            <button
              key={action.type}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
                action.type === "approve"
                  ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                  : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              }`}
              onClick={() => onAction(action.label)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
