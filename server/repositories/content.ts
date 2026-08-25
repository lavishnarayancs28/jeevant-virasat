import { artisans, heritage, hiddenHeritage, livelihoodRecords, products, regions, sampleTrails, stories } from '../../shared/data'
import type { Artisan, HeritageLocation, LivelihoodRecord, Product, Region, Story, Trail } from '../../shared/types'
import type { Database } from '../db/database'

export type ContentFilters = { search?: string; region?: string; district?: string; category?: string; duration?: string; hidden?: boolean; language?: string; artisanId?: string }
export type ContentKind = 'heritage' | 'artisans' | 'stories' | 'products' | 'regions' | 'food'
export type ProductPriceRecord = { productId: string; price?: number; currency?: string; unit: string; source?: string; sourceUrl?: string; recordedAt: string; isPrototype: boolean; kind?: string; label: string }

export interface ContentRepository {
  listRegions(): Promise<Region[]>
  getRegion(idOrSlug: string): Promise<Region | undefined>
  listHeritage(filters?: ContentFilters): Promise<HeritageLocation[]>
  getHeritage(idOrSlug: string): Promise<HeritageLocation | undefined>
  listArtisans(filters?: ContentFilters): Promise<Artisan[]>
  getArtisan(idOrSlug: string): Promise<Artisan | undefined>
  listStories(filters?: ContentFilters): Promise<Story[]>
  getStory(idOrSlug: string): Promise<Story | undefined>
  listProducts(filters?: ContentFilters): Promise<Product[]>
  getProduct(idOrSlug: string): Promise<Product | undefined>
  listProductPrices(idOrSlug: string): Promise<ProductPriceRecord[]>
  listFood(filters?: ContentFilters): Promise<HeritageLocation[]>
  listLivelihoodRecords(artisanId?: string): Promise<LivelihoodRecord[]>
  listTrails(): Promise<Trail[]>
  getTrail(id: string): Promise<Trail | undefined>
  saveTrail(trail: Trail, userId?: string): Promise<Trail>
  deleteTrail(id: string, userId?: string): Promise<boolean>
  getProvenance(kind: ContentKind, idOrSlug: string): Promise<Record<string, unknown> | undefined>
}

function text(value: unknown) { return typeof value === 'string' ? value.trim().toLowerCase() : '' }
function matches(item: unknown, query?: string) { return !query || JSON.stringify(item).toLowerCase().includes(text(query)) }
function regionMatches(item: { regionId?: string; regionName?: string; state?: string; location?: string; district?: string }, region?: string, district?: string) {
  const target = text(region)
  const districtTarget = text(district)
  return (!target || [item.regionId, item.regionName, item.state, item.location].some((value) => text(value).includes(target))) && (!districtTarget || text(item.district).includes(districtTarget))
}
function durationMatches(minutes: number, duration?: string) {
  return !duration || duration === 'long' ? !duration || minutes > 180 : duration === 'short' ? minutes <= 90 : minutes > 90 && minutes <= 180
}

export class MemoryContentRepository implements ContentRepository {
  private readonly trails = new Map(sampleTrails.map((trail) => [trail.id, trail]))
  private readonly trailOwners = new Map<string, string | undefined>()
  async listRegions() { return regions }
  async getRegion(idOrSlug: string) { return regions.find((item) => item.id === idOrSlug || item.slug === idOrSlug) }
  async listHeritage(filters: ContentFilters = {}) {
    const query = text(filters.search)
    return heritage.filter((item) => regionMatches(item, filters.region, filters.district) && (!filters.category || text(item.category) === text(filters.category)) && durationMatches(item.durationMinutes, filters.duration) && (filters.hidden === undefined || Boolean(item.isHidden) === filters.hidden) && matches(item, query) && (!filters.language || Boolean(item.translations)) )
  }
  async getHeritage(idOrSlug: string) { return heritage.find((item) => item.id === idOrSlug || item.slug === idOrSlug) }
  async listArtisans(filters: ContentFilters = {}) { return artisans.filter((item) => regionMatches(item, filters.region, filters.district) && matches(item, filters.search)) }
  async getArtisan(idOrSlug: string) { return artisans.find((item) => item.id === idOrSlug || item.slug === idOrSlug) }
  async listStories(filters: ContentFilters = {}) { return stories.filter((item) => regionMatches(item, filters.region, filters.district) && matches(item, filters.search)) }
  async getStory(idOrSlug: string) { return stories.find((item) => item.id === idOrSlug || item.slug === idOrSlug) }
  async listProducts(filters: ContentFilters = {}) { return products.filter((item) => (!filters.artisanId || item.artisanId === filters.artisanId) && matches(item, filters.search)) }
  async getProduct(idOrSlug: string) { return products.find((item) => item.id === idOrSlug || item.slug === idOrSlug) }
  async listProductPrices(idOrSlug: string) {
    const product = await this.getProduct(idOrSlug)
    if (!product) return []
    return [{ productId: product.id, ...product.referencePrice, recordedAt: product.lastUpdated, isPrototype: product.isPrototype, label: product.referencePrice.kind === 'PROTOTYPE_REFERENCE' ? 'Reference price — prototype' : product.referencePrice.label }]
  }
  async listFood(filters: ContentFilters = {}) { return this.listHeritage({ ...filters, category: 'Food' }) }
  async listLivelihoodRecords(artisanId?: string) { return livelihoodRecords.filter((record) => !artisanId || record.artisanId === artisanId) }
  async listTrails() { return [...this.trails.values()] }
  async getTrail(id: string) { return this.trails.get(id) }
  async saveTrail(trail: Trail, userId?: string) { this.trails.set(trail.id, trail); this.trailOwners.set(trail.id, userId); return trail }
  async deleteTrail(id: string, userId?: string) { if (this.trailOwners.get(id) !== userId) return false; return this.trails.delete(id) }
  async getProvenance(kind: ContentKind, idOrSlug: string) {
    const item = kind === 'heritage' ? await this.getHeritage(idOrSlug) : kind === 'artisans' ? await this.getArtisan(idOrSlug) : kind === 'products' ? await this.getProduct(idOrSlug) : kind === 'stories' ? await this.getStory(idOrSlug) : undefined
    if (!item) return undefined
    const provenance = 'provenance' in item ? item.provenance : undefined
    return { id: item.id, kind, isPrototype: 'isPrototype' in item ? item.isPrototype : false, verificationStatus: provenance?.verificationStatus ?? ('verificationStatus' in item ? item.verificationStatus : 'PROTOTYPE'), provenance }
  }
  get livelihood() { return livelihoodRecords }
  get hidden() { return hiddenHeritage }
}

type PayloadRow = { id: string; slug: string; payload: unknown }

export class PostgresContentRepository implements ContentRepository {
  constructor(private readonly db: Database, private readonly fallback = new MemoryContentRepository()) {}
  private async payloadRows<T>(table: string, filters: ContentFilters = {}, extra = ''): Promise<T[]> {
    const values: unknown[] = []
    const conditions = [table === 'heritage_records' ? 'published = TRUE' : 'TRUE']
    if (filters.search) { values.push(`%${text(filters.search)}%`); conditions.push(`LOWER(payload::text) LIKE $${values.length}`) }
    if (filters.region) { values.push(text(filters.region)); conditions.push(`(LOWER(COALESCE(region_id, '')) = $${values.length} OR LOWER(payload->>'regionName') = $${values.length} OR LOWER(payload->>'state') = $${values.length})`) }
    if (filters.district) { values.push(text(filters.district)); conditions.push(`LOWER(COALESCE(district, payload->>'district', '')) = $${values.length}`) }
    if (filters.category) { values.push(filters.category); conditions.push(`LOWER(COALESCE(category, payload->>'category', '')) = LOWER($${values.length})`) }
    if (filters.hidden !== undefined) { values.push(filters.hidden); conditions.push(`COALESCE((payload->>'isHidden')::boolean, FALSE) = $${values.length}`) }
    if (filters.artisanId) { values.push(filters.artisanId); conditions.push(`artisan_id = $${values.length}`) }
    const result = await this.db.query<PayloadRow>(`SELECT id, slug, payload FROM ${table} WHERE ${conditions.join(' AND ')} ${extra}`, values)
    return result.rows.map((row) => row.payload as T)
  }
  private async one<T>(table: string, idOrSlug: string): Promise<T | undefined> {
    const result = await this.db.query<PayloadRow>(`SELECT payload FROM ${table} WHERE id = $1 OR slug = $1 LIMIT 1`, [idOrSlug])
    return result.rows[0]?.payload as T | undefined
  }
  async listRegions() { const result = await this.db.query<{ payload: Region }>('SELECT payload FROM regions ORDER BY slug'); return result.rows.map((row) => row.payload) }
  async getRegion(idOrSlug: string) { const result = await this.db.query<{ payload: Region }>('SELECT payload FROM regions WHERE id = $1 OR slug = $1 LIMIT 1', [idOrSlug]); return result.rows[0]?.payload }
  async listHeritage(filters = {}) { const rows = await this.payloadRows<HeritageLocation>('heritage_records', filters); return rows.length ? rows : this.fallback.listHeritage(filters) }
  async getHeritage(idOrSlug: string) { return (await this.one<HeritageLocation>('heritage_records', idOrSlug)) ?? this.fallback.getHeritage(idOrSlug) }
  async listArtisans(filters = {}) { const rows = await this.payloadRows<Artisan>('artisan_profiles', filters, 'ORDER BY updated_at DESC'); return rows.length ? rows : this.fallback.listArtisans(filters) }
  async getArtisan(idOrSlug: string) { return (await this.one<Artisan>('artisan_profiles', idOrSlug)) ?? this.fallback.getArtisan(idOrSlug) }
  async listStories(filters = {}) { const rows = await this.payloadRows<Story>('cultural_stories', filters); return rows.length ? rows : this.fallback.listStories(filters) }
  async getStory(idOrSlug: string) { return (await this.one<Story>('cultural_stories', idOrSlug)) ?? this.fallback.getStory(idOrSlug) }
  async listProducts(filters = {}) { const rows = await this.payloadRows<Product>('products', filters); return rows.length ? rows : this.fallback.listProducts(filters) }
  async getProduct(idOrSlug: string) { return (await this.one<Product>('products', idOrSlug)) ?? this.fallback.getProduct(idOrSlug) }
  async listProductPrices(idOrSlug: string) {
    const result = await this.db.query<{ product_id: string; price: string; currency: string; unit: string; source?: string; source_url?: string; recorded_at: string; is_prototype: boolean }>('SELECT pp.product_id, pp.price, pp.currency, pp.unit, pp.source, pp.source_url, pp.recorded_at, pp.is_prototype FROM product_prices pp JOIN products p ON p.id = pp.product_id WHERE p.id = $1 OR p.slug = $1 ORDER BY pp.recorded_at DESC', [idOrSlug])
    if (result.rows.length) return result.rows.map((row) => ({ productId: row.product_id, price: Number(row.price), currency: row.currency, unit: row.unit, source: row.source, sourceUrl: row.source_url, recordedAt: row.recorded_at, isPrototype: row.is_prototype, label: row.is_prototype ? 'Reference price — prototype' : 'Sourced market price' }))
    return this.fallback.listProductPrices(idOrSlug)
  }
  async listFood(filters = {}) { return this.listHeritage({ ...filters, category: 'Food' }) }
  async listLivelihoodRecords(artisanId?: string) {
    const result = await this.db.query<{ payload: LivelihoodRecord }>('SELECT payload FROM livelihood_records WHERE ($1::text IS NULL OR artisan_id = $1) ORDER BY period DESC', [artisanId ?? null])
    return result.rows.length ? result.rows.map((row) => row.payload) : this.fallback.listLivelihoodRecords(artisanId)
  }
  async listTrails() { return this.fallback.listTrails() }
  async getTrail(id: string) { return this.fallback.getTrail(id) }
  async saveTrail(trail: Trail, userId?: string) { if (this.db.enabled) await this.db.query('INSERT INTO trails (id, user_id, payload) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload', [trail.id, userId ?? null, JSON.stringify(trail)]); return this.fallback.saveTrail(trail, userId) }
  async deleteTrail(id: string, userId?: string) { if (this.db.enabled) { const result = await this.db.query<{ id: string }>('DELETE FROM trails WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId ?? null]); return Boolean(result.rowCount) } return this.fallback.deleteTrail(id, userId) }
  async getProvenance(kind: ContentKind, idOrSlug: string) {
    const table = kind === 'heritage' ? 'heritage_records' : kind === 'artisans' ? 'artisan_profiles' : kind === 'products' ? 'products' : kind === 'stories' ? 'cultural_stories' : 'food_records'
    const item = await this.one<Record<string, unknown>>(table, idOrSlug)
    if (!item) return this.fallback.getProvenance(kind, idOrSlug)
    const provenance = item.provenance as Record<string, unknown> | undefined
    return { id: item.id, kind, isPrototype: item.isPrototype ?? false, verificationStatus: item.verificationStatus ?? provenance?.verificationStatus, provenance }
  }
}

export function createContentRepository(db: Database) { return db.enabled ? new PostgresContentRepository(db) : new MemoryContentRepository() }
