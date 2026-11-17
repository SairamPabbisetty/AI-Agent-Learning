import { GoogleGenAI } from "@google/genai";

export class GeminiServiceError extends Error {
  constructor(
    readonly statusCode: 502 | 503,
    message: string,
  ) {
    super(message);
    this.name = "GeminiServiceError";
  }
}

let ai: GoogleGenAI | undefined;

export async function generateGeminiResponse(
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim();

  if (!apiKey || !model) {
    throw new GeminiServiceError(503, "Gemini service is not configured.");
  }

  try {
    ai ??= new GoogleGenAI({ apiKey });
  } catch {
    throw new GeminiServiceError(503, "Gemini service configuration is invalid.");
  }

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: userMessage,
    });
  } catch {
    throw new GeminiServiceError(502, "Gemini service request failed.");
  }

  const generatedText = response.text;
  if (typeof generatedText !== "string" || !generatedText.trim()) {
    throw new GeminiServiceError(502, "Gemini returned an empty response.");
  }

  return generatedText.trim();
}
