// Simple in-memory rate limiter for MVP.
// For production, use a proper Redis-backed solution.

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if an action is rate-limited.
 * @param key Unique key (e.g., "order-create:192.168.1.1")
 * @param limit Max attempts allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if rate-limited, false if allowed
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    // New window or expired
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count++;
  return false;
}

/**
 * Get remaining attempts in current window.
 */
export function getRemainingAttempts(key: string, limit: number): number {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    return limit;
  }

  return Math.max(0, limit - entry.count);
}

/**
 * Remove expired entries to prevent unbounded memory growth.
 * Called automatically every 5 minutes.
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Automatically clean up expired entries every 5 minutes.
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
