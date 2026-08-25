import type { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import type { AppConfig } from '../config/env'

declare module 'express-serve-static-core' {
  interface Request { requestId?: string; user?: AuthenticatedUser }
}

export type AuthenticatedUser = { id: string; email: string; roles: string[]; artisanId?: string }

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id')?.trim()
  const id = incoming && incoming.length <= 100 ? incoming : randomUUID()
  req.requestId = id
  res.setHeader('X-Request-Id', id)
  next()
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
}

export function cors(config: AppConfig) {
  const allowed = new Set([config.frontendUrl, config.appUrl].map((url) => url.replace(/\/$/, '')))
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.header('origin')
    if (origin && allowed.has(origin.replace(/\/$/, ''))) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id')
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
    }
    if (req.method === 'OPTIONS') return res.status(204).end()
    next()
  }
}

export function rateLimit(options: { windowMs: number; max: number; keyPrefix: string }) {
  const buckets = new Map<string, { count: number; resetAt: number }>()
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    const key = `${options.keyPrefix}:${req.ip ?? req.socket.remoteAddress ?? 'unknown'}`
    const current = buckets.get(key)
    if (!current || current.resetAt <= now) buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    else current.count += 1
    const bucket = buckets.get(key)!
    res.setHeader('X-RateLimit-Limit', options.max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - bucket.count))
    if (bucket.count > options.max) return res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.', requestId: req.requestId ?? 'unknown' } })
    next()
  }
}
