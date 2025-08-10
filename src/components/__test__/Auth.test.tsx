// tests/Auth.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { Auth, type StoredUser } from "../Auth";

// -------------------- Mocks --------------------

// Capture setUser calls
const setUserMock = vi.fn();

// Mock Zustand user store
vi.mock("../src/stores/userStore", () => ({
  useUserStore: (
    selector: (state: { setUser: (user: StoredUser) => void }) => void,
  ) =>
    selector({
      setUser: setUserMock,
    }),
}));

// In‑memory DB to simulate ahooks useLocalStorageState
let memDB: Record<
  string,
  { fullName: string; email: string; passwordHash: string }
>;
let setUserDataSpy: ReturnType<typeof vi.fn>;

// Mock ahooks: only override useLocalStorageState
vi.mock("ahooks", async (importOriginal) => {
  const actual = (await importOriginal()) ?? {};
  return {
    ...actual,
    useLocalStorageState: vi.fn(() => [memDB, setUserDataSpy]),
  };
});

// Mock bcryptjs to be deterministic and fast
// - genSalt: returns a dummy salt
// - hash: returns "hash:" + password
// - compare: returns true if storedHash === "hash:" + input
vi.mock("bcryptjs", () => {
  return {
    default: {
      genSalt: vi.fn(async () => "salt"),
      hash: vi.fn(async (pwd: string) => `hash:${pwd}`),
      compare: vi.fn(
        async (pwd: string, stored: string) => stored === `hash:${pwd}`,
      ),
    },
  };
});

// -------------------- Helpers --------------------

function goJoin() {
  fireEvent.click(screen.getByText("Don't have an account? Join"));
}

function fill(el: HTMLElement, value: string) {
  fireEvent.change(el, { target: { value } });
}

// -------------------- Tests --------------------

describe("Auth Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    memDB = {}; // start with empty "storage"
    setUserDataSpy = vi.fn((next: Record<string, StoredUser>) => {
      // mimic ahooks setUserData(newValueObject)
      memDB = next;
    });
  });

  describe("Login Mode", () => {
    it("renders login form by default", () => {
      render(<Auth />);
      expect(screen.getByText("Smart Chat Flow")).toBeInTheDocument();
      expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByText("Sign In")).toBeInTheDocument();
      expect(
        screen.getByText("Don't have an account? Join"),
      ).toBeInTheDocument();
    });

    it("shows validation error for short password", async () => {
      render(<Auth />);
      fill(screen.getByLabelText("Email"), "test@example.com");
      fill(screen.getByLabelText("Password"), "123");
      fireEvent.click(screen.getByText("Sign In"));
      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 6 characters."),
        ).toBeInTheDocument();
      });
      expect(setUserMock).not.toHaveBeenCalled();
    });

    it("shows error for non-existent user", async () => {
      render(<Auth />);
      fill(screen.getByLabelText("Email"), "nobody@example.com");
      fill(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByText("Sign In"));
      await waitFor(() => {
        expect(
          screen.getByText("User not found. Please join first."),
        ).toBeInTheDocument();
      });
      expect(setUserMock).not.toHaveBeenCalled();
    });
  });

  describe("Join Mode", () => {
    it("switches to join mode", () => {
      render(<Auth />);
      goJoin();
      expect(screen.getByText("Create an account")).toBeInTheDocument();
      expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
      expect(screen.getByText("Join")).toBeInTheDocument();
      expect(
        screen.getByText("Already have an account? Sign In"),
      ).toBeInTheDocument();
    });

    it("validates missing full name", async () => {
      render(<Auth />);
      goJoin();
      fill(screen.getByLabelText("Email"), "test@example.com");
      fill(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByText("Join"));
      await waitFor(() => {
        expect(screen.getByText("Full name required.")).toBeInTheDocument();
      });
      expect(setUserDataSpy).not.toHaveBeenCalled();
      expect(setUserMock).not.toHaveBeenCalled();
    });

    it("validates missing/short password", async () => {
      render(<Auth />);
      goJoin();
      fill(screen.getByLabelText("Full Name"), "John Doe");
      fill(screen.getByLabelText("Email"), "test@example.com");
      // Leave password empty or too short
      fireEvent.click(screen.getByText("Join"));
      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 6 characters."),
        ).toBeInTheDocument();
      });
      expect(setUserDataSpy).not.toHaveBeenCalled();
      expect(setUserMock).not.toHaveBeenCalled();
    });

    it("blocks join when email already exists", async () => {
      // Preload existing user
      memDB = {
        "ada@example.com": {
          fullName: "Ada Lovelace",
          email: "ada@example.com",
          passwordHash: "hash:password123",
        },
      };
      render(<Auth />);
      goJoin();
      fill(screen.getByLabelText("Full Name"), "Someone Else");
      fill(screen.getByLabelText("Email"), "ada@example.com"); // duplicate
      fill(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByText("Join"));

      await waitFor(() => {
        expect(screen.getByText("User already exists.")).toBeInTheDocument();
      });
      // no writes / no login
      expect(setUserDataSpy).not.toHaveBeenCalled();
      expect(setUserMock).not.toHaveBeenCalled();
    });

    it("successful join stores a HASH (not plaintext) and sets user", async () => {
      render(<Auth />);
      goJoin();
      fill(screen.getByLabelText("Full Name"), "Ada Lovelace");
      fill(screen.getByLabelText("Email"), "ada@example.com");
      fill(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByText("Join"));

      await waitFor(() => {
        expect(setUserDataSpy).toHaveBeenCalledTimes(1);
        // After the write, memDB should contain hashed password
        const rec = memDB["ada@example.com"];
        expect(rec).toBeTruthy();
        expect(rec.fullName).toBe("Ada Lovelace");
        expect(rec.email).toBe("ada@example.com");
        // Our mock bcrypt creates "hash:<pwd>"
        expect(rec.passwordHash).toBe("hash:password123");
      });
    });
  });

  describe("Login after join", () => {
    it("logs in successfully with the same email/password saved previously", async () => {
      // Pre-seed as if user has joined already
      memDB = {
        "ada@example.com": {
          fullName: "Ada Lovelace",
          email: "ada@example.com",
          passwordHash: "hash:password123", // what our bcrypt mock creates
        },
      };

      render(<Auth />);
      fill(screen.getByLabelText("Email"), "ada@example.com");
      fill(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByText("Sign In"));

      // no error messages present
      expect(
        screen.queryByText("User not found. Please join first."),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Incorrect password.")).not.toBeInTheDocument();
    });

    it("shows incorrect password when compare fails", async () => {
      memDB = {
        "ada@example.com": {
          fullName: "Ada Lovelace",
          email: "ada@example.com",
          passwordHash: "hash:password123",
        },
      };

      render(<Auth />);
      fill(screen.getByLabelText("Email"), "ada@example.com");
      fill(screen.getByLabelText("Password"), "wrongpass");
      fireEvent.click(screen.getByText("Sign In"));

      await waitFor(() => {
        expect(screen.getByText("Incorrect password.")).toBeInTheDocument();
      });
      expect(setUserMock).not.toHaveBeenCalled();
    });
  });
});
