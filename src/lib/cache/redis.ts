import { Redis } from "@upstash/redis";
import crypto from "crypto";
import type { CompleteVedicChart } from "../vedic";

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && !url.includes("your-upstash") && !token.includes("your_upstash")) {
    try {
      redisClient = new Redis({ url, token });
      return redisClient;
    } catch {
      return null;
    }
  }
  return null;
}

// In-memory fallback cache
const memoryCache = new Map<string, { data: CompleteVedicChart; expiresAt: number }>();

/**
 * Computes an immutable deterministic hash key for birth coordinates & time.
 */
export function computeChartHash(
  dateOfBirth: string,
  timeOfBirth: string,
  lat: number,
  lon: number,
  tzOffset: number = 0,
): string {
  const roundedLat = lat.toFixed(4);
  const roundedLon = lon.toFixed(4);
  const raw = `${dateOfBirth}_${timeOfBirth}_${roundedLat}_${roundedLon}_tz${tzOffset}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Retrieves cached Vedic chart from Upstash Redis or in-memory cache.
 */
export async function getCachedVedicChart(hash: string): Promise<CompleteVedicChart | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const cached = await redis.get<CompleteVedicChart>(`chart:${hash}`);
      if (cached) return cached;
    } catch {
      // Redis error, fall through to memory
    }
  }

  const mem = memoryCache.get(hash);
  if (mem) {
    if (Date.now() < mem.expiresAt) return mem.data;
    memoryCache.delete(hash);
  }

  return null;
}

/**
 * Stores Vedic chart permanently in Upstash Redis (or in-memory with 7 day TTL).
 */
export async function setCachedVedicChart(hash: string, chart: CompleteVedicChart): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      // Store indefinitely or with 90 days TTL
      await redis.set(`chart:${hash}`, chart, { ex: 90 * 24 * 3600 });
      return;
    } catch {
      // Fall through to memory
    }
  }

  // 7 days in memory
  memoryCache.set(hash, {
    data: chart,
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
  });
}
