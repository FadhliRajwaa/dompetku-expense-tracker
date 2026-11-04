// Rate limit in-memory per IP + route. Best-effort di serverless multi-instance
// (tiap instance punya counter sendiri) — cukup untuk menghambat brute-force
// login/register dari satu sumber. Untuk proteksi DDoS sungguhan gunakan
// WAF/CDN di depan aplikasi.
const buckets = new Map<string, number[]>();

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export function rateLimit(req: Request, route: string, limit: number, windowMs: number): boolean {
  const key = `${route}:${clientIp(req)}`;
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) return false;
  hits.push(now);
  buckets.set(key, hits);
  // Batasi memori: buang bucket yang sudah kedaluwarsa
  if (buckets.size > 10000) {
    for (const [k, v] of buckets) {
      if (v.length === 0 || now - v[v.length - 1] > windowMs) buckets.delete(k);
      if (buckets.size <= 5000) break;
    }
  }
  return true;
}

export function rateLimitedResponse() {
  return Response.json({ error: 'Terlalu banyak percobaan, coba lagi nanti' }, { status: 429 });
}

/** Baca body JSON dengan batas ukuran (default 1MB) anti payload raksasa. */
export async function readJson<T>(req: Request, maxBytes = 1_048_576): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const len = req.headers.get('content-length');
  if (len && Number(len) > maxBytes) return { ok: false, error: 'Payload terlalu besar' };
  try {
    const text = await req.text();
    if (text.length > maxBytes) return { ok: false, error: 'Payload terlalu besar' };
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, error: 'Body JSON tidak valid' };
  }
}
