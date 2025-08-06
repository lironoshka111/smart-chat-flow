import type { ChatService } from "../types/chat";

const SERVICE_FILE_MAP: Record<string, string> = {
  "feature-request": "feature-request.json",
  "system-access-request": "system-access-request.json",
  "employee-onboarding": " employee-onboarding.json",
};

export async function loadChatService(serviceId: string): Promise<ChatService> {
  const file = SERVICE_FILE_MAP[serviceId];
  if (!file) throw new Error("Unknown service");
  const res = await fetch(`/data/${file}`);
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  return res.json();
}

export async function listChatServices(): Promise<
  { id: string; title: string; description: string }[]
> {
  // Only load meta info for selection
  return Promise.all(
    Object.entries(SERVICE_FILE_MAP).map(async ([id, file]) => {
      const res = await fetch(`/data/${file}`);
      if (!res.ok) return null;
      const { title, description } = await res.json();
      return { id, title, description };
    })
  ).then(
    (arr) =>
      arr.filter(Boolean) as {
        id: string;
        title: string;
        description: string;
      }[]
  );
}
