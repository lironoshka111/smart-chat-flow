// src/components/Auth.tsx
import { useEffect, useState } from "react";
import { useUserStore } from "../stores/userStore";
import { useLocalStorageState, useUpdateEffect } from "ahooks";
import bcrypt from "bcryptjs";

export interface AuthForm {
  fullName: string;
  email: string;
  password: string;
}

export type StoredUser = {
  fullName: string;
  email: string;
  passwordHash: string; // bcrypt hash (NO plaintext password)
};

const initialForm: AuthForm = { fullName: "", email: "", password: "" };

export const Auth = () => {
  const setUser = useUserStore((s) => s.setUser); // persists only { fullName, email }
  const [form, setForm] = useState<AuthForm>(initialForm);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"login" | "join">("login");

  useEffect(() => {
    setError("");
  }, [mode]);

  const [userData, setUserData] = useLocalStorageState<
    Record<string, StoredUser>
  >("user-data", {
    defaultValue: {},
    serializer: JSON.stringify,
    deserializer: (value) => {
      try {
        const parsed = JSON.parse(value) as Record<string, StoredUser>;
        return (parsed || {}) as Record<string, StoredUser>;
      } catch {
        return {};
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (mode === "join" && !form.fullName.trim()) return "Full name required.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return "Invalid email.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    setError("");
    setBusy(true);
    try {
      if (mode === "join") {
        if (userData && userData[form.email]) {
          throw new Error("User already exists.");
        }
        // Hash password with bcryptjs (async)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(form.password, salt);

        const next: Record<string, StoredUser> = {
          ...(userData || {}),
          [form.email]: {
            fullName: form.fullName,
            email: form.email,
            passwordHash,
          },
        };
        setUserData(next);
        setUser({ fullName: form.fullName, email: form.email });
      } else {
        const userInfo = userData?.[form.email];
        if (!userInfo) throw new Error("User not found. Please join first.");

        const ok = await bcrypt.compare(form.password, userInfo.passwordHash);
        if (!ok) throw new Error("Incorrect password.");

        setUser({ fullName: userInfo.fullName, email: userInfo.email });
      }

      setForm(initialForm);
    } catch (e) {
      console.log("err", e);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Clear error when typing
  useUpdateEffect(() => {
    setError("");
  }, [form]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Chat Flow
          </h1>
          <p className="text-gray-500 text-sm">
            {mode === "login" ? "Sign in to continue" : "Create an account"}
          </p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          {mode === "join" && (
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60"
          >
            {busy ? "Please wait..." : mode === "login" ? "Sign In" : "Join"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode((m) => (m === "login" ? "join" : "login"))}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            type="button"
          >
            {mode === "login"
              ? "Don't have an account? Join"
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
