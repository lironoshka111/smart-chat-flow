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
    <form
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-gray-900 mb-2">
          {message.content}
        </label>
        {message.inputType === "select" ? (
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={!!message.validation?.required}
            placeholder={`Enter your ${message.inputType === "date" ? "date" : "answer"}...`}
          />
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center text-red-600">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Continue
        </button>
      </div>
    </form>
  );
};
