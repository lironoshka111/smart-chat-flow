import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatHistory } from "../useChatHistory";
import { useChatStore } from "../../../../stores/chatStore";
import { useUserStore } from "../../../../stores/userStore";

// Mock the stores
vi.mock("../../../../stores/chatStore");
vi.mock("../../../../stores/userStore");

describe("useChatHistory", () => {
  const mockUser = {
    email: "test@example.com",
    name: "Test User",
  };

  const mockChatStore = {
    viewingHistory: null,
    setViewingHistory: vi.fn(),
    getHistoryForUser: vi.fn(),
    addHistoryForUser: vi.fn(),
    setCurrentServiceId: vi.fn(),
  };

  const mockUserStore = {
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mocks with proper implementation
    (useChatStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(mockChatStore),
    );

    (useUserStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => selector(mockUserStore),
    );

    // Setup default return values
    mockChatStore.getHistoryForUser.mockReturnValue([]);
  });

  describe("Chat Creation and History Integration", () => {
    it("should add new chat to history when saveToHistory is called and display it in history list", () => {
      // Setup: existing chat history
      const existingHistory = [
        {
          id: "existing-1",
          serviceId: "service-1",
          serviceTitle: "Existing Service",
          serviceDescription: "Existing service description",
          timestamp: new Date("2023-01-01"),
          answers: { "msg-1": "existing answer" },
          firstInput: "existing answer",
        },
      ];

      mockChatStore.getHistoryForUser.mockReturnValue(existingHistory);

      const { result } = renderHook(() => useChatHistory());

      // Verify initial state - existing history is shown
      expect(result.current.chatHistory).toEqual(existingHistory);
      expect(result.current.chatHistory).toHaveLength(1);

      // Act: Submit a new chat
      const newChatData = {
        serviceId: "employee-onboarding",
        serviceTitle: "Employee Onboarding",
        serviceDescription: "Complete employee onboarding process",
        answers: {
          "employee-name": "John Doe",
          "start-date": "2024-01-15",
          department: "Engineering",
        },
      };

      act(() => {
        result.current.saveToHistory(
          newChatData.serviceId,
          newChatData.serviceTitle,
          newChatData.serviceDescription,
          newChatData.answers,
        );
      });

      // Verify: addHistoryForUser was called with correct data
      expect(mockChatStore.addHistoryForUser).toHaveBeenCalledTimes(1);
      expect(mockChatStore.addHistoryForUser).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          serviceId: newChatData.serviceId,
          serviceTitle: newChatData.serviceTitle,
          serviceDescription: newChatData.serviceDescription,
          answers: newChatData.answers,
          firstInput: "John Doe", // First answer value
          id: expect.any(String),
          timestamp: expect.any(Date),
        }),
      );

      // Verify: setCurrentServiceId was called
      expect(mockChatStore.setCurrentServiceId).toHaveBeenCalledWith(
        newChatData.serviceId,
      );

      // Verify: setViewingHistory was called to show the new chat
      expect(mockChatStore.setViewingHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: newChatData.serviceId,
          serviceTitle: newChatData.serviceTitle,
          serviceDescription: newChatData.serviceDescription,
          answers: newChatData.answers,
          firstInput: "John Doe",
        }),
      );
    });

    it("should handle multiple chat submissions and maintain history order", () => {
      const { result } = renderHook(() => useChatHistory());

      // First chat submission
      const firstChat = {
        serviceId: "service-1",
        serviceTitle: "First Service",
        serviceDescription: "First service description",
        answers: { "msg-1": "first answer" },
      };

      act(() => {
        result.current.saveToHistory(
          firstChat.serviceId,
          firstChat.serviceTitle,
          firstChat.serviceDescription,
          firstChat.answers,
        );
      });

      // Second chat submission
      const secondChat = {
        serviceId: "service-2",
        serviceTitle: "Second Service",
        serviceDescription: "Second service description",
        answers: { "msg-1": "second answer" },
      };

      act(() => {
        result.current.saveToHistory(
          secondChat.serviceId,
          secondChat.serviceTitle,
          secondChat.serviceDescription,
          secondChat.answers,
        );
      });

      // Verify both chats were added
      expect(mockChatStore.addHistoryForUser).toHaveBeenCalledTimes(2);

      // Verify the order - second call should be for the second chat
      expect(mockChatStore.addHistoryForUser).toHaveBeenNthCalledWith(
        2,
        mockUser.email,
        expect.objectContaining({
          serviceId: secondChat.serviceId,
          serviceTitle: secondChat.serviceTitle,
          answers: secondChat.answers,
        }),
      );
    });

    it("should handle chat with complex answers and extract correct firstInput", () => {
      const { result } = renderHook(() => useChatHistory());

      const chatWithComplexAnswers = {
        serviceId: "complex-service",
        serviceTitle: "Complex Service",
        serviceDescription: "Service with multiple inputs",
        answers: {
          "step-1": "First step completed",
          "step-2": "Second step data",
          "step-3": "Final confirmation",
        },
      };

      act(() => {
        result.current.saveToHistory(
          chatWithComplexAnswers.serviceId,
          chatWithComplexAnswers.serviceTitle,
          chatWithComplexAnswers.serviceDescription,
          chatWithComplexAnswers.answers,
        );
      });

      // Verify firstInput is correctly extracted (first key's value)
      expect(mockChatStore.addHistoryForUser).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          firstInput: "First step completed",
          answers: chatWithComplexAnswers.answers,
        }),
      );
    });

    it("should not save to history when user is not logged in", () => {
      // Mock no user
      (useUserStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (selector) => selector({ user: null }),
      );

      const { result } = renderHook(() => useChatHistory());

      act(() => {
        result.current.saveToHistory(
          "service-id",
          "Service Title",
          "Service Description",
          { "msg-1": "answer" },
        );
      });

      // Verify no history was saved
      expect(mockChatStore.addHistoryForUser).not.toHaveBeenCalled();
      expect(mockChatStore.setViewingHistory).not.toHaveBeenCalled();
      expect(mockChatStore.setCurrentServiceId).not.toHaveBeenCalled();
    });

    it("should handle empty answers gracefully", () => {
      const { result } = renderHook(() => useChatHistory());

      act(() => {
        result.current.saveToHistory(
          "empty-service",
          "Empty Service",
          "Service with no answers",
          {},
        );
      });

      expect(mockChatStore.addHistoryForUser).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          answers: {},
          firstInput: undefined, // No answers means no firstInput
        }),
      );
    });
  });

  describe("History Navigation", () => {
    it("should set viewing history and current service when viewHistory is called", () => {
      const { result } = renderHook(() => useChatHistory());

      const historyToView = {
        id: "history-1",
        serviceId: "service-1",
        serviceTitle: "Test Service",
        serviceDescription: "Test Description",
        timestamp: new Date(),
        answers: { "msg-1": "test answer" },
        firstInput: "test answer",
      };

      act(() => {
        result.current.viewHistory(historyToView);
      });

      expect(mockChatStore.setCurrentServiceId).toHaveBeenCalledWith(
        "service-1",
      );
      expect(mockChatStore.setViewingHistory).toHaveBeenCalledWith(
        historyToView,
      );
    });

    it("should clear viewing history when exitHistoryView is called", () => {
      const { result } = renderHook(() => useChatHistory());

      act(() => {
        result.current.exitHistoryView();
      });

      expect(mockChatStore.setViewingHistory).toHaveBeenCalledWith(null);
    });
  });

  describe("Complete Chat Flow Integration Test", () => {
    it("should demonstrate complete flow: start chat -> submit answers -> save to history -> view in history", () => {
      // This test simulates the complete user journey
      const { result } = renderHook(() => useChatHistory());

      // Step 1: User submits a completed chat
      const completedChat = {
        serviceId: "employee-onboarding",
        serviceTitle: "Employee Onboarding",
        serviceDescription: "Complete the employee onboarding process",
        answers: {
          "employee-name": "Jane Smith",
          "employee-id": "EMP001",
          "start-date": "2024-02-01",
          department: "Marketing",
          manager: "John Manager",
          "equipment-request": "Laptop, Monitor",
        },
      };

      // Step 2: Save to history (this happens after chat completion)
      act(() => {
        result.current.saveToHistory(
          completedChat.serviceId,
          completedChat.serviceTitle,
          completedChat.serviceDescription,
          completedChat.answers,
        );
      });

      // Step 3: Verify the chat was added to history with all expected properties
      expect(mockChatStore.addHistoryForUser).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          id: expect.any(String),
          serviceId: completedChat.serviceId,
          serviceTitle: completedChat.serviceTitle,
          serviceDescription: completedChat.serviceDescription,
          timestamp: expect.any(Date),
          answers: completedChat.answers,
          firstInput: "Jane Smith", // First answer becomes firstInput for display
        }),
      );

      // Step 4: Verify the saved chat is immediately set as viewing history
      expect(mockChatStore.setViewingHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: completedChat.serviceId,
          serviceTitle: completedChat.serviceTitle,
          answers: completedChat.answers,
        }),
      );

      // Step 5: Verify the service is set as current
      expect(mockChatStore.setCurrentServiceId).toHaveBeenCalledWith(
        completedChat.serviceId,
      );

      // This completes the test for the user requirement:
      // "when adding new chat and submit, it show it in history"
    });
  });
});
