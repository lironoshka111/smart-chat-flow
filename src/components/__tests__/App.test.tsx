import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import App from "../../App";

// Mock the child components
vi.mock("../Auth", () => ({
  Auth: () => <div data-testid="auth-component">Auth Component</div>,
}));

vi.mock("../Chat", () => ({
  Chat: () => <div data-testid="chat-component">Chat Component</div>,
}));

// Mock the user store
vi.mock("../../stores/userStore");
import { useUserStore } from "../../stores/userStore";
const mockUseUserStore = vi.mocked(useUserStore);

describe("App", () => {
  it("should render Auth component when user is not logged in", () => {
    mockUseUserStore.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout: vi.fn(),
      userPreferences: {},
      setUserPreferences: vi.fn(),
      clearUserPreferences: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("auth-component")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-component")).not.toBeInTheDocument();
  });

  it("should render Chat component when user is logged in", () => {
    mockUseUserStore.mockReturnValue({
      user: {
        fullName: "John Doe",
        email: "john@example.com",
      },
      setUser: vi.fn(),
      logout: vi.fn(),
      userPreferences: {},
      setUserPreferences: vi.fn(),
      clearUserPreferences: vi.fn(),
    });

    render(<App />);

    expect(screen.getByTestId("chat-component")).toBeInTheDocument();
    expect(screen.queryByTestId("auth-component")).not.toBeInTheDocument();
  });

  it("should update when user state changes", () => {
    const { rerender } = render(<App />);

    // Initially no user
    mockUseUserStore.mockReturnValue({
      user: null,
      setUser: vi.fn(),
      logout: vi.fn(),
      userPreferences: {},
      setUserPreferences: vi.fn(),
      clearUserPreferences: vi.fn(),
    });

    rerender(<App />);
    expect(screen.getByTestId("auth-component")).toBeInTheDocument();

    // User logs in
    mockUseUserStore.mockReturnValue({
      user: {
        fullName: "Jane Smith",
        email: "jane@example.com",
      },
      setUser: vi.fn(),
      logout: vi.fn(),
      userPreferences: {},
      setUserPreferences: vi.fn(),
      clearUserPreferences: vi.fn(),
    });

    rerender(<App />);
    expect(screen.getByTestId("chat-component")).toBeInTheDocument();
  });
});
