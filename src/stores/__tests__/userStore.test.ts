import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUserStore, type User } from "../userStore";

// Mock zustand persist
vi.mock("zustand/middleware", () => ({
  persist: (fn: unknown) => fn,
}));

describe("userStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.setState({
      user: null,
      userPreferences: {},
    });
  });

  describe("user authentication state", () => {
    const mockUser: User = {
      fullName: "John Doe",
      email: "john@example.com",
    };

    it("should initialize with null user", () => {
      const { user } = useUserStore.getState();
      expect(user).toBeNull();
    });

    it("should set user", () => {
      const { setUser } = useUserStore.getState();

      setUser(mockUser);

      const { user } = useUserStore.getState();
      expect(user).toEqual(mockUser);
    });

    it("should update user information", () => {
      const { setUser } = useUserStore.getState();

      // Set initial user
      setUser(mockUser);

      // Update user
      const updatedUser: User = {
        fullName: "Jane Smith",
        email: "jane@example.com",
      };
      setUser(updatedUser);

      const { user } = useUserStore.getState();
      expect(user).toEqual(updatedUser);
      expect(user?.fullName).toBe("Jane Smith");
      expect(user?.email).toBe("jane@example.com");
    });

    it("should handle user with special characters", () => {
      const { setUser } = useUserStore.getState();
      const specialUser: User = {
        fullName: "José María González-López",
        email: "josé.maría@company.co.uk",
      };

      setUser(specialUser);

      const { user } = useUserStore.getState();
      expect(user).toEqual(specialUser);
    });

    it("should handle user with empty full name", () => {
      const { setUser } = useUserStore.getState();
      const userWithEmptyName: User = {
        fullName: "",
        email: "user@example.com",
      };

      setUser(userWithEmptyName);

      const { user } = useUserStore.getState();
      expect(user?.fullName).toBe("");
      expect(user?.email).toBe("user@example.com");
    });
  });

  describe("logout functionality", () => {
    const mockUser: User = {
      fullName: "John Doe",
      email: "john@example.com",
    };

    const mockPreferences = {
      theme: "dark",
      language: "en",
      notifications: true,
    };

    it("should clear user and preferences on logout", () => {
      const { setUser, setUserPreferences, logout } = useUserStore.getState();

      // Set user and preferences
      setUser(mockUser);
      setUserPreferences(mockPreferences);

      // Verify they are set
      expect(useUserStore.getState().user).toEqual(mockUser);
      expect(useUserStore.getState().userPreferences).toEqual(mockPreferences);

      // Logout
      logout();

      // Verify they are cleared
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.userPreferences).toEqual({});
    });

    it("should handle logout when no user is set", () => {
      const { logout } = useUserStore.getState();

      // Logout without setting user first
      logout();

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.userPreferences).toEqual({});
    });

    it("should handle multiple consecutive logouts", () => {
      const { setUser, logout } = useUserStore.getState();

      setUser(mockUser);
      logout();
      logout();
      logout();

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.userPreferences).toEqual({});
    });
  });

  describe("user preferences", () => {
    it("should initialize with empty preferences", () => {
      const { userPreferences } = useUserStore.getState();
      expect(userPreferences).toEqual({});
    });

    it("should set user preferences", () => {
      const { setUserPreferences } = useUserStore.getState();
      const preferences = {
        theme: "dark",
        language: "en",
        autoSave: true,
      };

      setUserPreferences(preferences);

      const { userPreferences } = useUserStore.getState();
      expect(userPreferences).toEqual(preferences);
    });

    it("should update user preferences", () => {
      const { setUserPreferences } = useUserStore.getState();

      // Set initial preferences
      setUserPreferences({ theme: "light", language: "en" });

      // Update preferences
      setUserPreferences({ theme: "dark", language: "es", autoSave: true });

      const { userPreferences } = useUserStore.getState();
      expect(userPreferences).toEqual({
        theme: "dark",
        language: "es",
        autoSave: true,
      });
    });

    it("should clear user preferences", () => {
      const { setUserPreferences, clearUserPreferences } =
        useUserStore.getState();

      // Set preferences first
      setUserPreferences({ theme: "dark", notifications: false });
      expect(useUserStore.getState().userPreferences).not.toEqual({});

      // Clear preferences
      clearUserPreferences();

      const { userPreferences } = useUserStore.getState();
      expect(userPreferences).toEqual({});
    });

    it("should handle complex preference objects", () => {
      const { setUserPreferences } = useUserStore.getState();
      const complexPreferences = {
        ui: {
          theme: "dark",
          sidebarWidth: 300,
          showTips: true,
        },
        notifications: {
          email: true,
          push: false,
          frequency: "daily",
        },
        features: ["feature1", "feature2"],
        lastLogin: new Date().toISOString(),
      };

      setUserPreferences(complexPreferences);

      const { userPreferences } = useUserStore.getState();
      expect(userPreferences).toEqual(complexPreferences);
    });

    it("should handle null and undefined values in preferences", () => {
      const { setUserPreferences } = useUserStore.getState();
      const preferencesWithNulls = {
        theme: null,
        language: undefined,
        autoSave: false,
        lastBackup: null,
      };

      setUserPreferences(preferencesWithNulls);

      const { userPreferences } = useUserStore.getState();
      expect(userPreferences).toEqual(preferencesWithNulls);
    });
  });

  describe("store integration", () => {
    it("should handle complete user session workflow", () => {
      const store = useUserStore.getState();
      const user: User = {
        fullName: "Alice Johnson",
        email: "alice@company.com",
      };

      // User logs in
      store.setUser(user);
      expect(useUserStore.getState().user).toEqual(user);

      // User sets preferences
      store.setUserPreferences({
        theme: "dark",
        language: "en",
        notifications: true,
      });

      // User updates preferences
      store.setUserPreferences({
        theme: "light",
        language: "fr",
        notifications: false,
        autoSave: true,
      });

      // Verify state before logout
      let currentState = useUserStore.getState();
      expect(currentState.user).toEqual(user);
      expect(currentState.userPreferences.theme).toBe("light");
      expect(currentState.userPreferences.language).toBe("fr");

      // User logs out
      store.logout();

      // Verify clean state
      currentState = useUserStore.getState();
      expect(currentState.user).toBeNull();
      expect(currentState.userPreferences).toEqual({});
    });

    it("should maintain preference independence from user state", () => {
      const store = useUserStore.getState();

      // Set preferences without user
      store.setUserPreferences({ theme: "dark" });
      expect(useUserStore.getState().userPreferences.theme).toBe("dark");
      expect(useUserStore.getState().user).toBeNull();

      // Set user
      store.setUser({ fullName: "Test User", email: "test@test.com" });
      expect(useUserStore.getState().user).not.toBeNull();
      expect(useUserStore.getState().userPreferences.theme).toBe("dark");

      // Clear preferences independently
      store.clearUserPreferences();
      expect(useUserStore.getState().userPreferences).toEqual({});
      expect(useUserStore.getState().user).not.toBeNull();
    });
  });
});
