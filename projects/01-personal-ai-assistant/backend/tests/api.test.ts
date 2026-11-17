import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../src/app.js";
import { errorHandler } from "../src/middleware/error-handler.js";
import {
  GeminiServiceError,
  generateGeminiResponse,
} from "../src/services/gemini.service.js";

vi.mock("../src/services/gemini.service.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/services/gemini.service.js")>();
  return { ...actual, generateGeminiResponse: vi.fn() };
});

const mockGenerateGeminiResponse = vi.mocked(generateGeminiResponse);

beforeEach(() => {
  mockGenerateGeminiResponse.mockReset();
});

describe("GET /api/health", () => {
  it("returns backend health information", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("personal-ai-assistant-backend");
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});

describe("POST /api/dev/echo", () => {
  it("echoes a valid message in a structured response", async () => {
    const response = await request(app)
      .post("/api/dev/echo")
      .send({ message: "Hello from the frontend" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { message: "Hello from the frontend" },
    });
  });

  it.each([
    ["missing", {}],
    ["blank", { message: "   " }],
    ["not a string", { message: 42 }],
  ])("returns 400 for a %s message", async (_inputCase, body) => {
    const response = await request(app).post("/api/dev/echo").send(body);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toMatch(/message is required/i);
  });

  it("returns a JSON 400 response for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/dev/echo")
      .set("Content-Type", "application/json")
      .send('{"message":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: { message: "Request body contains invalid JSON." },
    });
  });
});

describe("POST /api/chat", () => {
  it("returns a generated response in a structured response", async () => {
    mockGenerateGeminiResponse.mockResolvedValue("Playwright automates browsers.");

    const response = await request(app)
      .post("/api/chat")
      .send({ message: "Explain Playwright in simple terms." });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: { message: "Playwright automates browsers." },
    });
    expect(mockGenerateGeminiResponse).toHaveBeenCalledWith(
      "Explain Playwright in simple terms.",
    );
  });

  it.each([
    ["missing", {}],
    ["blank", { message: "   " }],
    ["not a string", { message: 42 }],
  ])("returns 400 for a %s message", async (_inputCase, body) => {
    const response = await request(app).post("/api/chat").send(body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: { message: "A non-empty string message is required." },
    });
    expect(mockGenerateGeminiResponse).not.toHaveBeenCalled();
  });

  it("returns a sanitized 502 response when Gemini fails", async () => {
    mockGenerateGeminiResponse.mockRejectedValue(
      new GeminiServiceError(502, "Gemini service request failed."),
    );

    const response = await request(app)
      .post("/api/chat")
      .send({ message: "Hello" });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      success: false,
      error: { message: "Gemini service request failed." },
    });
    expect(JSON.stringify(response.body)).not.toContain("GEMINI_API_KEY");
  });
});

describe("unknown routes", () => {
  it("returns a structured 404 response", async () => {
    const response = await request(app).get("/api/not-a-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: { message: "Route not found." },
    });
  });
});

describe("central error handling", () => {
  it("logs unexpected errors and returns a sanitized 500 response", async () => {
    const failingApp = express();
    failingApp.get("/failure", (_req, _res, next) => {
      next(new Error("private internal details"));
    });
    failingApp.use(errorHandler);
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const response = await request(failingApp).get("/failure");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        error: { message: "Internal server error." },
      });
      expect(logError).toHaveBeenCalledWith(
        "Unhandled request error:",
        expect.any(Error),
      );
    } finally {
      logError.mockRestore();
    }
  });
});

describe("CORS", () => {
  it("allows the configured local frontend origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });

  it("does not grant CORS access to an unknown origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://untrusted.example");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("does not emit a wildcard origin when the request has no Origin header", async () => {
    const response = await request(app).get("/api/health");

    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
