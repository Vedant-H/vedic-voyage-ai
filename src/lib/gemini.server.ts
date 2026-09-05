const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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
 * Calls Gemini directly via Google AI Studio API or through the Lovable AI gateway.
 * The API key is read at call time on the server and never leaves the server.
 */
export async function callGemini(messages: GatewayMessage[], maxTokens = 8000): Promise<string> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const geminiKey = process.env["GEMINI_API_KEY"];
  const apiKey = lovableKey || geminiKey;

  if (!apiKey) {
    throw new AiError("The astrology engine is not configured yet. Please provide GEMINI_API_KEY in .env.", 500);
  }

  // If we have a direct Google Gemini API key (typically starts with AIza) or no Lovable key
  const isDirectGemini = Boolean(geminiKey && (!lovableKey || geminiKey.startsWith("AIza")));

  if (isDirectGemini && geminiKey) {
    return callDirectGoogleGemini(geminiKey, messages, maxTokens);
  }

  return callLovableGateway(apiKey, messages, maxTokens);
}

/**
 * Direct call to Google Gemini REST API (Google AI Studio)
 */
async function callDirectGoogleGemini(
  apiKey: string,
  messages: GatewayMessage[],
  maxTokens: number,
): Promise<string> {
  const model = process.env["GEMINI_MODEL"] || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Extract system prompt if present
  const systemMessage = messages.find((m) => m.role === "system");
  const conversation = messages.filter((m) => m.role !== "system");

  const contents = conversation.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const payload: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  };

  if (systemMessage) {
    payload["systemInstruction"] = {
      parts: [{ text: systemMessage.content }],
    };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AiError("We couldn't reach the astrology engine. Please check your network connection.", 503);
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new AiError("The stars are busy right now (rate limit reached) — please retry in a moment.", 429);
    }
    if (res.status === 400 || res.status === 403) {
      throw new AiError(`Gemini API key error (${res.status}): Please verify your GEMINI_API_KEY.`, res.status);
    }
    throw new AiError(`The astrology engine returned an error (${res.status}): ${errorText.slice(0, 100)}`, 502);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new AiError("The reading came back empty. Please try again.", 502);
  }

  return text;
}

/**
 * Call through Lovable AI Gateway
 */
async function callLovableGateway(
  apiKey: string,
  messages: GatewayMessage[],
  maxTokens: number,
): Promise<string> {
  const model = process.env["GEMINI_MODEL"] || "google/gemini-2.5-flash";

  let res: Response;
  try {
    res = await fetch(LOVABLE_GATEWAY_URL, {
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
      throw new AiError("AI readings are temporarily unavailable for this workspace.", res.status);
    }
    throw new AiError("The astrology engine returned an unexpected error.", 502);
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
