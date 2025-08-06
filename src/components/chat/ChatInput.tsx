import type { ChatMessage } from "../../types/chat";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ChatInputProps {
  message: ChatMessage;
  value: string;
  error: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export const ChatInput = ({
  message,
  value,
  error,
  onChange,
  onSubmit,
}: ChatInputProps) => {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-base font-medium text-gray-900 mb-2">
          {message.content}
        </h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-3"
      >
        {message.inputType === "select" ? (
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={!!message.validation?.required}
          >
            <option value="">Select an option...</option>
            {message.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={message.inputType === "date" ? "date" : "text"}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={!!message.validation?.required}
            placeholder={`Enter your ${message.inputType === "date" ? "date" : "answer"}...`}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex items-center text-red-600 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};
