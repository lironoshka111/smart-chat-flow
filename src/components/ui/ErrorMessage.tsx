import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading the content.",
  onRetry,
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-96">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
