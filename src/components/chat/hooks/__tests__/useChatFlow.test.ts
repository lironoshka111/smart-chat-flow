import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "../../../../test/test-utils";
import { useChatFlow } from "../useChatFlow";
import type { ChatService } from "../../../../types/chat";

// Mock the validation utilities
vi.mock("../../../../utils/chatValidation", () => ({
  validateChatInput: vi.fn().mockReturnValue(""),
  getNextMessageIndex: vi.fn().mockReturnValue(1),
}));

describe("useChatFlow", () => {
  const mockService: ChatService = {
    id: "test-service",
    title: "Test Service",
    description: "Test Description",
    messages: [
      {
        id: "msg1",
        type: "text",
        content: "Hello!",
      },
      {
        id: "msg2",
        type: "action",
        content: "Please confirm",
        actions: [
          { type: "approve", label: "Confirm" },
          { type: "deny", label: "Cancel" },
        ],
      },
    ],
  };

  const mockChatState = {
    current: 1,
    input: "",
    editingMessageId: null,
    chatStarted: true,
    viewingHistory: null,
  };

  const mockActions = {
    setCurrent: vi.fn(),
    setAnswers: vi.fn(),
    setInput: vi.fn(),
    setInputError: vi.fn(),
    setChatStarted: vi.fn(),
    setShowSummary: vi.fn(),
    setChatCancelled: vi.fn(),
    setEditingMessageId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cancel functionality through deny actions", () => {
    it("should cancel chat when deny action is selected", () => {
      const { result } = renderHook(() =>
        useChatFlow(mockService, mockChatState, mockActions),
      );

      act(() => {
        result.current.handleAction("Cancel");
      });

      expect(mockActions.setChatCancelled).toHaveBeenCalledWith(true);
      expect(mockActions.setInput).toHaveBeenCalledWith("");
      expect(mockActions.setInputError).toHaveBeenCalledWith("");
    });

    it("should not continue flow for deny actions", () => {
      const { result } = renderHook(() =>
        useChatFlow(mockService, mockChatState, mockActions),
      );

      act(() => {
        result.current.handleAction("Cancel");
      });

      // Should NOT call these for deny actions
      expect(mockActions.setAnswers).not.toHaveBeenCalled();
      expect(mockActions.setCurrent).not.toHaveBeenCalled();
      expect(mockActions.setShowSummary).not.toHaveBeenCalled();
    });

    it("should continue normal flow for approve actions", () => {
      const { result } = renderHook(() =>
        useChatFlow(mockService, mockChatState, mockActions),
      );

      act(() => {
        result.current.handleAction("Confirm");
      });

      // Should continue normal flow for approve actions
      expect(mockActions.setAnswers).toHaveBeenCalledWith(expect.any(Function));
      expect(mockActions.setCurrent).toHaveBeenCalled();
    });

    it("should handle missing action gracefully", () => {
      const serviceWithoutActions: ChatService = {
        ...mockService,
        messages: [
          {
            id: "msg1",
            type: "action",
            content: "Test",
            actions: [{ type: "approve", label: "OK" }],
          },
        ],
      };

      const { result } = renderHook(() =>
        useChatFlow(serviceWithoutActions, mockChatState, mockActions),
      );

      act(() => {
        result.current.handleAction("NonExistentAction");
      });

      // Should not save anything when action is not found
      expect(mockActions.setAnswers).not.toHaveBeenCalled();
    });

    it("should not handle actions for non-action messages", () => {
      const chatStateWithTextMessage = {
        ...mockChatState,
        current: 0, // Points to text message
      };

      const { result } = renderHook(() =>
        useChatFlow(mockService, chatStateWithTextMessage, mockActions),
      );

      act(() => {
        result.current.handleAction("Cancel");
      });

      // Should not call any action handlers for text messages
      expect(mockActions.setChatCancelled).not.toHaveBeenCalled();
      expect(mockActions.setAnswers).not.toHaveBeenCalled();
      expect(mockActions.setCurrent).not.toHaveBeenCalled();
    });
  });

  describe("existing functionality", () => {
    it("should provide all expected functions", () => {
      const { result } = renderHook(() =>
        useChatFlow(mockService, mockChatState, mockActions),
      );

      const expectedFunctions = [
        "startChat",
        "handleSubmit",
        "handleAction",
        "startEditing",
        "cancelEdit",
      ];

      expectedFunctions.forEach((fnName) => {
        expect(
          result.current[fnName as keyof typeof result.current],
        ).toBeDefined();
        expect(
          typeof result.current[fnName as keyof typeof result.current],
        ).toBe("function");
      });
    });
  });
});
