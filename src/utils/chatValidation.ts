import type { ChatMessage } from "../types/chat";

/**
 * Validates user input against message validation rules
 */
export const validateChatInput = (msg: ChatMessage, value: string): string => {
  const { validation } = msg;
  if (!validation) return "";

  if (validation.required && !value.trim()) {
    return validation.requiredMessage || "This field is required.";
  }

  if (validation.minLength && value.length < validation.minLength) {
    return (
      validation.errorMessage ||
      `Must be at least ${validation.minLength} characters long.`
    );
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    return (
      validation.errorMessage ||
      `Must be no more than ${validation.maxLength} characters long.`
    );
  }

  if (validation.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return validation.errorMessage || "Please enter a valid email address.";
    }
  }

  if (validation.type === "phone" && value) {
    const cleanPhone = value.replace(/[\s\-().]/g, "");
    const phoneRegex = /^\+?[1-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return validation.errorMessage || "Please enter a valid phone number.";
    }
  }

  if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
    return validation.errorMessage || "Please enter a valid value.";
  }

  return "";
};

/**
 * Advances to the next non-continue message
 */
export const getNextMessageIndex = (
  messages: ChatMessage[],
  currentIndex: number,
): number => {
  // Handle edge cases
  if (messages.length === 0) {
    return currentIndex;
  }

  if (currentIndex >= messages.length) {
    return currentIndex;
  }

  if (currentIndex < 0) {
    return currentIndex;
  }

  // If this is the last message, return current index
  if (currentIndex === messages.length - 1) {
    return currentIndex;
  }

  // Simply return the next index
  return currentIndex + 1;
};
