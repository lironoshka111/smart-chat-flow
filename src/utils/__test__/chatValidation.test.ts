import { describe, it, expect } from "vitest";
import { validateChatInput, getNextMessageIndex } from "../chatValidation";
import type { ChatMessage } from "../../types/chat";

describe("Chat Validation Utilities", () => {
  describe("validateChatInput", () => {
    const baseMessage: ChatMessage = {
      id: "test-input",
      content: "Test input message",
      type: "input",
    };

    it("should return empty string for valid input with no validation rules", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: undefined,
      };

      const result = validateChatInput(message, "any input");
      expect(result).toBe("");
    });

    it("should validate required field", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { required: true },
      };

      // Empty input should fail
      expect(validateChatInput(message, "")).toBe("This field is required.");
      expect(validateChatInput(message, "   ")).toBe("This field is required.");

      // Valid input should pass
      expect(validateChatInput(message, "valid input")).toBe("");
      expect(validateChatInput(message, "  valid input  ")).toBe("");
    });

    it("should validate minimum length", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { minLength: 5 },
      };

      // Input too short should fail
      expect(validateChatInput(message, "abc")).toBe(
        "Must be at least 5 characters long.",
      );
      expect(validateChatInput(message, "abcd")).toBe(
        "Must be at least 5 characters long.",
      );

      // Valid input should pass
      expect(validateChatInput(message, "abcde")).toBe("");
      expect(validateChatInput(message, "abcdefgh")).toBe("");
    });

    it("should validate maximum length", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { maxLength: 10 },
      };

      // Input too long should fail
      expect(validateChatInput(message, "this is too long")).toBe(
        "Must be no more than 10 characters long.",
      );
      expect(validateChatInput(message, "12345678901")).toBe(
        "Must be no more than 10 characters long.",
      );

      // Valid input should pass
      expect(validateChatInput(message, "short")).toBe("");
      expect(validateChatInput(message, "1234567890")).toBe("");
    });

    it("should validate both min and max length", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { minLength: 3, maxLength: 8 },
      };

      // Input too short should fail
      expect(validateChatInput(message, "ab")).toBe(
        "Must be at least 3 characters long.",
      );

      // Input too long should fail
      expect(validateChatInput(message, "123456789")).toBe(
        "Must be no more than 8 characters long.",
      );

      // Valid input should pass
      expect(validateChatInput(message, "abc")).toBe("");
      expect(validateChatInput(message, "12345678")).toBe("");
      expect(validateChatInput(message, "middle")).toBe("");
    });

    it("should validate email format", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { type: "email" },
      };

      // Invalid email formats should fail
      expect(validateChatInput(message, "invalid-email")).toBe(
        "Please enter a valid email address.",
      );
      expect(validateChatInput(message, "test@")).toBe(
        "Please enter a valid email address.",
      );
      expect(validateChatInput(message, "@example.com")).toBe(
        "Please enter a valid email address.",
      );
      expect(validateChatInput(message, "test.example.com")).toBe(
        "Please enter a valid email address.",
      );

      // Valid email formats should pass
      expect(validateChatInput(message, "test@example.com")).toBe("");
      expect(validateChatInput(message, "user.name@domain.co.uk")).toBe("");
      expect(validateChatInput(message, "test+tag@example.org")).toBe("");
    });

    it("should validate phone format", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { type: "phone" },
      };

      // Invalid phone formats should fail
      expect(validateChatInput(message, "123")).toBe(
        "Please enter a valid phone number.",
      );
      expect(validateChatInput(message, "abc-def-ghij")).toBe(
        "Please enter a valid phone number.",
      );
      expect(validateChatInput(message, "123-456-7890-1234")).toBe(
        "Please enter a valid phone number.",
      );

      // Valid phone formats should pass
      expect(validateChatInput(message, "123-456-7890")).toBe("");
      expect(validateChatInput(message, "(123) 456-7890")).toBe("");
      expect(validateChatInput(message, "123.456.7890")).toBe("");
      expect(validateChatInput(message, "1234567890")).toBe("");
    });

    it("should validate custom regex pattern", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { pattern: "^[A-Z]{2}\\d{4}$" },
      };

      // Invalid patterns should fail
      expect(validateChatInput(message, "ABC123")).toBe(
        "Please enter a valid value.",
      );
      expect(validateChatInput(message, "A1234")).toBe(
        "Please enter a valid value.",
      );
      expect(validateChatInput(message, "AB123")).toBe(
        "Please enter a valid value.",
      );

      // Valid patterns should pass
      expect(validateChatInput(message, "AB1234")).toBe("");
      expect(validateChatInput(message, "XY9876")).toBe("");
    });

    it("should validate custom error message", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: {
          required: true,
          requiredMessage: "Name is mandatory",
        },
      };

      expect(validateChatInput(message, "")).toBe("Name is mandatory");
    });

    it("should combine multiple validation rules", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: {
          required: true,
          minLength: 3,
          maxLength: 10,
          type: "email",
        },
      };

      // Test required validation
      expect(validateChatInput(message, "")).toBe("This field is required.");

      // Test length validation
      expect(validateChatInput(message, "ab")).toBe(
        "Must be at least 3 characters long.",
      );
      expect(
        validateChatInput(message, "verylongemailaddress@example.com"),
      ).toBe("Must be no more than 10 characters long.");

      // Test email validation
      expect(validateChatInput(message, "abc")).toBe(
        "Please enter a valid email address.",
      );

      // Valid input should pass all validations
      expect(validateChatInput(message, "a@b.co")).toBe(""); // 6 chars, within 10 limit
    });

    it("should handle edge cases", () => {
      const message: ChatMessage = {
        ...baseMessage,
        validation: { minLength: 0, maxLength: 100 },
      };

      // Empty string with minLength 0 should pass
      expect(validateChatInput(message, "")).toBe("");

      // Very long string within maxLength should pass
      const longString = "a".repeat(100);
      expect(validateChatInput(message, longString)).toBe("");

      // String exceeding maxLength should fail
      const tooLongString = "a".repeat(101);
      expect(validateChatInput(message, tooLongString)).toBe(
        "Must be no more than 100 characters long.",
      );
    });
  });

  describe("getNextMessageIndex", () => {
    const mockMessages: ChatMessage[] = [
      {
        id: "welcome",
        content: "Welcome message",
        type: "text",
        continue: true,
      },
      {
        id: "input-1",
        content: "First input",
        type: "input",
      },
      {
        id: "action-1",
        content: "Choose action",
        type: "action",
        actions: [
          { label: "Yes", type: "approve" },
          { label: "No", type: "deny" },
        ],
      },
      {
        id: "input-2",
        content: "Second input",
        type: "input",
      },
      {
        id: "final",
        content: "Final message",
        type: "text",
      },
    ];

    it("should return next index for normal progression", () => {
      expect(getNextMessageIndex(mockMessages, 0)).toBe(1);
      expect(getNextMessageIndex(mockMessages, 1)).toBe(2);
      expect(getNextMessageIndex(mockMessages, 2)).toBe(3);
      expect(getNextMessageIndex(mockMessages, 3)).toBe(4);
    });

    it("should handle continue messages automatically", () => {
      // Message at index 0 has continue: true, so should auto-advance
      expect(getNextMessageIndex(mockMessages, 0)).toBe(1);
    });

    it("should return current index when at end of messages", () => {
      expect(getNextMessageIndex(mockMessages, 4)).toBe(4);
    });

    it("should handle empty messages array", () => {
      expect(getNextMessageIndex([], 0)).toBe(0);
      expect(getNextMessageIndex([], 5)).toBe(5);
    });

    it("should handle single message", () => {
      const singleMessage = [mockMessages[0]];
      expect(getNextMessageIndex(singleMessage, 0)).toBe(0);
    });

    it("should handle out of bounds indices", () => {
      // Index beyond array length should return the index itself
      expect(getNextMessageIndex(mockMessages, 10)).toBe(10);
      expect(getNextMessageIndex(mockMessages, -1)).toBe(-1);
    });

    it("should work with different message types", () => {
      const mixedMessages: ChatMessage[] = [
        { id: "1", content: "Message 1", type: "text" },
        { id: "2", content: "Input 1", type: "input" },
        { id: "3", content: "Action 1", type: "action", actions: [] },
        { id: "4", content: "Message 2", type: "text", continue: true },
        { id: "5", content: "Input 2", type: "input" },
      ];

      expect(getNextMessageIndex(mixedMessages, 0)).toBe(1); // message -> input
      expect(getNextMessageIndex(mixedMessages, 1)).toBe(2); // input -> action
      expect(getNextMessageIndex(mixedMessages, 2)).toBe(3); // action -> message
      expect(getNextMessageIndex(mixedMessages, 3)).toBe(4); // message with continue -> input
      expect(getNextMessageIndex(mixedMessages, 4)).toBe(4); // last message
    });
  });

  describe("Integration Tests", () => {
    it("should work together for complete validation flow", () => {
      const message: ChatMessage = {
        id: "test",
        content: "Enter your name",
        type: "input",
        validation: { required: true, minLength: 2, maxLength: 50 },
      };

      // Test validation
      expect(validateChatInput(message, "")).toBe("This field is required.");
      expect(validateChatInput(message, "a")).toBe(
        "Must be at least 2 characters long.",
      );
      expect(validateChatInput(message, "valid name")).toBe("");

      // Test message progression
      const messages = [message];
      expect(getNextMessageIndex(messages, 0)).toBe(0); // Single message stays at 0
    });

    it("should handle complex validation scenarios", () => {
      const complexMessage: ChatMessage = {
        id: "complex",
        content: "Enter your email",
        type: "input",
        validation: {
          required: true,
          type: "email",
          minLength: 5,
          maxLength: 100,
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
      };

      // Test various validation combinations
      expect(validateChatInput(complexMessage, "")).toBe(
        "This field is required.",
      );
      expect(validateChatInput(complexMessage, "a")).toBe(
        "Must be at least 5 characters long.",
      );
      expect(validateChatInput(complexMessage, "invalid")).toBe(
        "Please enter a valid email address.",
      );
      expect(validateChatInput(complexMessage, "test@example.com")).toBe("");
    });
  });
});
