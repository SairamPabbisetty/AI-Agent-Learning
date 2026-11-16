import type { Response } from "express";

export function sendApiError(
  response: Response,
  statusCode: number,
  message: string,
): void {
  response.status(statusCode).json({
    success: false,
    error: { message },
  });
}
