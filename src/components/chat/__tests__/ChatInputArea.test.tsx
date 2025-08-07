import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { ChatInputArea } from "../ChatInputArea";
import type { ChatMessage, ChatHistory } from "../../../types/chat";

describe("ChatInputArea", () => {
  const mockProps = {
    viewingHistory: null,
    chatStarted: true,
    currentMsg: {
      id: "test-msg",
      type: "input",
      content: "What is your name?",
    } as ChatMessage,
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

  describe("cancel functionality", () => {
    it("should show cancellation message when chat is cancelled", () => {
      const cancelledProps = {
        ...mockProps,
        chatCancelled: true,
      };

      render(<ChatInputArea {...cancelledProps} />);

      expect(
        screen.getByText("❌ Request has been cancelled"),
      ).toBeInTheDocument();
    });

    it("should show cancel edit button when editing", () => {
      const editingProps = {
        ...mockProps,
        editingMessageId: "edit-msg-id",
      };

      render(<ChatInputArea {...editingProps} />);

      const cancelEditButton = screen.getByTestId("cancel-edit-button");
      expect(cancelEditButton).toBeInTheDocument();
      expect(cancelEditButton).toHaveTextContent("Cancel Edit");
    });

    it("should call onCancelEdit when cancel edit button is clicked", async () => {
      const user = userEvent.setup();
      const editingProps = {
        ...mockProps,
        editingMessageId: "edit-msg-id",
      };

      render(<ChatInputArea {...editingProps} />);

      const cancelEditButton = screen.getByTestId("cancel-edit-button");
      await user.click(cancelEditButton);

      expect(mockProps.onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it("should not show any buttons when viewing history", () => {
      const historyProps = {
        ...mockProps,
        viewingHistory: {
          id: "history-1",
          serviceId: "test-service",
          serviceTitle: "Test Service",
          serviceDescription: "Test Description",
          timestamp: new Date(),
          answers: {},
        } as ChatHistory,
      };

      const { container } = render(<ChatInputArea {...historyProps} />);
      expect(container.firstChild).toBeNull();
    });

    it("should show red styling for cancellation message", () => {
      const cancelledProps = {
        ...mockProps,
        chatCancelled: true,
      };

      render(<ChatInputArea {...cancelledProps} />);

      const messageContainer = screen
        .getByText("❌ Request has been cancelled")
        .closest("div");
      expect(messageContainer).toHaveClass("bg-red-50", "border-red-200");

      const messageText = screen.getByText("❌ Request has been cancelled");
      expect(messageText).toHaveClass("text-red-600");
    });

    it("should call onStartNewChat when new chat button is clicked after cancellation", async () => {
      const user = userEvent.setup();
      const cancelledProps = {
        ...mockProps,
        chatCancelled: true,
      };

      render(<ChatInputArea {...cancelledProps} />);

      const newChatButton = screen.getByTestId("new-chat-cancelled-button");
      await user.click(newChatButton);

      expect(mockProps.onStartNewChat).toHaveBeenCalledTimes(1);
    });

    it("should show deny action button for action messages with deny actions", () => {
      const actionProps = {
        ...mockProps,
        currentMsg: {
          id: "action-msg",
          type: "action",
          content: "Please confirm",
          actions: [
            { type: "approve", label: "Confirm" },
            { type: "deny", label: "Cancel" },
          ],
        } as ChatMessage,
      };

      render(<ChatInputArea {...actionProps} />);

      // Should show the action buttons (including the deny/cancel action)
      expect(screen.getByText("Confirm")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should call onAction when action buttons are clicked", async () => {
      const user = userEvent.setup();
      const actionProps = {
        ...mockProps,
        currentMsg: {
          id: "action-msg",
          type: "action",
          content: "Please confirm",
          actions: [
            { type: "approve", label: "Confirm" },
            { type: "deny", label: "Cancel" },
          ],
        } as ChatMessage,
      };

      render(<ChatInputArea {...actionProps} />);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockProps.onAction).toHaveBeenCalledWith("Cancel");
    });
  });

  describe("existing functionality", () => {
    it("should render input when appropriate", () => {
      render(<ChatInputArea {...mockProps} />);

      // Should show input components
      expect(screen.getByTestId("chat-input")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("should not render when no input or action needed", () => {
      const noInputProps = {
        ...mockProps,
        currentMsg: {
          id: "text-msg",
          type: "text",
          content: "Hello there!",
        } as ChatMessage,
      };

      const { container } = render(<ChatInputArea {...noInputProps} />);
      expect(container.firstChild).toBeNull();
    });

    it("should not render when chat is not started", () => {
      const notStartedProps = {
        ...mockProps,
        chatStarted: false,
      };

      const { container } = render(<ChatInputArea {...notStartedProps} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
