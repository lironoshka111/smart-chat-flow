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

// Mock ahooks with proper mock functions
const mockUseLocalStorageState = vi.fn(() => [{}, vi.fn()]);
const mockUseUpdateEffect = vi.fn();
const mockUseDebounce = vi.fn();

vi.mock("ahooks", () => ({
  useLocalStorageState: mockUseLocalStorageState,
  useUpdateEffect: mockUseUpdateEffect,
  useDebounce: mockUseDebounce,
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
