import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "../../../../test/test-utils";
import { useChat } from "../useChat";
import type { ChatService } from "../../../../types/chat";

// Mock all the sub-hooks
vi.mock("../useChatState", () => ({
  useChatState: () => ({
    answers: {},
    current: 0,
    input: "",
    inputError: "",
    chatStarted: false,
    showSummary: false,
    chatCancelled: false,
    editingMessageId: null,
    setAnswers: vi.fn(),
    setCurrent: vi.fn(),
    setInput: vi.fn(),
    setInputError: vi.fn(),
    setChatStarted: vi.fn(),
    setShowSummary: vi.fn(),
    setChatCancelled: vi.fn(),
    setEditingMessageId: vi.fn(),
    resetChat: vi.fn(),
    handleInputChange: vi.fn(),
  }),
}));

vi.mock("../useChatHistory", () => ({
  useChatHistory: () => ({
    viewingHistory: null,
    chatHistory: [],
    viewHistory: vi.fn(),
    exitHistoryView: vi.fn(),
    saveToHistory: vi.fn(),
  }),
}));

vi.mock("../useChatFlow", () => ({
  useChatFlow: () => ({
    startChat: vi.fn(),
    handleSubmit: vi.fn(),
    handleAction: vi.fn(),
    startEditing: vi.fn(),
    cancelEdit: vi.fn(),
  }),
}));

vi.mock("../useChatPersistence", () => ({
  useChatPersistence: () => ({
    clearPersistedState: vi.fn(),
  }),
}));

describe("useChat", () => {
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
    ],
  };

  const mockProps = {
    serviceId: "test-service",
    service: mockService,
    onServiceSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("integration with other functions", () => {
    it("should provide all expected functions", () => {
      const { result } = renderHook(() => useChat(mockProps));

      const expectedFunctions = [
        "startChat",
        "handleInputChange",
        "handleSubmit",
        "handleAction",
        "handleCloseSummary",
        "startEditing",
        "cancelEdit",
        "viewHistory",
        "startNewChat",
        "handleServiceSelect",
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

    it("should provide all expected state including chatCancelled", () => {
      const { result } = renderHook(() => useChat(mockProps));

      const expectedState = [
        "answers",
        "current",
        "input",
        "inputError",
        "chatStarted",
        "showSummary",
        "chatCancelled", // Should include this state
        "editingMessageId",
        "viewingHistory",
      ];

      expectedState.forEach((stateName) => {
        expect(result.current).toHaveProperty(stateName);
      });
    });
  });
});
