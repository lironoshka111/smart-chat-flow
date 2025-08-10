import type { ChatService } from "../types/chat";

export const loadChatService = async (
  serviceId: string,
): Promise<ChatService> => {
  const response = await fetch(`/data/${serviceId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load service: ${response.statusText}`);
  }
  return response.json();
};

export const listChatServices = async (): Promise<ChatService[]> => {
  const response = await fetch("/data/index.json");
  if (!response.ok) {
    throw new Error(`Failed to load services: ${response.statusText}`);
  }
  return response.json();
};
