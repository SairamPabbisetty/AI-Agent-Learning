
import { GoogleGenAI } from "@google/genai";
import { expect, it } from "vitest";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;

it.skipIf(!apiKey || !model)(
  "returns a response from Gemini",
  async () => {
    if (!apiKey || !model) {
      throw new Error("Gemini API configuration is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: "Explain Playwright in three simple sentences.",
    });

    expect(response.text?.trim()).toBeTruthy();
  },
);
