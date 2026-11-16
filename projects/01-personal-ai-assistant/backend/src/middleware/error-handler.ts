import type { ErrorRequestHandler } from "express";
import { sendApiError } from "../api-response.js";

interface BodyParserError extends Error {
  status: number;
  type: string;
}

function isBodyParserError(error: unknown): error is BodyParserError {
  return (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number" &&
    "type" in error &&
    typeof error.type === "string"
  );
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (isBodyParserError(error) && error.type === "entity.parse.failed") {
    sendApiError(res, 400, "Request body contains invalid JSON.");
    return;
  }

  if (isBodyParserError(error) && error.type === "entity.too.large") {
    sendApiError(res, 413, "Request body is too large.");
    return;
  }

  console.error("Unhandled request error:", error);
  sendApiError(res, 500, "Internal server error.");
};
