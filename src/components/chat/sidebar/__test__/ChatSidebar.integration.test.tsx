// src/components/chat/ChatSidebar.integration.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useChatStore } from "../../../../stores/chatStore";
import { ChatSidebar } from "../ChatSidebar";
import { useUserStore } from "../../../../stores/userStore";

describe("ChatSidebar integration", () => {
  beforeEach(() => {
    useUserStore.setState({
      user: {
        email: "test@example.com",
        fullName: "Test User",
      },
    });
    // Reset Zustand state
    useChatStore.setState({
      currentServiceId: "svc1",
      historyByUser: {
        "test@example.com": [
          {
            id: "1",
            serviceId: "svc1",
            serviceTitle: "Test Service",
            serviceDescription: "Desc",
            timestamp: new Date(),
            answers: {},
            firstInput: "Hello",
          },
        ],
      },
      viewingHistory: null,
    });
  });

  it("renders chat history items", () => {
    render(<ChatSidebar services={[]} onServiceSelect={() => {}} />);
    expect(screen.getByText(/Test Service/i)).toBeInTheDocument();
  });

  it("sets viewing history when item clicked", async () => {
    const user = userEvent.setup();
    render(<ChatSidebar services={[]} onServiceSelect={() => {}} />);

    await user.click(screen.getByText(/Test Service/i));

    expect(useChatStore.getState().viewingHistory?.id).toBe("1");
  });

  it("should not render history items when user is not logged in", () => {
    useUserStore.setState({
      user: null,
    });
    render(<ChatSidebar services={[]} onServiceSelect={() => {}} />);
    expect(screen.queryByText(/Test Service/i)).not.toBeInTheDocument();
  });
});
