import { createHmac, randomBytes, randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import type { AppConfig } from '../config/env'
import type { Database } from '../db/database'
import { ApiError } from '../utils/errors'
import { emailValue, passwordValue, stringValue } from '../validation'
import type { AuthenticatedUser } from '../middleware/security'

export const roles = ['VISITOR', 'USER', 'ARTISAN', 'ORGANIZATION', 'VERIFIER', 'ADMIN'] as const
export type Role = typeof roles[number]
type StoredUser = AuthenticatedUser & { passwordHash: string; status: string }

function tokenHash(token: string, secret: string) { return createHmac('sha256', secret).update(token).digest('hex') }
function cookieValue(req: Request) {
  const authorization = req.header('authorization')
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7).trim()
  const cookies = (req.header('cookie') ?? '').split(';').map((part) => part.trim())
  return cookies.find((part) => part.startsWith('jv_session='))?.slice('jv_session='.length)
}

export class AuthService {
  private readonly users = new Map<string, StoredUser>()
  private readonly sessions = new Map<string, { userId: string; expiresAt: number }>()

  constructor(private readonly config: AppConfig, private readonly db: Database) {}

  private publicUser(user: StoredUser): AuthenticatedUser { return { id: user.id, email: user.email, roles: user.roles, ...(user.artisanId ? { artisanId: user.artisanId } : {}) } }

  async register(input: unknown, res: Response) {
    const body = input as Record<string, unknown>
    const email = emailValue(body.email)
    const password = passwordValue(body.password)
    const displayName = stringValue(body.displayName, 'displayName', { max: 120 })
    const existing = this.db.enabled ? await this.db.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]) : { rowCount: this.users.has(email) ? 1 : 0 }
    if (existing.rowCount) throw ApiError.conflict('An account with this email already exists.', 'EMAIL_EXISTS')
    const id = randomUUID()
    const passwordHash = await bcrypt.hash(password, 12)
    const user: StoredUser = { id, email, passwordHash, status: 'ACTIVE', roles: ['USER'], ...(displayName ? { displayName } as never : {}) }
    if (this.db.enabled) await this.db.transaction(async (client) => { await client.query('INSERT INTO users (id, email, password_hash, display_name) VALUES ($1, $2, $3, $4)', [id, email, passwordHash, displayName ?? null]); await client.query('INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2)', [id, 'USER']) })
    else this.users.set(email, user)
    await this.createSession(user, res)
    return this.publicUser(user)
  }

  async login(input: unknown, res: Response) {
    const body = input as Record<string, unknown>
    const email = emailValue(body.email)
    const password = passwordValue(body.password)
    let user: StoredUser | undefined
    if (this.db.enabled) {
      const result = await this.db.query<{ id: string; email: string; password_hash: string; status: string; roles: string[]; artisan_id?: string }>(`SELECT u.id, u.email, u.password_hash, u.status, MAX(ap.id) AS artisan_id, COALESCE(array_agg(ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL), ARRAY['USER']) AS roles FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN artisan_profiles ap ON ap.owner_user_id = u.id WHERE u.email = $1 GROUP BY u.id`, [email])
      const row = result.rows[0]
      if (row) user = { id: row.id, email: row.email, passwordHash: row.password_hash, status: row.status, roles: row.roles as Role[], ...(row.artisan_id ? { artisanId: row.artisan_id } : {}) }
    } else user = this.users.get(email)
    if (!user || user.status !== 'ACTIVE' || !(await bcrypt.compare(password, user.passwordHash))) throw ApiError.unauthorized('Email or password is incorrect.')
    await this.createSession(user, res)
    return this.publicUser(user)
  }

  private async createSession(user: StoredUser, res: Response) {
    const raw = randomBytes(32).toString('hex')
    const hash = tokenHash(raw, this.config.sessionSecret)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    if (this.db.enabled) await this.db.query('INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)', [randomUUID(), user.id, hash, expiresAt])
    else this.sessions.set(hash, { userId: user.id, expiresAt: expiresAt.getTime() })
    const secure = this.config.nodeEnv === 'production' ? '; Secure' : ''
    res.setHeader('Set-Cookie', `jv_session=${raw}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600${secure}`)
  }

  async resolve(req: Request): Promise<AuthenticatedUser | undefined> {
    const raw = cookieValue(req)
    if (!raw) return undefined
    const hash = tokenHash(raw, this.config.sessionSecret)
    if (this.db.enabled) {
      const result = await this.db.query<{ id: string; email: string; status: string; roles: string[]; artisan_id?: string }>(`SELECT u.id, u.email, u.status, MAX(ap.id) AS artisan_id, COALESCE(array_agg(ur.role_name) FILTER (WHERE ur.role_name IS NOT NULL), ARRAY['USER']) AS roles FROM sessions s JOIN users u ON u.id = s.user_id LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN artisan_profiles ap ON ap.owner_user_id = u.id WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW() GROUP BY u.id`, [hash])
      const row = result.rows[0]
      return row && row.status === 'ACTIVE' ? { id: row.id, email: row.email, roles: row.roles, ...(row.artisan_id ? { artisanId: row.artisan_id } : {}) } : undefined
    }
    const session = this.sessions.get(hash)
    if (!session || session.expiresAt < Date.now()) return undefined
    const user = [...this.users.values()].find((candidate) => candidate.id === session.userId)
    return user ? this.publicUser(user) : undefined
  }

  async logout(req: Request, res: Response) {
    const raw = cookieValue(req)
    if (raw) {
      const hash = tokenHash(raw, this.config.sessionSecret)
      if (this.db.enabled) await this.db.query('UPDATE sessions SET revoked_at = NOW() WHERE token_hash = $1', [hash])
      else this.sessions.delete(hash)
    }
    res.setHeader('Set-Cookie', 'jv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  }

  async requestPasswordReset(input: unknown) {
    const email = emailValue((input as Record<string, unknown>).email)
    const token = randomBytes(32).toString('hex')
    const hash = tokenHash(token, this.config.sessionSecret)
    if (this.db.enabled) {
      const result = await this.db.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email])
      if (result.rows[0]) await this.db.query('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'30 minutes\')', [randomUUID(), result.rows[0].id, hash])
    }
    // A token is deliberately never returned or emailed without a configured provider.
    return { accepted: true }
  }

  async requestEmailVerification(req: Request) {
    if (!req.user) throw ApiError.unauthorized()
    if (this.db.enabled) await this.db.query('INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'24 hours\')', [randomUUID(), req.user.id, tokenHash(randomBytes(32).toString('hex'), this.config.sessionSecret)])
    return { accepted: true }
  }
}

export function authOptional(service: AuthService) {
  return async (req: Request, _res: Response, next: (error?: unknown) => void) => { try { req.user = await service.resolve(req); next() } catch (error) { next(error) } }
}

export function requireAuth() {
  return (req: Request, _res: Response, next: (error?: unknown) => void) => req.user ? next() : next(ApiError.unauthorized())
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, _res: Response, next: (error?: unknown) => void) => req.user && req.user.roles.some((role) => allowed.includes(role as Role)) ? next() : next(ApiError.forbidden())
}

export { cookieValue, tokenHash }
