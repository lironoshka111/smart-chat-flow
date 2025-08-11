import React, { useMemo } from "react";
import type { ChatHistory } from "../../../types/chat";

interface ChatHistoryListItemProps {
  history: ChatHistory;
  isViewing: boolean;
  onClick: (history: ChatHistory) => void;
}

export const ChatHistoryListItem: React.FC<ChatHistoryListItemProps> = ({
  history,
  isViewing,
  onClick,
}) => {
  const ts = useMemo(
    () =>
      typeof history.timestamp === "string"
        ? new Date(history.timestamp)
        : history.timestamp,
    [history.timestamp],
  );
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

  return (
    <button
      key={history.id}
      data-testid="chat-history-item"
      className={`w-full text-left rounded-lg p-3 hover:bg-gray-100 transition-all duration-200 border ${
        isViewing
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-gray-50 border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onClick(history)}
      aria-current={isViewing ? "true" : undefined}
      role="listitem"
      type="button"
    >
      <h3 className="font-medium text-gray-900 text-sm leading-tight">
        {history.firstInput
          ? `${history.serviceTitle} - ${history.firstInput}`
          : history.serviceTitle}
      </h3>
      <p className="text-xs text-gray-500 mt-1">{dateTimeFmt.format(ts)}</p>
      {isViewing && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Viewing
          </span>
        </div>
      )}
    </button>
  );
};
