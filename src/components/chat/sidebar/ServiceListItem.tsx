import React from "react";
import type { ChatService } from "../../../types/chat";

type ServiceLite = Pick<ChatService, "id" | "title" | "description">;

interface ServiceListItemProps {
  service: ServiceLite;
  selected: boolean;
  onSelect: (serviceId: string) => void;
}

export const ServiceListItem: React.FC<ServiceListItemProps> = ({
  service,
  selected,
  onSelect,
}) => {
  return (
    <button
      key={service.id}
      onClick={() => onSelect(service.id)}
      className={`w-full text-left rounded-lg p-3 transition-all duration-200 border shadow-sm hover:shadow-md ${
        selected
          ? "bg-blue-100 border-blue-300 shadow-md"
          : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300"
      }`}
      aria-current={selected ? "true" : undefined}
      role="listitem"
      type="button"
    >
      <h4
        className={`font-semibold text-sm ${selected ? "text-blue-900" : "text-gray-900"}`}
      >
        {service.title}
      </h4>
      <p
        className={`text-xs mt-1 leading-relaxed ${selected ? "text-blue-700" : "text-gray-600"}`}
      >
        {service.description}
      </p>
    </button>
  );
};
