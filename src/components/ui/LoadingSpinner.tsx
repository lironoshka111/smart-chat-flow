import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-96">
        <div className="flex flex-col items-center text-center">
          <div
            className={`animate-spin rounded-full border-b-2 border-blue-600 mb-4 ${sizeClasses[size]}`}
          ></div>
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
        </div>
      </div>
    </div>
  );
};
