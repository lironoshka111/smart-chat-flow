import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  fullName: string;
  email: string;
}

interface UserStore {
  // User authentication state
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;

  // User preferences
  userPreferences: Record<string, unknown>;
  setUserPreferences: (preferences: Record<string, unknown>) => void;
  clearUserPreferences: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // User authentication state
      user: null,
      setUser: (user: User) => set({ user }),
      logout: () =>
        set({
          user: null,
          userPreferences: {},
        }),

      // User preferences
      userPreferences: {},
      setUserPreferences: (preferences: Record<string, unknown>) =>
        set({ userPreferences: preferences }),
      clearUserPreferences: () => set({ userPreferences: {} }),
    }),
    {
      name: "smart-chat-user",
      partialize: (state) => ({
        user: state.user,
        userPreferences: state.userPreferences,
      }),
    },
  ),
);
