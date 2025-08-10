// src/components/chat/ChatSidebar.tsx
import { useMemo, useState, useCallback, memo } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "ahooks";
import { useChatStore } from "../../stores/chatStore";
import { useChatHistory } from "./hooks/useChatHistory";
import type { ChatHistory, ChatService } from "../../types/chat";

type ServiceLite = Pick<ChatService, "id" | "title" | "description">;

interface ChatSidebarProps {
  services: ServiceLite[];
  onServiceSelect: (serviceId: string) => void;
}

export const ChatSidebar = memo(function ChatSidebar({
  services,
  onServiceSelect,
}: ChatSidebarProps) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [servicesVisible, setServicesVisible] = useState(true);

  // subscribe to only what we need from the store
  const currentServiceId = useChatStore((s) => s.currentServiceId);

  const { chatHistory, viewingHistory, viewHistory } = useChatHistory();

  // Debounce search for better UX + perf
  const debouncedSearchQuery = useDebounce(searchQuery, { wait: 300 });

  const getHistoryName = useCallback((history: ChatHistory) => {
    const first = (history.firstInput ?? "").trim();
    return first ? `${history.serviceTitle} - ${first}` : history.serviceTitle;
  }, []);

  // Build formatter once
  const dateTimeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  // Memoized filtering
  const filteredHistory = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    if (!q) return chatHistory;
    return chatHistory.filter((h) =>
      getHistoryName(h).toLowerCase().includes(q),
    );
  }, [chatHistory, debouncedSearchQuery, getHistoryName]);

  const onToggleServices = () => setServicesVisible((v) => !v);
  const onToggleSearch = () => setSearchVisible((v) => !v);

  return (
    <aside
      className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col"
      aria-label="Chat sidebar"
    >
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
              onClick={onToggleServices}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={servicesVisible ? "Hide services" : "Show services"}
              aria-expanded={servicesVisible}
              aria-controls="services-list"
            >
              {servicesVisible ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          {servicesVisible && (
            <div id="services-list" className="space-y-2" role="list">
              {services.length === 0 ? (
                <div className="text-xs text-gray-500">
                  No services available.
                </div>
              ) : (
                services.map((service) => {
                  const selected = currentServiceId === service.id;
                  return (
                    <button
                      key={service.id}
                      onClick={() => onServiceSelect(service.id)}
                      className={`w-full text-left rounded-lg p-3 transition-all duration-200 border shadow-sm hover:shadow-md ${
                        selected
                          ? "bg-blue-100 border-blue-300 shadow-md"
                          : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                      aria-current={selected ? "true" : undefined}
                      role="listitem"
                    >
                      <h4
                        className={`font-semibold text-sm ${selected ? "text-blue-900" : "text-gray-900"}`}
                      >
                        {service.title}
                      </h4>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          selected ? "text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {service.description}
                      </p>
                    </button>
                  );
                })
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
              onClick={onToggleSearch}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Search chats"
              aria-expanded={searchVisible}
              aria-controls="chat-search"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </div>

          {searchVisible && (
            <div id="chat-search" className="relative mb-4">
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div className="border-t border-gray-200 mb-4" />

          <div className="space-y-2" role="list" aria-label="Chat history">
            {filteredHistory.map((history) => {
              const ts =
                typeof history.timestamp === "string"
                  ? new Date(history.timestamp)
                  : history.timestamp;
              const isViewing = viewingHistory?.id === history.id;

              return (
                <button
                  key={history.id}
                  data-testid="chat-history-item"
                  className={`w-full text-left rounded-lg p-3 hover:bg-gray-100 transition-all duration-200 border ${
                    isViewing
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => viewHistory(history)}
                  aria-current={isViewing ? "true" : undefined}
                  role="listitem"
                >
                  <h3 className="font-medium text-gray-900 text-sm leading-tight">
                    {getHistoryName(history)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {dateTimeFmt.format(ts)}
                  </p>
                  {isViewing && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Viewing
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

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
    </aside>
  );
});
