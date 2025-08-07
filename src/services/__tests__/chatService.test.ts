import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadChatService, listChatServices } from "../chatService";
import { mockChatService } from "../../test/mocks/chatService";

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as typeof fetch;

describe("chatService", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("loadChatService", () => {
    it("should load a chat service successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChatService),
      });

      const result = await loadChatService("test-service");

      expect(mockFetch).toHaveBeenCalledWith("/data/test-service.json");
      expect(result).toEqual(mockChatService);
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(loadChatService("test-service")).rejects.toThrow(
        "Network error"
      );
      expect(mockFetch).toHaveBeenCalledWith("/data/test-service.json");
    });

    it("should handle HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      });

      await expect(loadChatService("non-existent")).rejects.toThrow(
        "Failed to load service: Not Found"
      );
      expect(mockFetch).toHaveBeenCalledWith("/data/non-existent.json");
    });

    it("should handle different HTTP status codes", async () => {
      const statusCodes = [
        { status: 404, statusText: "Not Found" },
        { status: 500, statusText: "Internal Server Error" },
        { status: 403, statusText: "Forbidden" },
      ];

      for (const { status, statusText } of statusCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
          statusText,
        });

        await expect(loadChatService("test")).rejects.toThrow(
          `Failed to load service: ${statusText}`
        );
      }
    });

    it("should handle malformed JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(loadChatService("test-service")).rejects.toThrow(
        "Invalid JSON"
      );
    });

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const result = await loadChatService("test-service");
      expect(result).toBeNull();
    });

    it("should handle special characters in service ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockChatService),
      });

      await loadChatService("test-service-with-special-chars_123");

      expect(mockFetch).toHaveBeenCalledWith(
        "/data/test-service-with-special-chars_123.json"
      );
    });

    it("should handle concurrent requests", async () => {
      const service1 = { ...mockChatService, id: "service1" };
      const service2 = { ...mockChatService, id: "service2" };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(service1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(service2),
        });

      const [result1, result2] = await Promise.all([
        loadChatService("service1"),
        loadChatService("service2"),
      ]);

      expect(result1).toEqual(service1);
      expect(result2).toEqual(service2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("listChatServices", () => {
    it("should list all available chat services", async () => {
      // Mock responses for each service
      const services = [
        {
          ...mockChatService,
          id: "employee-onboarding",
          title: "Employee Onboarding",
        },
        { ...mockChatService, id: "feature-request", title: "Feature Request" },
        {
          ...mockChatService,
          id: "system-access-request",
          title: "System Access Request",
        },
      ];

      services.forEach((service) => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(service),
        });
      });

      const result = await listChatServices();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "/data/employee-onboarding.json"
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "/data/feature-request.json"
      );
      expect(mockFetch).toHaveBeenNthCalledWith(
        3,
        "/data/system-access-request.json"
      );

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        {
          id: "employee-onboarding",
          title: "Employee Onboarding",
          description: mockChatService.description,
        },
        {
          id: "feature-request",
          title: "Feature Request",
          description: mockChatService.description,
        },
        {
          id: "system-access-request",
          title: "System Access Request",
          description: mockChatService.description,
        },
      ]);
    });

    it("should filter out failed service loads", async () => {
      // Mock: first service succeeds, second fails, third succeeds
      const successService = {
        ...mockChatService,
        id: "employee-onboarding",
        title: "Employee Onboarding",
      };
      const anotherSuccessService = {
        ...mockChatService,
        id: "system-access-request",
        title: "System Access Request",
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(successService),
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Not Found",
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(anotherSuccessService),
        });

      // Mock console.error to avoid noise in test output
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await listChatServices();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("employee-onboarding");
      expect(result[1].id).toBe("system-access-request");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load service feature-request:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle all services failing to load", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: "Server Error",
      });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await listChatServices();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledTimes(3);

      consoleSpy.mockRestore();
    });

    it("should handle network errors for some services", async () => {
      const successService = {
        ...mockChatService,
        id: "employee-onboarding",
        title: "Employee Onboarding",
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(successService),
        })
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockRejectedValueOnce(new Error("Connection refused"));

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await listChatServices();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("employee-onboarding");
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it("should handle malformed JSON in service responses", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.reject(new Error("Invalid JSON")),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "feature-request",
              title: "Feature Request",
              description: "Valid service",
              messages: [],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(null), // Invalid response
        });

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await listChatServices();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("feature-request");
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });

    it("should preserve service order", async () => {
      const services = [
        { ...mockChatService, id: "employee-onboarding", title: "A Service" },
        { ...mockChatService, id: "feature-request", title: "Z Service" },
        { ...mockChatService, id: "system-access-request", title: "M Service" },
      ];

      services.forEach((service) => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(service),
        });
      });

      const result = await listChatServices();

      // Should maintain the order defined in the service
      expect(result[0].id).toBe("employee-onboarding");
      expect(result[1].id).toBe("feature-request");
      expect(result[2].id).toBe("system-access-request");
    });

    it("should handle empty service responses", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}), // Empty object
      });

      const result = await listChatServices();

      expect(result).toHaveLength(3);
      // Should handle empty objects gracefully
      result.forEach((service) => {
        expect(service).toHaveProperty("id");
        expect(service).toHaveProperty("title");
        expect(service).toHaveProperty("description");
      });
    });
  });

  describe("error handling integration", () => {
    it("should handle mixed success and failure scenarios", async () => {
      const validService = {
        id: "valid-service",
        title: "Valid Service",
        description: "A working service",
        messages: [],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(validService),
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Internal Server Error",
        })
        .mockRejectedValueOnce(new Error("Network failure"));

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const [loadResult, listResult] = await Promise.all([
        loadChatService("valid-service"),
        listChatServices(),
      ]);

      expect(loadResult).toEqual(validService);
      expect(listResult).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });
});
