export function createLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) {
      buckets.set(key, recent);
      return false;
    }
    recent.push(now);
    buckets.set(key, recent);
    return true;
  };
}
