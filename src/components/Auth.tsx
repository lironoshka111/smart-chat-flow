import React, { useState } from "react";
import { useUserStore } from "../stores/userStore";

interface AuthForm {
  fullName: string;
  email: string;
  password: string;
}

const initialForm: AuthForm = { fullName: "", email: "", password: "" };

export const Auth: React.FC = () => {
  const { user, setUser, logout } = useUserStore();
  const [form, setForm] = useState<AuthForm>(initialForm);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"login" | "join">("login");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.fullName.trim() && mode === "join") return "Full name required.";
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/))
      return "Invalid email.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError("");
    if (mode === "join") {
      localStorage.setItem(
        `user-${form.email}`,
        JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        })
      );
      setUser({ fullName: form.fullName, email: form.email });
    } else {
      const stored = localStorage.getItem(`user-${form.email}`);
      if (!stored) return setError("User not found. Please join first.");
      const parsed = JSON.parse(stored);
      if (parsed.password !== form.password)
        return setError("Incorrect password.");
      setUser({ fullName: parsed.fullName, email: parsed.email });
    }
    setForm(initialForm);
  };

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.fullName}!
          </h2>
          <p className="text-gray-600 mb-6">You're successfully logged in.</p>
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === "login" ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="text-gray-600">
            {mode === "login"
              ? "Sign in to your account"
              : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "join" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
                placeholder="Enter your full name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-colors"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center text-red-600">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="mt-6">
            {mode === "login" ? (
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("join");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
