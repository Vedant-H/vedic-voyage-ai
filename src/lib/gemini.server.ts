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
 * Discovers and collects all Gemini API keys configured in the environment.
 * Supports:
 * - GEMINI_API_KEY
 * - GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_N
 * - Comma-separated list in GEMINI_API_KEYS
 */
export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];

  // Comma-separated env
  if (process.env.GEMINI_API_KEYS) {
    const list = process.env.GEMINI_API_KEYS.split(",").map((k) => k.trim());
    for (const k of list) {
      if (k && !keys.includes(k)) keys.push(k);
    }
  }

  // Numbered or individual env vars
  const entries = Object.entries(process.env).sort(([a], [b]) => a.localeCompare(b));
  for (const [k, v] of entries) {
    if (k.startsWith("GEMINI_API_KEY") && k !== "GEMINI_API_KEYS" && typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed && !keys.includes(trimmed)) {
        keys.push(trimmed);
      }
    }
  }

  return keys;
}

let keyRoundRobinIndex = 0;

/**
 * Returns the next Gemini API key in round-robin sequence.
 */
export function getNextGeminiApiKey(): string {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new AiError("No GEMINI_API_KEY found in environment secrets.", 500);
  }
  const key = keys[keyRoundRobinIndex % keys.length];
  keyRoundRobinIndex = (keyRoundRobinIndex + 1) % keys.length;
  return key;
}

/**
 * Calls Gemini with Round-Robin key rotation and automatic failover across all configured keys.
 */
export async function callGemini(messages: GatewayMessage[], maxTokens = 16000): Promise<string> {
  const keys = getGeminiApiKeys();
  const lovableKey = process.env["LOVABLE_API_KEY"];

  if (keys.length === 0 && !lovableKey) {
    throw new AiError("The astrology engine is not configured yet. Please provide GEMINI_API_KEY in .env.", 500);
  }

  if (keys.length > 0) {
    const startIndex = keyRoundRobinIndex;
    let lastError: any = null;

    // Attempt round-robin across all available keys in the pool
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const idx = (startIndex + attempt) % keys.length;
      const apiKey = keys[idx];
      keyRoundRobinIndex = (idx + 1) % keys.length;

      try {
        console.log(`[Gemini Engine] Dispatching request with API key #${idx + 1} of ${keys.length}`);
        return await callDirectGoogleGemini(apiKey, messages, maxTokens);
      } catch (err: any) {
        lastError = err;
        // If rate-limited (429), quota-limited (403), or service unavailable (503), failover to next key
        if (err.status === 429 || err.status === 403 || err.status === 503) {
          console.warn(`[Gemini Engine] Key #${idx + 1} encountered status ${err.status}. Failing over to next key...`);
          continue;
        }
        throw err;
      }
    }

    if (lastError) throw lastError;
  }

  return callLovableGateway(lovableKey!, messages, maxTokens);
}

/**
 * Streams tokens from Gemini using Server-Sent Events (SSE) with Round-Robin key selection.
 */
export async function* streamGemini(
  messages: GatewayMessage[],
  maxTokens = 8000,
): AsyncGenerator<string> {
  const keys = getGeminiApiKeys();
  const geminiKey = keys.length > 0 ? getNextGeminiApiKey() : process.env["GEMINI_API_KEY"];
  const model = process.env["GEMINI_MODEL"] || "gemini-2.5-flash";

  if (!geminiKey) {
    const text = await callGemini(messages, maxTokens);
    yield text;
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`;

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
      responseMimeType: "application/json",
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
    const text = await callGemini(messages, maxTokens);
    yield text;
    return;
  }

  if (!res.ok || !res.body) {
    const text = await callGemini(messages, maxTokens);
    yield text;
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (chunk) yield chunk;
      } catch {
        /* continue */
      }
    }
  }
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
      responseMimeType: "application/json",
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
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.choices?.[0]?.message?.content?.trim() ??
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
  if (!text) {
    throw new AiError("The reading came back empty. Please try again.", 502);
  }
  return text;
}

/** Safely extracts JSON from a model response that may contain fences, prose, or slight truncation. */
export function parseJsonLoose<T>(raw: string): T | null {
  if (!raw) return null;
  let cleaned = raw.trim();

  // Strip code fences with multiline regex
  cleaned = cleaned.replace(/^```(?:json)?\s*/im, "");
  cleaned = cleaned.replace(/\s*```$/im, "");
  cleaned = cleaned.trim();

  const candidates = [cleaned];
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) {
    candidates.push(cleaned.slice(start, end + 1));
  }

  // Also try repairing unclosed brackets/quotes
  candidates.push(repairJson(cleaned));
  if (start !== -1) {
    candidates.push(repairJson(cleaned.slice(start)));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      try {
        const sanitized = candidate.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match === "\n" || match === "\r" || match === "\t") return match;
          return "";
        });
        return JSON.parse(sanitized) as T;
      } catch {
        /* try next */
      }
    }
  }
  return null;
}

function repairJson(str: string): string {
  let s = str.trim();
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{" || ch === "[") {
        stack.push(ch);
      } else if (ch === "}") {
        if (stack.length && stack[stack.length - 1] === "{") stack.pop();
      } else if (ch === "]") {
        if (stack.length && stack[stack.length - 1] === "[") stack.pop();
      }
    }
  }

  if (inString) {
    s += '"';
  }

  s = s.replace(/,\s*$/, "");

  while (stack.length > 0) {
    const last = stack.pop();
    if (last === "{") s += "}";
    else if (last === "[") s += "]";
  }

  return s;
}
