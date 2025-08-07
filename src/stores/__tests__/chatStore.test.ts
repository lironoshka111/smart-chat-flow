import { describe, it, expect, beforeEach, vi } from "vitest";
import { useChatStore } from "../chatStore";
import type { ChatHistory } from "../../types/chat";

// Mock zustand persist
vi.mock("zustand/middleware", () => ({
  persist: (fn: unknown) => fn,
}));

describe("chatStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useChatStore.setState({
      currentServiceId: "employee-onboarding",
      chatHistory: [],
      currentChatState: null,
    });
  });

  describe("service management", () => {
    it("should initialize with default service ID", () => {
      const { currentServiceId } = useChatStore.getState();
      expect(currentServiceId).toBe("employee-onboarding");
    });

    it("should update current service ID", () => {
      const { setCurrentServiceId } = useChatStore.getState();

      setCurrentServiceId("feature-request");

      const { currentServiceId } = useChatStore.getState();
      expect(currentServiceId).toBe("feature-request");
    });

    it("should handle empty service ID", () => {
      const { setCurrentServiceId } = useChatStore.getState();

      setCurrentServiceId("");

      const { currentServiceId } = useChatStore.getState();
      expect(currentServiceId).toBe("");
    });
  });

  describe("chat history management", () => {
    const mockHistory: ChatHistory = {
      id: "test-id",
      serviceId: "employee-onboarding",
      serviceTitle: "Employee Onboarding",
      serviceDescription: "Test description",
      timestamp: new Date("2024-01-01"),
      answers: { name: "John Doe" },
      firstInput: "John Doe",
    };

    it("should initialize with empty chat history", () => {
      const { chatHistory } = useChatStore.getState();
      expect(chatHistory).toEqual([]);
    });

    it("should set chat history", () => {
      const { setChatHistory } = useChatStore.getState();
      const histories = [mockHistory];

      setChatHistory(histories);

      const { chatHistory } = useChatStore.getState();
      expect(chatHistory).toEqual(histories);
    });

    it("should add new chat history to the beginning", () => {
      const { setChatHistory, addChatHistory } = useChatStore.getState();
      const existingHistory: ChatHistory = {
        ...mockHistory,
        id: "existing-id",
        firstInput: "Existing",
      };

      // Set initial history
      setChatHistory([existingHistory]);

      // Add new history
      addChatHistory(mockHistory);

      const { chatHistory } = useChatStore.getState();
      expect(chatHistory).toHaveLength(2);
      expect(chatHistory[0]).toEqual(mockHistory); // New item first
      expect(chatHistory[1]).toEqual(existingHistory);
    });

    it("should clear chat history", () => {
      const { setChatHistory, clearChatHistory } = useChatStore.getState();

      // Set some history first
      setChatHistory([mockHistory]);
      expect(useChatStore.getState().chatHistory).toHaveLength(1);

      // Clear history
      clearChatHistory();

      const { chatHistory } = useChatStore.getState();
      expect(chatHistory).toEqual([]);
    });

    it("should handle multiple chat histories", () => {
      const { addChatHistory } = useChatStore.getState();
      const histories = [
        { ...mockHistory, id: "1", firstInput: "First" },
        { ...mockHistory, id: "2", firstInput: "Second" },
        { ...mockHistory, id: "3", firstInput: "Third" },
      ];

      // Add histories in order
      histories.forEach((history) => addChatHistory(history));

      const { chatHistory } = useChatStore.getState();
      expect(chatHistory).toHaveLength(3);
      // Should be in reverse order (latest first)
      expect(chatHistory[0].id).toBe("3");
      expect(chatHistory[1].id).toBe("2");
      expect(chatHistory[2].id).toBe("1");
    });
  });

  describe("current chat state management", () => {
    const mockChatState = {
      serviceId: "test-service",
      current: 1,
      answers: { name: "John" },
      chatStarted: true,
      timestamp: "2024-01-01T00:00:00.000Z",
    };

    it("should initialize with null current chat state", () => {
      const { currentChatState } = useChatStore.getState();
      expect(currentChatState).toBeNull();
    });

    it("should set current chat state", () => {
      const { setCurrentChatState } = useChatStore.getState();

      setCurrentChatState(mockChatState);

      const { currentChatState } = useChatStore.getState();
      expect(currentChatState).toEqual(mockChatState);
    });

    it("should clear current chat state", () => {
      const { setCurrentChatState } = useChatStore.getState();

      // Set state first
      setCurrentChatState(mockChatState);
      expect(useChatStore.getState().currentChatState).not.toBeNull();

      // Clear state
      setCurrentChatState(null);

      const { currentChatState } = useChatStore.getState();
      expect(currentChatState).toBeNull();
    });

    it("should update chat state properties", () => {
      const { setCurrentChatState } = useChatStore.getState();

      setCurrentChatState(mockChatState);

      // Update with new properties
      const updatedState = {
        ...mockChatState,
        current: 2,
        answers: { ...mockChatState.answers, email: "john@example.com" },
      };
      setCurrentChatState(updatedState);

      const { currentChatState } = useChatStore.getState();
      expect(currentChatState?.current).toBe(2);
      expect(currentChatState?.answers).toEqual({
        name: "John",
        email: "john@example.com",
      });
    });
  });

  describe("utility methods", () => {
    it("should reset all chat data", () => {
      const {
        setCurrentServiceId,
        setChatHistory,
        setCurrentChatState,
        resetAllChatData,
      } = useChatStore.getState();

      // Set some data first
      setCurrentServiceId("feature-request");
      setChatHistory([
        {
          id: "test",
          serviceId: "test",
          serviceTitle: "Test",
          serviceDescription: "Test",
          timestamp: new Date(),
          answers: {},
        },
      ]);
      setCurrentChatState({
        serviceId: "test",
        current: 1,
        answers: {},
        chatStarted: true,
        timestamp: "2024-01-01T00:00:00.000Z",
      });

      // Reset all data
      resetAllChatData();

      const state = useChatStore.getState();
      expect(state.currentServiceId).toBe("employee-onboarding");
      expect(state.chatHistory).toEqual([]);
      expect(state.currentChatState).toBeNull();
    });

    it("should maintain state consistency after reset", () => {
      const { resetAllChatData } = useChatStore.getState();

      // Reset multiple times
      resetAllChatData();
      resetAllChatData();
      resetAllChatData();

      const state = useChatStore.getState();
      expect(state.currentServiceId).toBe("employee-onboarding");
      expect(state.chatHistory).toEqual([]);
      expect(state.currentChatState).toBeNull();
    });
  });

  describe("store integration", () => {
    it("should handle complex workflow simulation", () => {
      const store = useChatStore.getState();

      // Start a new chat
      store.setCurrentServiceId("employee-onboarding");
      store.setCurrentChatState({
        serviceId: "employee-onboarding",
        current: 0,
        answers: {},
        chatStarted: true,
        timestamp: new Date().toISOString(),
      });

      // Simulate answering questions
      const updatedState = {
        serviceId: "employee-onboarding",
        current: 2,
        answers: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
        chatStarted: true,
        timestamp: new Date().toISOString(),
      };
      store.setCurrentChatState(updatedState);

      // Complete chat and save to history
      const history: ChatHistory = {
        id: "completed-chat",
        serviceId: "employee-onboarding",
        serviceTitle: "Employee Onboarding",
        serviceDescription: "New employee setup",
        timestamp: new Date(),
        answers: updatedState.answers,
        firstInput: "John",
      };
      store.addChatHistory(history);

      // Start new chat
      store.setCurrentChatState(null);
      store.setCurrentServiceId("feature-request");

      // Verify final state
      const finalState = useChatStore.getState();
      expect(finalState.currentServiceId).toBe("feature-request");
      expect(finalState.currentChatState).toBeNull();
      expect(finalState.chatHistory).toHaveLength(1);
      expect(finalState.chatHistory[0].id).toBe("completed-chat");
    });
  });
});
