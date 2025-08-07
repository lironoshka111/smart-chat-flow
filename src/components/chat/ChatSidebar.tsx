import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listChatServices } from "../../services/chatService";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "ahooks";
import { useChatStore } from "../../stores/chatStore";
import type { ChatHistory } from "../../types/chat";

interface ChatSidebarProps {
  viewingHistory: ChatHistory | null;
  onServiceSelect: (serviceId: string) => void;
  onViewHistory: (history: ChatHistory) => void;
}

export const ChatSidebar = ({
  viewingHistory,
  onServiceSelect,
  onViewHistory,
}: ChatSidebarProps) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [servicesVisible, setServicesVisible] = useState(true);

  // Get data from stores directly - cleaner than prop drilling
  const { chatHistory, currentServiceId } = useChatStore();

  // Debounce search for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, { wait: 300 });

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["chat-services-list"],
    queryFn: listChatServices,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Simple function - no need for useCallback
  const getHistoryName = (history: ChatHistory) => {
    return history.firstInput
      ? `${history.serviceTitle} - ${history.firstInput}`
      : history.serviceTitle;
  };

  const filteredHistory = chatHistory.filter((history) =>
    getHistoryName(history)
      .toLowerCase()
      .includes(debouncedSearchQuery.toLowerCase()),
  );

  return (
    <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Smart Chat Flow
        </h2>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-600 font-medium">
              Available Services
            </p>
            <button
              onClick={() => setServicesVisible(!servicesVisible)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={servicesVisible ? "Hide services" : "Show services"}
            >
              {servicesVisible ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          {servicesVisible && (
            <div className="space-y-2">
              {servicesLoading ? (
                <div className="text-xs text-gray-500">Loading services...</div>
              ) : (
                services?.map((service) => (
                  <div
                    key={service.id}
                    className={`rounded-lg p-3 transition-all duration-200 cursor-pointer border shadow-sm hover:shadow-md ${
                      currentServiceId === service.id
                        ? "bg-blue-100 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                    }`}
                    onClick={() => onServiceSelect(service.id)}
                  >
                    <h4
                      className={`font-semibold text-sm ${
                        currentServiceId === service.id
                          ? "text-blue-900"
                          : "text-gray-900"
                      }`}
                    >
                      {service.title}
                    </h4>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        currentServiceId === service.id
                          ? "text-blue-700"
                          : "text-gray-600"
                      }`}
                    >
                      {service.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Chat History
            </h3>
            <button
              onClick={() => setSearchVisible(!searchVisible)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Search chats"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </div>

          {searchVisible && (
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 mb-4"></div>

          <div className="space-y-2">
            {filteredHistory.map((history) => (
              <div
                key={history.id}
                data-testid="chat-history-item"
                className={`rounded-lg p-3 hover:bg-gray-100 transition-all duration-200 cursor-pointer border ${
                  viewingHistory?.id === history.id
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onViewHistory(history)}
              >
                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                  {getHistoryName(history)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {history.timestamp.toLocaleDateString()}{" "}
                  {history.timestamp.toLocaleTimeString()}
                </p>
                {viewingHistory?.id === history.id && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Viewing
                    </span>
                  </div>
                )}
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {debouncedSearchQuery
                  ? "No chats found"
                  : "No chat history yet"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
