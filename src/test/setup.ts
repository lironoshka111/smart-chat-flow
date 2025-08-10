import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// Mock bcrypt with delayed promises for testing
vi.mock("bcryptjs", () => ({
  default: {
    genSalt: vi.fn(
      () =>
        new Promise((resolve) => setTimeout(() => resolve("$2a$10$test"), 100)),
    ),
    hash: vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve("$2a$10$test.hash"), 100),
        ),
    ),
    compare: vi.fn(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
    ),
  },
}));

// Mock ahooks with proper mock functions
const mockUseLocalStorageState = vi.fn(() => [{}, vi.fn()]);
const mockUseUpdateEffect = vi.fn();

vi.mock("ahooks", () => ({
  useLocalStorageState: mockUseLocalStorageState,
  useUpdateEffect: mockUseUpdateEffect,
}));

// Export mocks for use in tests
export { mockUseLocalStorageState, mockUseUpdateEffect };

// Mock timers for useChatFlow tests
export const setupTimers = () => {
  vi.useFakeTimers();
};

export const cleanupTimers = () => {
  vi.useRealTimers();
};
