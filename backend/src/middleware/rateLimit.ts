import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

function getClientKey(req: Request, prefix: string): string {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim()
    || req.socket.remoteAddress
    || 'unknown';
  return `${prefix}:${ip}`;
}

function cleanupStore() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstRequest > 15 * 60 * 1000) store.delete(key);
  }
}
setInterval(cleanupStore, 5 * 60 * 1000);

function createLimiter(options: {
  prefix: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getClientKey(req, options.prefix);
    const now = Date.now();
    const entry = store.get(key);

    if (entry?.blocked) {
      if (now < (entry.blockedUntil || 0)) {
        const retryAfter = Math.ceil(((entry.blockedUntil || 0) - now) / 1000);
        res.setHeader('Retry-After', retryAfter);
        return res.status(429).json({ error: options.message, retryAfter });
      }
      store.delete(key);
    }

    if (!entry || now - entry.firstRequest > options.windowMs) {
      store.set(key, { count: 1, firstRequest: now, blocked: false });
      return next();
    }

    entry.count++;

    if (entry.count > options.maxRequests) {
      entry.blocked = true;
      entry.blockedUntil = now + options.blockDurationMs;
      const retryAfter = Math.ceil(options.blockDurationMs / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: options.message, retryAfter });
    }

    next();
  };
}

// 5 attempts per 15 min — blocks for 15 min on breach
export const authRateLimit = createLimiter({
  prefix: 'auth',
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 15 * 60 * 1000,
  message: 'Trop de tentatives. Réessayez dans 15 minutes.',
});

// 30 requests per minute for trip endpoints
export const tripRateLimit = createLimiter({
  prefix: 'trip',
  maxRequests: 30,
  windowMs: 60 * 1000,
  blockDurationMs: 60 * 1000,
  message: 'Trop de requêtes. Réessayez dans 1 minute.',
});

// 10 requests per minute for payment webhooks
export const paymentRateLimit = createLimiter({
  prefix: 'payment',
  maxRequests: 10,
  windowMs: 60 * 1000,
  blockDurationMs: 5 * 60 * 1000,
  message: 'Limite webhook atteinte.',
});
