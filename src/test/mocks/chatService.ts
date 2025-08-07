import { vi } from "vitest";
import type { ChatService } from "../../types/chat";

export const mockChatService: ChatService = {
  id: "test-service",
  title: "Test Service",
  description: "A test service for testing",
  messages: [
    {
      id: "welcome",
      type: "text",
      content: "Welcome to the test service!",
    },
    {
      id: "name",
      type: "input",
      content: "What is your name?",
      inputType: "text",
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      id: "confirm",
      type: "action",
      content: "Please confirm your details.",
      actions: [
        { type: "approve", label: "Confirm" },
        { type: "deny", label: "Cancel" },
      ],
    },
  ],
};

export const mockServices: ChatService[] = [
  mockChatService,
  {
    id: "employee-onboarding",
    title: "Employee Onboarding",
    description: "New employee onboarding process",
    messages: [],
  },
  {
    id: "feature-request",
    title: "Feature Request",
    description: "Submit a new feature request",
    messages: [],
  },
];

// Mock functions with default implementations
export const mockLoadChatService = vi.fn().mockResolvedValue(mockChatService);
export const mockListChatServices = vi.fn().mockResolvedValue(mockServices);
