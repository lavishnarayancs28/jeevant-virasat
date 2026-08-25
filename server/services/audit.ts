import { randomUUID } from 'node:crypto'
import type { Database } from '../db/database'

export class AuditService {
  constructor(private readonly db: Database) {}
  async record(input: { actorUserId?: string; action: string; entityType: string; entityId?: string; metadata?: Record<string, unknown> }) {
    const safeMetadata = input.metadata ?? {}
    if (this.db.enabled) await this.db.query('INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, metadata) VALUES ($1, $2, $3, $4, $5, $6)', [randomUUID(), input.actorUserId ?? null, input.action, input.entityType, input.entityId ?? null, JSON.stringify(safeMetadata)])
  }
}
