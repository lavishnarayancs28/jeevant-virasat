import { randomUUID } from 'node:crypto'
import type { Request } from 'express'
import type { BusinessHealth, LivelihoodRecordInput } from '../../shared/types'
import type { Database } from '../db/database'
import { ApiError } from '../utils/errors'
import { positiveNumber, stringValue } from '../validation'

type Inventory = { id: string; artisanId: string; productId: string; quantity: number; reserved: number; updatedAt: string }
type Production = { id: string; artisanId: string; productId?: string; unitsProduced: number; productionDate: string }
type Sale = { id: string; artisanId: string; productId?: string; unitsSold: number; sellingPrice: number; saleDate: string }
type Expense = { id: string; artisanId: string; category: string; amount: number; date: string; description?: string }
type Submission = { id: string; userId: string; type: string; payload: Record<string, unknown>; status: string; moderationNotes?: string; createdAt: string }
type Verification = { id: string; artisanId: string; status: string; source?: string; evidenceMetadata: Record<string, unknown>; notes?: string; reviewerUserId?: string; createdAt: string }

export function canAccessPrivateArtisan(req: Request, artisanId: string) {
  return Boolean(req.user && (req.user.roles.some((role) => ['ADMIN', 'ORGANIZATION'].includes(role)) || (req.user.roles.includes('ARTISAN') && req.user.artisanId === artisanId)))
}

export function calculateBusinessHealth(sales: Sale[], expenses: Expense[]) {
  const revenue = sales.reduce((sum, sale) => sum + sale.unitsSold * sale.sellingPrice, 0)
  const totalCosts = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  if (!sales.length && !expenses.length) return { health: 'INSUFFICIENT_DATA' as BusinessHealth, revenue, totalCosts, grossProfit: 0, profitMargin: null, prototype: false }
  const grossProfit = revenue - totalCosts
  const profitMargin = revenue > 0 ? grossProfit / revenue : null
  const health: BusinessHealth = grossProfit < 0 ? 'NEGATIVE_MARGIN' : profitMargin !== null && profitMargin < 0.2 ? 'LOW_MARGIN' : 'POSITIVE_MARGIN'
  return { health, revenue, totalCosts, grossProfit, profitMargin, prototype: false }
}

export class PlatformService {
  private readonly inventory = new Map<string, Inventory>()
  private readonly production = new Map<string, Production[]>()
  private readonly sales = new Map<string, Sale[]>()
  private readonly expenses = new Map<string, Expense[]>()
  private readonly favorites = new Map<string, { id: string; type: string; targetId: string; createdAt: string }[]>()
  private readonly submissions = new Map<string, Submission>()
  private readonly verifications = new Map<string, Verification[]>()

  constructor(private readonly db: Database) {}

  private id() { return randomUUID() }

  async getInventory(artisanId: string) {
    if (this.db.enabled) {
      const result = await this.db.query<{ id: string; artisan_id: string; product_id: string; quantity: number; reserved: number; updated_at: string }>('SELECT id, artisan_id, product_id, quantity, reserved, updated_at FROM inventory_records WHERE artisan_id = $1 ORDER BY updated_at DESC', [artisanId])
      return result.rows.map((row) => ({ id: row.id, artisanId: row.artisan_id, productId: row.product_id, quantity: Number(row.quantity), reserved: Number(row.reserved), available: Number(row.quantity) - Number(row.reserved), updatedAt: row.updated_at }))
    }
    return [...this.inventory.values()].filter((item) => item.artisanId === artisanId).map((item) => ({ ...item, available: item.quantity - item.reserved }))
  }

  async upsertInventory(artisanId: string, productId: string, input: unknown) {
    const body = input as Record<string, unknown>
    const quantity = positiveNumber(body.quantity, 'quantity', { required: true, integer: true })!
    const reserved = positiveNumber(body.reserved ?? 0, 'reserved', { integer: true })!
    if (reserved > quantity) throw ApiError.badRequest('reserved cannot exceed quantity.')
    const id = this.id()
    if (this.db.enabled) {
      const result = await this.db.query<{ id: string }>('INSERT INTO inventory_records (id, artisan_id, product_id, quantity, reserved) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (artisan_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity, reserved = EXCLUDED.reserved, updated_at = NOW() RETURNING id', [id, artisanId, productId, quantity, reserved])
      return { id: result.rows[0].id, artisanId, productId, quantity, reserved, available: quantity - reserved, updatedAt: new Date().toISOString() }
    }
    const inventory = { id, artisanId, productId, quantity, reserved, updatedAt: new Date().toISOString() }
    this.inventory.set(`${artisanId}:${productId}`, inventory)
    return { ...inventory, available: quantity - reserved }
  }

  async addProduction(artisanId: string, input: unknown) {
    const body = input as Record<string, unknown>
    const record: Production = { id: this.id(), artisanId, productId: stringValue(body.productId, 'productId'), unitsProduced: positiveNumber(body.unitsProduced, 'unitsProduced', { required: true, integer: true })!, productionDate: stringValue(body.productionDate, 'productionDate', { required: true })! }
    if (this.db.enabled) await this.db.query('INSERT INTO production_records (id, artisan_id, product_id, units_produced, production_date) VALUES ($1, $2, $3, $4, $5)', [record.id, record.artisanId, record.productId ?? null, record.unitsProduced, record.productionDate])
    else this.production.set(artisanId, [...(this.production.get(artisanId) ?? []), record])
    return record
  }

  async addSale(artisanId: string, input: unknown) {
    const body = input as Record<string, unknown>
    const record: Sale = { id: this.id(), artisanId, productId: stringValue(body.productId, 'productId'), unitsSold: positiveNumber(body.unitsSold, 'unitsSold', { required: true, integer: true })!, sellingPrice: positiveNumber(body.sellingPrice, 'sellingPrice', { required: true })!, saleDate: stringValue(body.saleDate, 'saleDate', { required: true })! }
    if (this.db.enabled) await this.db.query('INSERT INTO sales_records (id, artisan_id, product_id, units_sold, selling_price, sale_date) VALUES ($1, $2, $3, $4, $5, $6)', [record.id, record.artisanId, record.productId ?? null, record.unitsSold, record.sellingPrice, record.saleDate])
    else this.sales.set(artisanId, [...(this.sales.get(artisanId) ?? []), record])
    return record
  }

  async addExpense(artisanId: string, input: unknown) {
    const body = input as Record<string, unknown>
    const record: Expense = { id: this.id(), artisanId, category: stringValue(body.category, 'category', { required: true, max: 100 })!, amount: positiveNumber(body.amount, 'amount', { required: true })!, date: stringValue(body.date, 'date', { required: true })!, description: stringValue(body.description, 'description', { max: 500 }) }
    if (this.db.enabled) await this.db.query('INSERT INTO expense_records (id, artisan_id, category, amount, expense_date, description) VALUES ($1, $2, $3, $4, $5, $6)', [record.id, record.artisanId, record.category, record.amount, record.date, record.description ?? null])
    else this.expenses.set(artisanId, [...(this.expenses.get(artisanId) ?? []), record])
    return record
  }

  async getFinancials(artisanId: string) {
    let sales = this.sales.get(artisanId) ?? []
    let expenses = this.expenses.get(artisanId) ?? []
    let production = this.production.get(artisanId) ?? []
    if (this.db.enabled) {
      const [salesResult, expensesResult, productionResult] = await Promise.all([
        this.db.query<{ id: string; artisan_id: string; product_id?: string; units_sold: number; selling_price: number; sale_date: string }>('SELECT id, artisan_id, product_id, units_sold, selling_price, sale_date FROM sales_records WHERE artisan_id = $1 ORDER BY sale_date DESC', [artisanId]),
        this.db.query<{ id: string; artisan_id: string; category: string; amount: number; expense_date: string; description?: string }>('SELECT id, artisan_id, category, amount, expense_date, description FROM expense_records WHERE artisan_id = $1 ORDER BY expense_date DESC', [artisanId]),
        this.db.query<{ id: string; artisan_id: string; product_id?: string; units_produced: number; production_date: string }>('SELECT id, artisan_id, product_id, units_produced, production_date FROM production_records WHERE artisan_id = $1 ORDER BY production_date DESC', [artisanId]),
      ])
      sales = salesResult.rows.map((row) => ({ id: row.id, artisanId: row.artisan_id, productId: row.product_id, unitsSold: Number(row.units_sold), sellingPrice: Number(row.selling_price), saleDate: row.sale_date }))
      expenses = expensesResult.rows.map((row) => ({ id: row.id, artisanId: row.artisan_id, category: row.category, amount: Number(row.amount), date: row.expense_date, description: row.description }))
      production = productionResult.rows.map((row) => ({ id: row.id, artisanId: row.artisan_id, productId: row.product_id, unitsProduced: Number(row.units_produced), productionDate: row.production_date }))
    }
    return { sales, expenses, production, ...calculateBusinessHealth(sales, expenses), label: sales.some((sale) => sale.id.startsWith('prototype')) ? 'Prototype Business Health' : 'Business Health' }
  }

  async listFavorites(userId: string) {
    if (this.db.enabled) { const result = await this.db.query<{ id: string; target_type: string; target_id: string; created_at: string }>('SELECT id, target_type, target_id, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC', [userId]); return result.rows.map((row) => ({ id: row.id, type: row.target_type, targetId: row.target_id, createdAt: row.created_at })) }
    return this.favorites.get(userId) ?? []
  }
  async addFavorite(userId: string, input: unknown) { const body = input as Record<string, unknown>; const type = stringValue(body.type, 'type', { required: true, max: 40 })!; const targetId = stringValue(body.targetId, 'targetId', { required: true, max: 120 })!; const id = this.id(); if (this.db.enabled) await this.db.query('INSERT INTO favorites (id, user_id, target_type, target_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, target_type, target_id) DO NOTHING', [id, userId, type, targetId]); else { const list = this.favorites.get(userId) ?? []; if (!list.some((item) => item.type === type && item.targetId === targetId)) this.favorites.set(userId, [...list, { id, type, targetId, createdAt: new Date().toISOString() }]) }; return { id, type, targetId } }
  async removeFavorite(userId: string, id: string) { if (this.db.enabled) await this.db.query('DELETE FROM favorites WHERE id = $1 AND user_id = $2', [id, userId]); else this.favorites.set(userId, (this.favorites.get(userId) ?? []).filter((item) => item.id !== id)) }

  async createSubmission(userId: string, input: unknown) { const body = input as Record<string, unknown>; const submission: Submission = { id: this.id(), userId, type: stringValue(body.type, 'type', { required: true, max: 50 })!, payload: body.payload && typeof body.payload === 'object' ? body.payload as Record<string, unknown> : {}, status: 'PENDING', createdAt: new Date().toISOString() }; if (this.db.enabled) await this.db.query('INSERT INTO community_submissions (id, user_id, type, payload) VALUES ($1, $2, $3, $4)', [submission.id, userId, submission.type, JSON.stringify(submission.payload)]); else this.submissions.set(submission.id, submission); return submission }
  async getSubmission(id: string, userId?: string) { if (this.db.enabled) { const result = await this.db.query<{ id: string; user_id: string; type: string; payload: Record<string, unknown>; status: string; moderation_notes?: string; created_at: string }>('SELECT id, user_id, type, payload, status, moderation_notes, created_at FROM community_submissions WHERE id = $1 AND ($2::text IS NULL OR user_id = $2)', [id, userId ?? null]); const row = result.rows[0]; return row && { id: row.id, userId: row.user_id, type: row.type, payload: row.payload, status: row.status, moderationNotes: row.moderation_notes, createdAt: row.created_at } } const item = this.submissions.get(id); return item && (!userId || item.userId === userId) ? item : undefined }
  async moderateSubmission(id: string, status: string, notes?: string) { if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) throw ApiError.badRequest('Unsupported moderation status.'); if (this.db.enabled) { const result = await this.db.query<{ id: string }>('UPDATE community_submissions SET status = $1, moderation_notes = $2, updated_at = NOW() WHERE id = $3 RETURNING id', [status, notes ?? null, id]); if (!result.rowCount) throw ApiError.notFound('Submission not found.') } else { const item = this.submissions.get(id); if (!item) throw ApiError.notFound('Submission not found.'); item.status = status; item.moderationNotes = notes } return { id, status, notes } }

  async requestVerification(artisanId: string, input: unknown) {
    const body = input as Record<string, unknown>
    const item: Verification = { id: this.id(), artisanId, status: 'PENDING', source: stringValue(body.source, 'source', { max: 300 }), evidenceMetadata: body.evidenceMetadata && typeof body.evidenceMetadata === 'object' ? body.evidenceMetadata as Record<string, unknown> : {}, notes: stringValue(body.notes, 'notes', { max: 1000 }), createdAt: new Date().toISOString() }
    if (this.db.enabled) await this.db.query('INSERT INTO artisan_verifications (id, artisan_id, status, source, evidence_metadata, notes) VALUES ($1, $2, $3, $4, $5, $6)', [item.id, artisanId, item.status, item.source ?? null, JSON.stringify(item.evidenceMetadata), item.notes ?? null])
    else this.verifications.set(artisanId, [...(this.verifications.get(artisanId) ?? []), item])
    return item
  }
  async getVerifications(artisanId: string) {
    if (this.db.enabled) { const result = await this.db.query<{ id: string; artisan_id: string; status: string; source?: string; evidence_metadata: Record<string, unknown>; notes?: string; reviewer_user_id?: string; created_at: string }>('SELECT id, artisan_id, status, source, evidence_metadata, notes, reviewer_user_id, created_at FROM artisan_verifications WHERE artisan_id = $1 ORDER BY created_at DESC', [artisanId]); return result.rows.map((row) => ({ id: row.id, artisanId: row.artisan_id, status: row.status, source: row.source, evidenceMetadata: row.evidence_metadata, notes: row.notes, reviewerUserId: row.reviewer_user_id, createdAt: row.created_at })) }
    return this.verifications.get(artisanId) ?? []
  }
  async reviewVerification(id: string, reviewerUserId: string, status: string, notes?: string) {
    if (!['VERIFIED', 'COMMUNITY_VERIFIED', 'REJECTED', 'PENDING'].includes(status)) throw ApiError.badRequest('Unsupported verification status.')
    if (this.db.enabled) { const result = await this.db.query<{ id: string }>('UPDATE artisan_verifications SET status = $1, reviewer_user_id = $2, notes = $3, reviewed_at = NOW() WHERE id = $4 RETURNING id', [status, reviewerUserId, notes ?? null, id]); if (!result.rowCount) throw ApiError.notFound('Verification request not found.') }
    else { for (const list of this.verifications.values()) { const item = list.find((candidate) => candidate.id === id); if (item) { item.status = status; item.notes = notes; item.reviewerUserId = reviewerUserId; return item } } throw ApiError.notFound('Verification request not found.') }
    return { id, status, reviewerUserId }
  }
}

export function toLivelihoodInput(record: Record<string, unknown>): LivelihoodRecordInput { return { artisanId: stringValue(record.artisanId, 'artisanId', { required: true })!, period: stringValue(record.period, 'period', { required: true })!, productionUnits: positiveNumber(record.productionUnits, 'productionUnits', { required: true, integer: true })!, unitsSold: positiveNumber(record.unitsSold, 'unitsSold', { required: true, integer: true })!, averageSellingPrice: positiveNumber(record.averageSellingPrice, 'averageSellingPrice', { required: true })!, materialCost: positiveNumber(record.materialCost, 'materialCost', { required: true })!, labourCost: positiveNumber(record.labourCost, 'labourCost', { required: true })!, transportCost: positiveNumber(record.transportCost, 'transportCost', { required: true })!, otherCosts: positiveNumber(record.otherCosts, 'otherCosts', { required: true })!, source: stringValue(record.source, 'source', { required: true, max: 300 })!, isPrototype: record.isPrototype === true } }
