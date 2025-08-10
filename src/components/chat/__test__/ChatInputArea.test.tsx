import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInputArea } from "../ChatInputArea";
import type { ChatMessage, ChatHistory } from "../../../types/chat";
import type { ChatActionsProps } from "../ChatActions";

// Mock the child components
vi.mock("../ChatInput", () => ({
  ChatInput: ({
    message,
    value,
    error,
    onChange,
    onSubmit,
  }: {
    message: ChatMessage;
    value: string;
    error: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
  }) => (
    <div data-testid="chat-input">
      <input
        data-testid="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={message?.content}
      />
      {error && <div data-testid="input-error">{error}</div>}
      <button data-testid="submit-button" onClick={onSubmit}>
        Submit
      </button>
    </div>
  ),
}));

vi.mock("../ChatActions", () => ({
  ChatActions: ({ message, onAction }: ChatActionsProps) => (
    <div data-testid="chat-actions">
      {message?.actions?.map((action: any) => (
        <button
          key={action.label}
          data-testid={`action-${action.label}`}
          onClick={() => onAction(action.label)}
        >
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

const mockMessage: ChatMessage = {
  id: "test-message",
  content: "Test message content",
  type: "input",
};

const mockActionMessage: ChatMessage = {
  id: "action-message",
  content: "Choose an action",
  type: "action",
  actions: [
    { label: "Approve", type: "approve" },
    { label: "Deny", type: "deny" },
  ],
};

const mockHistory: ChatHistory = {
  id: "test-history",
  serviceId: "test-service",
  serviceTitle: "Test Service",
  serviceDescription: "Test Service Description",
  timestamp: new Date().toISOString() as unknown as Date,
  answers: {},
};

const defaultProps = {
  viewingHistory: null,
  chatStarted: false,
  currentMsg: null,
  answers: {},
  chatCancelled: false,
  input: "",
  inputError: "",
  editingMessageId: null,
  onInputChange: vi.fn(),
  onInputSubmit: vi.fn(),
  onAction: vi.fn(),
  onCancelEdit: vi.fn(),
  onStartNewChat: vi.fn(),
};

describe("ChatInputArea Component", () => {
  describe("Rendering Logic", () => {
    it("should return null when viewing history", () => {
      const { container } = render(
        <ChatInputArea {...defaultProps} viewingHistory={mockHistory} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("should return null when chat not started and no editing", () => {
      const { container } = render(<ChatInputArea {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it("should show cancellation message when chat is cancelled", () => {
      const { container } = render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          chatCancelled={true}
        />,
      );
      // Should show cancellation message, not return null
      expect(container.firstChild).not.toBeNull();
      expect(container.firstChild).toHaveClass(
        "border-t",
        "border-gray-200",
        "bg-white",
        "p-4",
      );
    });
  });

  describe("Chat Cancellation", () => {
    it("should show cancellation message when chat is cancelled", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          chatCancelled={true}
        />,
      );

      expect(
        screen.getByText("❌ Request has been cancelled"),
      ).toBeInTheDocument();
      expect(screen.getByText("Start New Chat")).toBeInTheDocument();
      expect(
        screen.getByTestId("new-chat-cancelled-button"),
      ).toBeInTheDocument();
    });

    it("should call onStartNewChat when new chat button is clicked", () => {
      const mockOnStartNewChat = vi.fn();
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          chatCancelled={true}
          onStartNewChat={mockOnStartNewChat}
        />,
      );

      fireEvent.click(screen.getByTestId("new-chat-cancelled-button"));
      expect(mockOnStartNewChat).toHaveBeenCalledTimes(1);
    });
  });

  describe("Input Mode", () => {
    it("should show input when chat started and current message is input type", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockMessage}
        />,
      );

      expect(screen.getByTestId("chat-input")).toBeInTheDocument();
      expect(screen.getByTestId("input-field")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("should show input error when provided", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockMessage}
          inputError="This field is required"
        />,
      );

      expect(screen.getByTestId("input-error")).toBeInTheDocument();
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should call onInputChange when input value changes", () => {
      const mockOnInputChange = vi.fn();
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockMessage}
          onInputChange={mockOnInputChange}
        />,
      );

      fireEvent.change(screen.getByTestId("input-field"), {
        target: { value: "new input value" },
      });

      expect(mockOnInputChange).toHaveBeenCalledWith("new input value");
    });

    it("should call onInputSubmit when submit button is clicked", () => {
      const mockOnInputSubmit = vi.fn();
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockMessage}
          onInputSubmit={mockOnInputSubmit}
        />,
      );

      fireEvent.click(screen.getByTestId("submit-button"));
      expect(mockOnInputSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edit Mode", () => {
    it("should show input in edit mode when editingMessageId is set", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          editingMessageId="edit-123"
        />,
      );

      expect(screen.getByTestId("chat-input")).toBeInTheDocument();
      expect(screen.getByTestId("cancel-edit-button")).toBeInTheDocument();
      expect(screen.getByText("Cancel Edit")).toBeInTheDocument();
    });

    it("should call onCancelEdit when cancel edit button is clicked", () => {
      const mockOnCancelEdit = vi.fn();
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          editingMessageId="edit-123"
          onCancelEdit={mockOnCancelEdit}
        />,
      );

      fireEvent.click(screen.getByTestId("cancel-edit-button"));
      expect(mockOnCancelEdit).toHaveBeenCalledTimes(1);
    });

    it("should show edit message content in input placeholder", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          editingMessageId="edit-123"
        />,
      );

      expect(screen.getByTestId("input-field")).toHaveAttribute(
        "placeholder",
        "Edit your answer",
      );
    });
  });

  describe("Action Mode", () => {
    it("should show actions when current message is action type", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockActionMessage}
        />,
      );

      expect(screen.getByTestId("chat-actions")).toBeInTheDocument();
      expect(screen.getByTestId("action-Approve")).toBeInTheDocument();
      expect(screen.getByTestId("action-Deny")).toBeInTheDocument();
    });

    it("should call onAction when action button is clicked", () => {
      const mockOnAction = vi.fn();
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockActionMessage}
          onAction={mockOnAction}
        />,
      );

      fireEvent.click(screen.getByTestId("action-Approve"));
      expect(mockOnAction).toHaveBeenCalledWith("Approve");

      fireEvent.click(screen.getByTestId("action-Deny"));
      expect(mockOnAction).toHaveBeenCalledWith("Deny");
    });

    it("should not show actions when answer already exists", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockActionMessage}
          answers={{ "action-message": "Approve" }}
        />,
      );

      expect(screen.queryByTestId("chat-actions")).not.toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("should prioritize edit mode over regular input mode", () => {
      render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockMessage}
          editingMessageId="edit-123"
        />,
      );

      // Should show edit mode (with cancel button) not regular input
      expect(screen.getByTestId("cancel-edit-button")).toBeInTheDocument();
      expect(screen.getByText("Cancel Edit")).toBeInTheDocument();
    });

    it("should handle multiple state changes correctly", () => {
      const { rerender } = render(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockMessage}
        />,
      );

      // Should show input
      expect(screen.getByTestId("chat-input")).toBeInTheDocument();

      // Switch to action mode
      rerender(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          currentMsg={mockActionMessage}
        />,
      );

      // Should show actions
      expect(screen.getByTestId("chat-actions")).toBeInTheDocument();

      // Switch to cancelled state
      rerender(
        <ChatInputArea
          {...defaultProps}
          chatStarted={true}
          chatCancelled={true}
        />,
      );

      // Should show cancellation message
      expect(
        screen.getByText("❌ Request has been cancelled"),
      ).toBeInTheDocument();
    });
  });
});
