import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  fullName: string;
  email: string;
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "smart-chat-user",
    }
  )
);
