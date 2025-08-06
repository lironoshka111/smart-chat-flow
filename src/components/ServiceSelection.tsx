import React from "react";
import { useQuery } from "@tanstack/react-query";
import { listChatServices } from "../services/chatService";
import { useUserStore } from "../stores/userStore";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { ErrorMessage } from "./ui/ErrorMessage";

interface ServiceSelectionProps {
  onServiceSelect: (serviceId: string) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  onServiceSelect,
}) => {
  const { user, logout } = useUserStore();

  const {
    data: services,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chat-services-list"],
    queryFn: listChatServices,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading services..." />;
  }

  if (error) {
    return (
      <ErrorMessage title="Failed to load services" message={error.message} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Chat Flow
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome back, {user?.email}! Choose a service to get started with
            your request.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <div
              key={service.id}
              data-testid={`service-${service.id}`}
              onClick={() => onServiceSelect(service.id)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-gray-200 hover:border-blue-300 group"
            >
              <div className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6 group-hover:from-blue-600 group-hover:to-indigo-700 transition-all duration-300">
                  <span className="text-white font-bold text-lg">
                    {service.title.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-6">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-md hover:shadow-lg">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
