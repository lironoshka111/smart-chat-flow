import type { ChatMessage } from "../../types/chat";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";

interface ChatInputProps {
  message: ChatMessage;
  value: string;
  error: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export const ChatInput = ({
  message,
  value,
  error,
  onChange,
  onSubmit,
  isEditing = false,
  onCancelEdit,
}: ChatInputProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isEditing ? "Edit your answer" : message.content}
        </h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4"
      >
        {message.inputType === "select" ? (
          <div className="relative">
            <Listbox value={value} onChange={onChange}>
              <Listbox.Button className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors">
                {value || "Select an option..."}
              </Listbox.Button>
              <Listbox.Options className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                {message.options?.map((opt) => (
                  <Listbox.Option key={opt} value={opt} as={Fragment}>
                    {({ active, selected }) => (
                      <li
                        className={`cursor-pointer select-none px-4 py-2 text-sm ${
                          active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                        } ${selected ? "font-semibold" : ""}`}
                      >
                        {opt}
                      </li>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
        ) : message.inputType === "date" ? (
          <input
            data-testid="chat-input"
            type="date"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={!!message.validation?.required}
          />
        ) : (
          <input
            data-testid="chat-input"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-400 transition-colors text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={!!message.validation?.required}
            placeholder="Enter your answer..."
            autoFocus
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center text-red-600 text-sm">
              <ExclamationTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            data-testid="submit-button"
            type="submit"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
          >
            {isEditing ? "Save Changes" : "Continue"}
          </button>
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
