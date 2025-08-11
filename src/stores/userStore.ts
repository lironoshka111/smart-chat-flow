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
        }),
    }),
    {
      name: "smart-chat-user",
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
);
