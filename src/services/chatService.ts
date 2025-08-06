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
  const services = [
    "employee-onboarding",
    "feature-request",
    "system-access-request",
  ];

  const servicePromises = services.map(async (serviceId) => {
    try {
      const service = await loadChatService(serviceId);
      return {
        id: service.id,
        title: service.title,
        description: service.description,
      };
    } catch (error) {
      console.error(`Failed to load service ${serviceId}:`, error);
      return null;
    }
  });

  const results = await Promise.all(servicePromises);
  return results.filter((result): result is ChatService => result !== null);
};
