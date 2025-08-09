interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div
        className="bg-white rounded-xl shadow-lg p-8 w-96"
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`relative mb-4 ${sizeClasses[size]}`}>
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-blue-200"></span>
            <span
              className="absolute inset-0 animate-spin rounded-full border-t-2 border-blue-600"
              style={{ animationDuration: "0.8s" }}
            ></span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{message}</h2>
        </div>
      </div>
    </div>
  );
};
