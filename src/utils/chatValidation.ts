import type { ChatMessage } from "../types/chat";

/**
 * Validates user input against message validation rules
 */
export const validateChatInput = (msg: ChatMessage, value: string): string => {
  const { validation } = msg;
  if (!validation) return "";

  if (validation.required && !value) {
    return "This field is required.";
  }

  if (validation.minLength && value.length < validation.minLength) {
    return (
      validation.errorMessage || `Minimum ${validation.minLength} characters.`
    );
  }

  if (validation.maxLength && value.length > validation.maxLength) {
    return (
      validation.errorMessage || `Maximum ${validation.maxLength} characters.`
    );
  }

  if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
    return validation.errorMessage || "Invalid format.";
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
  let next = currentIndex + 1;
  while (next < messages.length && messages[next]?.continue) {
    next++;
  }
  return next;
};
