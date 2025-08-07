import React, { useState } from "react";
import { useUserStore } from "../stores/userStore";
import { useLocalStorageState, useUpdateEffect } from "ahooks";

interface AuthForm {
  fullName: string;
  email: string;
  password: string;
}

const initialForm: AuthForm = { fullName: "", email: "", password: "" };

export const Auth = () => {
  const { setUser } = useUserStore();
  const [form, setForm] = useState<AuthForm>(initialForm);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<"login" | "join">("login");

  // Store user data with ahooks localStorage
  const [userData, setUserData] = useLocalStorageState<
    Record<
      string,
      {
        fullName: string;
        email: string;
        password: string;
      }
    >
  >("user-data", {
    defaultValue: {},
    serializer: (value) => JSON.stringify(value),
    deserializer: (value) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        return {};
      }
    },
  });

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
    if (err) {
      return setError(err);
    }
    setError("");
    if (mode === "join") {
      const newUserData = {
        ...userData,
        [form.email]: {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        },
      };
      setUserData(newUserData);
      setUser({ fullName: form.fullName, email: form.email });
    } else {
      const userInfo = userData[form.email];
      if (!userInfo) {
        return setError("User not found. Please join first.");
      }
      if (userInfo.password !== form.password) {
        return setError("Incorrect password.");
      }
      setUser({ fullName: userInfo.fullName, email: userInfo.email });
    }
    setForm(initialForm);
  };

  // Clear error when form changes
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
          <p className="text-gray-600">
            {mode === "login" ? "Welcome back!" : "Join us today!"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "join" && (
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
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
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
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
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            {mode === "login" ? "Sign In" : "Join"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "join" : "login")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
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
