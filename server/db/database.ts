import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'
import type { AppConfig } from '../config/env'

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

export class Database {
  readonly pool?: Pool

  constructor(private readonly config: AppConfig) {
    if (config.databaseUrl) {
      this.pool = new Pool({
        connectionString: config.databaseUrl,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
      })
    }
  }

  get enabled() { return Boolean(this.pool) }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []): Promise<QueryResult<T>> {
    if (!this.pool) throw new Error('DATABASE_URL is not configured.')
    return this.pool.query<T>(text, values)
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>) {
    if (!this.pool) throw new Error('DATABASE_URL is not configured.')
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async migrate() {
    if (!this.pool) throw new Error('DATABASE_URL is required to run migrations.')
    await this.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())')
    const files = (await import('node:fs/promises')).readdir(migrationsDir)
    for (const name of (await files).filter((file) => file.endsWith('.sql')).sort()) {
      const existing = await this.query<{ name: string }>('SELECT name FROM schema_migrations WHERE name = $1', [name])
      if (existing.rowCount) continue
      const sql = await readFile(join(migrationsDir, name), 'utf8')
      await this.transaction(async (client) => {
        for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) await client.query(statement)
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name])
      })
      console.log(`Applied migration ${name}`)
    }
  }

  async close() { await this.pool?.end() }
}
