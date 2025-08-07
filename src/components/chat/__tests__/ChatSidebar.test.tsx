import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "../../../test/test-utils";
import userEvent from "@testing-library/user-event";
import { ChatSidebar } from "../ChatSidebar";
import { useChatStore } from "../../../stores/chatStore";
import { mockServices } from "../../../test/mocks/chatService";
import type { ChatHistory } from "../../../types/chat";

// Mock the chat store
vi.mock("../../../stores/chatStore");
const mockUseChatStore = vi.mocked(useChatStore);

// Mock the chat service
vi.mock("../../../services/chatService", () => ({
  listChatServices: vi.fn(),
}));

// Mock useQuery hook
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

import { useQuery } from "@tanstack/react-query";
const mockUseQuery = vi.mocked(useQuery);

describe("ChatSidebar", () => {
  const mockProps = {
    viewingHistory: null,
    onServiceSelect: vi.fn(),
    onViewHistory: vi.fn(),
  };

  const mockChatHistory: ChatHistory[] = [
    {
      id: "history-1",
      serviceId: "employee-onboarding",
      serviceTitle: "Employee Onboarding",
      serviceDescription: "Onboard new employees",
      timestamp: new Date("2024-01-01T10:00:00Z"),
      answers: { name: "John Doe" },
      firstInput: "John Doe",
    },
    {
      id: "history-2",
      serviceId: "feature-request",
      serviceTitle: "Feature Request",
      serviceDescription: "Submit feature requests",
      timestamp: new Date("2024-01-02T15:30:00Z"),
      answers: { feature: "Dark mode" },
      firstInput: "Dark mode",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock chat store
    mockUseChatStore.mockReturnValue({
      chatHistory: mockChatHistory,
      currentServiceId: "employee-onboarding",
    });

    // Mock useQuery for services
    mockUseQuery.mockReturnValue({
      data: mockServices,
      isLoading: false,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      error: null,
      status: "success",
      fetchStatus: "idle",
      isSuccess: true,
      isFetching: false,
      isRefetching: false,
      isPaused: false,
      isPlaceholderData: false,
      refetch: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  describe("rendering", () => {
    it("should render sidebar with title", () => {
      render(<ChatSidebar {...mockProps} />);

      expect(screen.getByText("Smart Chat Flow")).toBeInTheDocument();
    });

    it("should render Available Services section", () => {
      render(<ChatSidebar {...mockProps} />);

      expect(screen.getByText("Available Services")).toBeInTheDocument();
    });

    it("should render Chat History section", () => {
      render(<ChatSidebar {...mockProps} />);

      expect(screen.getByText("Chat History")).toBeInTheDocument();
    });

    it("should render services when loading is false", () => {
      render(<ChatSidebar {...mockProps} />);

      mockServices.forEach((service) => {
        expect(screen.getByText(service.title)).toBeInTheDocument();
        expect(screen.getByText(service.description)).toBeInTheDocument();
      });
    });

    it("should show loading state for services", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        error: null,
        status: "pending",
        fetchStatus: "fetching",
        isSuccess: false,
        isFetching: true,
        isRefetching: false,
        isPaused: false,
        isPlaceholderData: false,
        refetch: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      render(<ChatSidebar {...mockProps} />);

      expect(screen.getByText("Loading services...")).toBeInTheDocument();
    });
  });

  describe("services toggle functionality", () => {
    it("should show services by default", () => {
      render(<ChatSidebar {...mockProps} />);

      // Services should be visible by default
      expect(screen.getByText(mockServices[0].title)).toBeInTheDocument();
    });

    it("should hide services when toggle button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Find and click the toggle button (chevron up icon)
      const toggleButton = screen.getByTitle("Hide services");
      await user.click(toggleButton);

      // Services should be hidden
      expect(screen.queryByText(mockServices[0].title)).not.toBeInTheDocument();
    });

    it("should show services again when toggle button is clicked twice", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      const toggleButton = screen.getByTitle("Hide services");

      // Hide services
      await user.click(toggleButton);
      expect(screen.queryByText(mockServices[0].title)).not.toBeInTheDocument();

      // Show services again
      const showButton = screen.getByTitle("Show services");
      await user.click(showButton);
      expect(screen.getByText(mockServices[0].title)).toBeInTheDocument();
    });

    it("should change button icon when toggling", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Initially should show "Hide services" tooltip
      expect(screen.getByTitle("Hide services")).toBeInTheDocument();

      // Click to hide
      await user.click(screen.getByTitle("Hide services"));

      // Should now show "Show services" tooltip
      expect(screen.getByTitle("Show services")).toBeInTheDocument();
      expect(screen.queryByTitle("Hide services")).not.toBeInTheDocument();
    });
  });

  describe("service selection", () => {
    it("should call onServiceSelect when service is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      const firstService = screen.getByText(mockServices[0].title);
      await user.click(firstService);

      expect(mockProps.onServiceSelect).toHaveBeenCalledWith(
        mockServices[0].id
      );
    });

    it("should highlight current service", () => {
      render(<ChatSidebar {...mockProps} />);

      // The current service should have special styling
      const currentServiceElement = screen
        .getByText("Employee Onboarding")
        .closest("div");
      expect(currentServiceElement).toHaveClass(
        "bg-blue-100",
        "border-blue-300"
      );
    });

    it("should not highlight non-current services", () => {
      render(<ChatSidebar {...mockProps} />);

      // Non-current services should have default styling
      const nonCurrentService = screen
        .getByText("Feature Request")
        .closest("div");
      expect(nonCurrentService).toHaveClass("bg-white", "border-gray-200");
    });
  });

  describe("chat history", () => {
    it("should render chat history items", () => {
      render(<ChatSidebar {...mockProps} />);

      expect(
        screen.getByText("Employee Onboarding - John Doe")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Feature Request - Dark mode")
      ).toBeInTheDocument();
    });

    it("should show timestamps for history items", () => {
      render(<ChatSidebar {...mockProps} />);

      // Check for date formatting (will depend on locale)
      expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/1\/2\/2024/)).toBeInTheDocument();
    });

    it("should call onViewHistory when history item is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      const historyItem = screen.getByText("Employee Onboarding - John Doe");
      await user.click(historyItem);

      expect(mockProps.onViewHistory).toHaveBeenCalledWith(mockChatHistory[0]);
    });

    it("should highlight viewing history item", () => {
      const propsWithViewingHistory = {
        ...mockProps,
        viewingHistory: mockChatHistory[0],
      };

      render(<ChatSidebar {...propsWithViewingHistory} />);

      const viewingItem = screen
        .getByText("Employee Onboarding - John Doe")
        .closest("div");
      expect(viewingItem).toHaveClass("bg-blue-50", "border-blue-200");
      expect(screen.getByText("Viewing")).toBeInTheDocument();
    });

    it("should show empty state when no history", () => {
      mockUseChatStore.mockReturnValue({
        chatHistory: [],
        currentServiceId: "employee-onboarding",
      });

      render(<ChatSidebar {...mockProps} />);

      expect(screen.getByText("No chat history yet")).toBeInTheDocument();
    });
  });

  describe("search functionality", () => {
    it("should toggle search input visibility", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Search input should not be visible initially
      expect(
        screen.queryByPlaceholderText("Search chats...")
      ).not.toBeInTheDocument();

      // Click search icon
      const searchButton = screen.getByTitle("Search chats");
      await user.click(searchButton);

      // Search input should now be visible
      expect(
        screen.getByPlaceholderText("Search chats...")
      ).toBeInTheDocument();
    });

    it("should filter history based on search query", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Open search
      await user.click(screen.getByTitle("Search chats"));

      // Type search query
      const searchInput = screen.getByPlaceholderText("Search chats...");
      await user.type(searchInput, "John");

      // Wait for debounced search
      await waitFor(() => {
        expect(
          screen.getByText("Employee Onboarding - John Doe")
        ).toBeInTheDocument();
        expect(
          screen.queryByText("Feature Request - Dark mode")
        ).not.toBeInTheDocument();
      });
    });

    it("should show no results message when search yields no matches", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Open search
      await user.click(screen.getByTitle("Search chats"));

      // Type search query that matches nothing
      const searchInput = screen.getByPlaceholderText("Search chats...");
      await user.type(searchInput, "nonexistent");

      // Wait for debounced search
      await waitFor(() => {
        expect(screen.getByText("No chats found")).toBeInTheDocument();
      });
    });

    it("should clear search when X button is clicked", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Open search and type
      await user.click(screen.getByTitle("Search chats"));
      const searchInput = screen.getByPlaceholderText("Search chats...");
      await user.type(searchInput, "test query");

      // Click clear button
      const clearButton = screen.getByText("×");
      await user.click(clearButton);

      // Search input should be cleared
      expect(searchInput).toHaveValue("");
    });

    it("should auto-focus search input when opened", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Click search icon
      await user.click(screen.getByTitle("Search chats"));

      // Search input should be focused
      const searchInput = screen.getByPlaceholderText("Search chats...");
      expect(searchInput).toHaveFocus();
    });
  });

  describe("history name generation", () => {
    it("should use firstInput when available", () => {
      render(<ChatSidebar {...mockProps} />);

      expect(
        screen.getByText("Employee Onboarding - John Doe")
      ).toBeInTheDocument();
    });

    it("should use only service title when no firstInput", () => {
      const historyWithoutFirstInput: ChatHistory[] = [
        {
          id: "history-3",
          serviceId: "system-access",
          serviceTitle: "System Access",
          serviceDescription: "Request system access",
          timestamp: new Date("2024-01-03T12:00:00Z"),
          answers: {},
        },
      ];

      mockUseChatStore.mockReturnValue({
        chatHistory: historyWithoutFirstInput,
        currentServiceId: "employee-onboarding",
      });

      render(<ChatSidebar {...mockProps} />);

      expect(screen.getByText("System Access")).toBeInTheDocument();
    });
  });

  describe("error states", () => {
    it("should handle missing services gracefully", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        error: null,
        status: "success",
        fetchStatus: "idle",
        isSuccess: true,
        isFetching: false,
        isRefetching: false,
        isPaused: false,
        isPlaceholderData: false,
        refetch: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      render(<ChatSidebar {...mockProps} />);

      // Should not crash and should show some default state
      expect(screen.getByText("Available Services")).toBeInTheDocument();
    });

    it("should handle services query error", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        error: new Error("Failed to fetch"),
        status: "error",
        fetchStatus: "idle",
        isSuccess: false,
        isFetching: false,
        isRefetching: false,
        isPaused: false,
        isPlaceholderData: false,
        refetch: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      render(<ChatSidebar {...mockProps} />);

      // Should not crash
      expect(screen.getByText("Available Services")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      render(<ChatSidebar {...mockProps} />);

      // Check for button roles and titles
      expect(screen.getByTitle("Hide services")).toBeInTheDocument();
      expect(screen.getByTitle("Search chats")).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ChatSidebar {...mockProps} />);

      // Tab through interactive elements - should be able to focus buttons
      await user.tab();

      // Should be able to focus on one of the interactive elements
      const focusedElement = document.activeElement;
      expect(focusedElement).not.toBe(document.body);
      expect(focusedElement?.tagName).toBe("BUTTON");
    });
  });
});
