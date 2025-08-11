import { memo, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useDebounce } from "ahooks";
import type { ChatHistory, ChatService } from "../../../types/chat";
import { useChatHistory } from "../hooks/useChatHistory";
import { useChatStore } from "../../../stores/chatStore";
import { ChatHistoryListItem } from "./ChatHistoryListItem";
import { ServiceListItem } from "./ServiceListItem";

type ServiceLite = Pick<ChatService, "id" | "title" | "description">;

export interface ChatSidebarProps {
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

  const currentServiceId = useChatStore((s) => s.currentServiceId);

  const { chatHistory, viewingHistory, viewHistory } = useChatHistory();

  const debouncedSearchQuery = useDebounce(searchQuery, { wait: 300 });

  const getHistoryName = (history: ChatHistory) => {
    const first = (history.firstInput ?? "").trim();
    return first ? `${history.serviceTitle} - ${first}` : history.serviceTitle;
  };

  const filteredHistory = useMemo(() => {
    const q = debouncedSearchQuery?.trim().toLowerCase();
    if (!q) return chatHistory;
    return chatHistory.filter((h) =>
      getHistoryName(h).toLowerCase().includes(q),
    );
  }, [chatHistory, debouncedSearchQuery]);

  const onToggleServices = () => setServicesVisible((v) => !v);
  const onToggleSearch = () => setSearchVisible((v) => !v);

  return (
    <aside
      className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col"
      aria-label="Chat sidebar"
    >
      {/* Header & services */}
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
              type="button"
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
                services.map((service) => (
                  <ServiceListItem
                    key={service.id}
                    service={service}
                    selected={currentServiceId === service.id}
                    onSelect={onServiceSelect}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body: search + history */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Chat History
            </h3>
            <button
              type="button"
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
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
              />
              {searchQuery && (
                <button
                  type="button"
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
            {filteredHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {debouncedSearchQuery
                  ? "No chats found"
                  : "No chat history yet"}
              </div>
            ) : (
              filteredHistory.map((history) => (
                <ChatHistoryListItem
                  key={history.id}
                  history={history}
                  isViewing={viewingHistory?.id === history.id}
                  onClick={viewHistory}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
});
