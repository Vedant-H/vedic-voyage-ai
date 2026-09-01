const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the Gemini model through the secure server-side AI gateway.
 * The API key is read at call time and never leaves the server.
 */
export async function callGemini(messages: GatewayMessage[], maxTokens = 8000): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"] ?? process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new AiError("The astrology engine is not configured yet. Please try again later.", 500);
  }
  const model = process.env["GEMINI_MODEL"] || "google/gemini-3.6-flash";

  let res: Response;
  try {
    res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
    });
  } catch {
    throw new AiError("We couldn't reach the astrology engine. Please try again.", 503);
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new AiError("The stars are busy right now — please retry in a moment.", 429);
    }
    if (res.status === 402 || res.status === 403) {
      throw new AiError(
        "AI readings are temporarily unavailable for this workspace. Please try again later.",
        res.status,
      );
    }
    throw new AiError("The astrology engine returned an unexpected error. Please try again.", 502);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new AiError("The reading came back empty. Please try again.", 502);
  }
  return text;
}

/** Safely extracts JSON from a model response that may contain fences or prose. */
export function parseJsonLoose<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const candidates = [cleaned];
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) candidates.push(cleaned.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      /* try next */
    }
  }
  return null;
}
