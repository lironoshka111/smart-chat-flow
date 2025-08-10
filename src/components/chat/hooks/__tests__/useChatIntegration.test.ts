import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "../../../../test/test-utils";
import { useChat } from "../useChat";
import type { ChatService, ChatHistory } from "../../../../types/chat";

describe("useChat Integration Tests", () => {
  const mockService: ChatService = {
    id: "employee-onboarding",
    title: "Employee Onboarding",
    description: "Onboard new employees",
    messages: [
      {
        id: "welcome",
        type: "text",
        content: "Welcome to employee onboarding!",
      },
      {
        id: "name",
        type: "input",
        content: "What is your name?",
        inputType: "text",
        validation: {
          required: true,
        },
      },
    ],
  };

  const mockChatHistory: ChatHistory = {
    id: "history-1",
    serviceId: "employee-onboarding",
    serviceTitle: "Employee Onboarding",
    serviceDescription: "Onboard new employees",
    timestamp: new Date("2024-01-01T10:00:00Z"),
    answers: { name: "John Doe" },
    firstInput: "John Doe",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("service selection while viewing history", () => {
    it("should reset chat state and exit history view when selecting different service", () => {
      const { result } = renderHook(() =>
        useChat({
          service: mockService,
        }),
      );

      // First, simulate viewing a chat history
      act(() => {
        result.current.viewHistory(mockChatHistory);
      });

      // Verify we're viewing history
      expect(result.current.viewingHistory).toBe(mockChatHistory);

      // Now simulate selecting a different service
      act(() => {
        result.current.handleServiceSelect("feature-request");
      });

      // Should reset chat state and exit history view
      expect(result.current.viewingHistory).toBe(null);
      expect(result.current.chatStarted).toBe(false);
      expect(result.current.current).toBe(0);
      expect(result.current.answers).toEqual({});
      expect(result.current.input).toBe("");
    });

    it("should reset chat state and exit history view when selecting same service while viewing history", () => {
      const { result } = renderHook(() =>
        useChat({
          service: mockService,
        }),
      );

      // Start a chat first to simulate having chat state
      act(() => {
        result.current.startChat();
      });

      // Verify chat is started
      expect(result.current.chatStarted).toBe(true);

      // Simulate viewing a chat history
      act(() => {
        result.current.viewHistory(mockChatHistory);
      });

      // Verify we're viewing history
      expect(result.current.viewingHistory).toBe(mockChatHistory);

      // Now simulate starting a new chat while viewing history
      // This should reset to start chat screen
      act(() => {
        result.current.startNewChat();
      });

      // Should exit history view
      expect(result.current.viewingHistory).toBe(null);

      // Should reset chat state to initial state (this should show start chat screen)
      expect(result.current.chatStarted).toBe(false);
      expect(result.current.current).toBe(0);
      expect(result.current.answers).toEqual({});
      expect(result.current.input).toBe("");
    });

    it("should properly reset from history to start chat screen state", () => {
      const { result } = renderHook(() =>
        useChat({
          service: mockService,
        }),
      );

      // Simulate viewing chat history (with some answers)
      act(() => {
        result.current.viewHistory(mockChatHistory);
      });

      // Verify we're in history view state
      expect(result.current.viewingHistory).toBe(mockChatHistory);
      expect(result.current.chatStarted).toBe(false); // History view doesn't start chat

      // Click on the same service to go back to start chat screen
      act(() => {
        result.current.startNewChat();
      });

      // Should be in the exact state needed for start chat screen to show
      expect(result.current.viewingHistory).toBe(null);
      expect(result.current.chatStarted).toBe(false);
      expect(result.current.current).toBe(0);
      expect(result.current.showSummary).toBe(false);
      expect(result.current.chatCancelled).toBe(false);

      // These conditions match ChatMessages.tsx lines 84-87 for showing start chat button:
      // !viewingHistory && !chatStarted && current === 0 && service?.messages[0]?.type === "text"
    });

    it("should start completely fresh after completing a chat and selecting service again", () => {
      const { result } = renderHook(() =>
        useChat({
          service: mockService,
        }),
      );

      // Simulate completing a chat workflow
      act(() => {
        result.current.startChat();
      });

      // Simulate having some answers (completed chat)
      act(() => {
        // This would normally happen through the chat flow
        result.current.handleInputChange("John Doe");
        result.current.handleSubmit();
      });

      // Now user clicks on the same service again to start fresh
      act(() => {
        result.current.startNewChat();
      });

      // Should be completely reset to initial state for fresh start
      expect(result.current.viewingHistory).toBe(null);
      expect(result.current.chatStarted).toBe(false);
      expect(result.current.current).toBe(0);
      expect(result.current.answers).toEqual({});
      expect(result.current.input).toBe("");
      expect(result.current.showSummary).toBe(false);
      expect(result.current.chatCancelled).toBe(false);
      expect(result.current.editingMessageId).toBe(null);

      // User should see fresh start chat screen, not previous conversation
    });
  });
});
