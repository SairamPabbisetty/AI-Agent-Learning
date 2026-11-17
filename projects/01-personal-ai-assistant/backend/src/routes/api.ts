import { Router } from "express";
import { sendApiError } from "../api-response.js";
import { generateGeminiResponse } from "../services/gemini.service.js";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "personal-ai-assistant-backend",
    timestamp: new Date().toISOString(),
  });
});

function isMessageRequest(body: unknown): body is { message: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    "message" in body &&
    typeof body.message === "string" &&
    body.message.trim().length > 0
  );
}

apiRouter.post("/dev/echo", (req, res) => {
  const body: unknown = req.body;

  if (!isMessageRequest(body)) {
    sendApiError(res, 400, "A non-empty string message is required.");
    return;
  }

  res.status(200).json({
    success: true,
    data: { message: body.message },
  });
});

apiRouter.post("/chat", async (req, res) => {
  const body: unknown = req.body;

  if (!isMessageRequest(body)) {
    sendApiError(res, 400, "A non-empty string message is required.");
    return;
  }

  const message = await generateGeminiResponse(body.message);
  res.status(200).json({
    success: true,
    data: { message },
  });
});

export { apiRouter };
