const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

type RateLimitStore = Map<string, number[]>;

const globalForRateLimit = globalThis as typeof globalThis & {
  __loyKrathongRateLimit?: RateLimitStore;
};

const store: RateLimitStore =
  globalForRateLimit.__loyKrathongRateLimit ??
  (globalForRateLimit.__loyKrathongRateLimit = new Map());

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

/**
 * จำกัดจำนวนครั้งแบบง่ายในหน่วยความจำ (5 ครั้ง/นาที/IP)
 * เหมาะกับ dev/workshop — ถ้า deploy หลาย instance ควรใช้ Redis หรือบริการภายนอก
 */
export function checkRateLimit(ip: string, now = Date.now()): RateLimitResult {
  const recent = (store.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    );
    store.set(ip, recent);
    return { ok: false, retryAfterSeconds };
  }

  recent.push(now);
  store.set(ip, recent);

  // กันหน่วยความจำบวมเมื่อมี IP เยอะๆ
  if (store.size > 2_000) {
    for (const [key, times] of store) {
      if (times.every((time) => now - time >= WINDOW_MS)) {
        store.delete(key);
      }
    }
  }

  return { ok: true, remaining: MAX_REQUESTS - recent.length };
}
