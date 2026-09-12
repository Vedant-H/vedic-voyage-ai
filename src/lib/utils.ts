import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures text rendered in UI and PDF is clean, readable prose.
 * If input contains raw JSON, markdown code fences, or stringified objects,
 * it extracts the relevant text instead of dumping raw JSON syntax to the user.
 */
export function cleanProse(input: unknown): string {
  if (!input) return "";
  if (typeof input !== "string") {
    if (typeof input === "object") {
      const obj = input as Record<string, any>;
      return (
        cleanProse(obj.content) ||
        cleanProse(obj.overview) ||
        cleanProse(obj.interpretation) ||
        cleanProse(obj.headline) ||
        cleanProse(obj.description) ||
        ""
      );
    }
    return String(input);
  }

  let text = input.trim();

  // If wrapped in ```json ... ``` or ``` ... ```
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  // If it starts with { and has JSON format
  if (
    text.startsWith("{") &&
    (text.includes('"headline"') ||
      text.includes('"personality"') ||
      text.includes('"content"') ||
      text.includes('"overview"') ||
      text.includes('"summary"'))
  ) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.personality?.content) return cleanProse(parsed.personality.content);
      if (parsed.summary?.overview) return cleanProse(parsed.summary.overview);
      if (parsed.content) return cleanProse(parsed.content);
      if (parsed.overview) return cleanProse(parsed.overview);
    } catch {
      // If parsing fails, try to extract value via regex
      const contentMatch = text.match(/"(?:content|overview)"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (contentMatch && contentMatch[1]) {
        return contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
    }
  }

  return text;
}
