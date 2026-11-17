const backendBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

interface MessageSuccessResponse {
  success: true;
  data: { message: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMessageSuccess(value: unknown): value is MessageSuccessResponse {
  return (
    isRecord(value) &&
    value.success === true &&
    isRecord(value.data) &&
    typeof value.data.message === "string"
  );
}

function getErrorMessage(value: unknown): string | undefined {
  if (!isRecord(value) || value.success !== false || !isRecord(value.error)) {
    return undefined;
  }

  return typeof value.error.message === "string"
    ? value.error.message
    : undefined;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error("The backend returned an invalid response.");
  }
}

async function postMessage(path: string, message: string): Promise<string> {
  const response = await fetch(`${backendBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const payload: unknown = await readJson(response);

  if (!response.ok) {
    const message = getErrorMessage(payload);
    throw new Error(message ?? `The backend request failed (${response.status}).`);
  }

  if (!isMessageSuccess(payload)) {
    throw new Error("The backend returned an unexpected response.");
  }

  return payload.data.message;
}

export async function chatMessage(message: string): Promise<string> {
  return postMessage("/api/chat", message);
}

export async function echoMessage(message: string): Promise<string> {
  return postMessage("/api/dev/echo", message);
}
