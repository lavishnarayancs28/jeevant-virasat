import express, { type Request, type Response } from 'express'
import { join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { generateTrail, validateTrailRequest } from './recommendation'
import { identifyHeritage } from '../shared/recognition'
import { answerAskJeevant } from '../shared/ask-jeevant'
import { recommendWeatherFood } from '../shared/weather-food'
import { loadConfig, type AppConfig } from './config/env'
import { Database } from './db/database'
import { createContentRepository, type ContentFilters, type ContentRepository } from './repositories/content'
import { authOptional, AuthService, requireAuth, requireRole } from './auth/service'
import { rateLimit, requestId, securityHeaders, cors } from './middleware/security'
import { ApiError, asyncHandler, ok, sendApiError } from './utils/errors'
import { jsonObject, pageParams, stringValue } from './validation'
import { AuditService } from './services/audit'
import { canAccessPrivateArtisan, PlatformService } from './services/platform'
import { AiService } from './integrations/ai'
import { MediaService } from './integrations/media'
import { NotificationService } from './integrations/notifications'
import { PaymentsService } from './integrations/payments'
import { WeatherService } from './integrations/weather'

export type AppDependencies = { config?: AppConfig; db?: Database; repository?: ContentRepository }

function queryValue(value: unknown) { return typeof value === 'string' ? value.trim() : undefined }
function param(req: Request, name: string) { const value = req.params[name]; return typeof value === 'string' ? value : value[0] ?? '' }
function queryFilters(req: Request): ContentFilters {
  const query = req.query as unknown as Record<string, unknown>
  const hidden = query.hidden === undefined ? undefined : query.hidden === true || query.hidden === 'true'
  return { search: queryValue(query.search), region: queryValue(query.region), district: queryValue(query.district), category: queryValue(query.category), duration: queryValue(query.duration), hidden, language: queryValue(query.language) }
}
function sorted<T extends { name?: string; durationMinutes?: number }>(items: T[], sort?: string) { return sort === 'name' ? [...items].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')) : sort === 'duration' ? [...items].sort((a, b) => (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0)) : items }
function contentTable(kind: string) { return kind === 'heritage' ? 'heritage_records' : kind === 'artisans' ? 'artisan_profiles' : kind === 'stories' ? 'cultural_stories' : kind === 'products' ? 'products' : undefined }
function verificationMeta(config: AppConfig, kind: 'artisan' | 'product' | 'heritage', id: string) { const base = config.appUrl.replace(/\/$/, ''); return { recordType: `Jeevant Virasat ${kind} record`, verificationId: `${kind}:${id}`, verificationUrl: `${base}/verify/${kind}/${id}`, governmentCertification: false, legalIdentity: false, officialGovernmentApproval: false } }

async function writeContent(db: Database, kind: string, input: unknown, id?: string, method: 'create' | 'update' = 'create') {
  if (!db.enabled) throw ApiError.unavailable('Content editing requires DATABASE_URL.', 'DATABASE_REQUIRED')
  const body = jsonObject(input, 'body')
  const table = contentTable(kind)
  if (!table) throw ApiError.badRequest('Unsupported content type.')
  const contentId = id ?? stringValue(body.id, 'id', { max: 120 }) ?? randomUUID()
  const slug = stringValue(body.slug, 'slug', { required: true, max: 180 })!
  const payload = { ...body, id: contentId, slug }
  if (method === 'update') {
    const existing = await db.query<{ payload: Record<string, unknown> }>(`SELECT payload FROM ${table} WHERE id = $1 OR slug = $1 LIMIT 1`, [id])
    if (!existing.rowCount) throw ApiError.notFound('Content record not found.')
    const merged = { ...existing.rows[0].payload, ...payload, id: existing.rows[0].payload.id ?? contentId }
    await db.query(`UPDATE ${table} SET payload = $1, updated_at = NOW() WHERE id = $2 OR slug = $2`, [JSON.stringify(merged), id])
    return merged
  }
  if (table === 'heritage_records') await db.query('INSERT INTO heritage_records (id, slug, region_id, district, category, verification_status, is_prototype, payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [contentId, slug, body.regionId ?? null, body.district ?? null, body.category ?? null, body.verificationStatus ?? 'PENDING_VERIFICATION', body.isPrototype === true, JSON.stringify(payload)])
  if (table === 'artisan_profiles') await db.query('INSERT INTO artisan_profiles (id, slug, region_id, district, verification_status, is_prototype, public_profile, payload) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [contentId, slug, body.regionId ?? null, body.district ?? null, body.verificationStatus ?? 'PROTOTYPE', body.isPrototype === true, JSON.stringify(payload), JSON.stringify(payload)])
  if (table === 'cultural_stories') await db.query('INSERT INTO cultural_stories (id, slug, region_id, verification_status, is_prototype, payload) VALUES ($1,$2,$3,$4,$5,$6)', [contentId, slug, body.regionId ?? null, body.verificationStatus ?? 'PENDING_VERIFICATION', body.isPrototype === true, JSON.stringify(payload)])
  if (table === 'products') await db.query('INSERT INTO products (id, slug, artisan_id, verification_status, is_prototype, payload) VALUES ($1,$2,$3,$4,$5,$6)', [contentId, slug, body.artisanId ?? null, body.verificationStatus ?? 'PROTOTYPE', body.isPrototype === true, JSON.stringify(payload)])
  return payload
}

async function deleteContent(db: Database, kind: string, id: string) {
  if (!db.enabled) throw ApiError.unavailable('Content editing requires DATABASE_URL.', 'DATABASE_REQUIRED')
  const table = contentTable(kind)
  if (!table) throw ApiError.badRequest('Unsupported content type.')
  const result = await db.query<{ id: string }>(`DELETE FROM ${table} WHERE id = $1 OR slug = $1 RETURNING id`, [id])
  if (!result.rowCount) throw ApiError.notFound('Content record not found.')
  return { deleted: true, id: result.rows[0].id }
}

export function createApp(dependencies: AppDependencies = {}) {
  const config = dependencies.config ?? loadConfig()
  const db = dependencies.db ?? new Database(config)
  const repository = dependencies.repository ?? createContentRepository(db)
  const auth = new AuthService(config, db)
  const platform = new PlatformService(db)
  const audit = new AuditService(db)
  const weather = new WeatherService(config)
  const ai = new AiService(config)
  const media = new MediaService(config)
  const payments = new PaymentsService(config)
  const notifications = new NotificationService(config)
  const app = express()

  app.set('trust proxy', 1)
  app.use(requestId)
  app.use(securityHeaders)
  app.use(cors(config))
  app.use(express.json({ limit: '100kb' }))
  app.use(authOptional(auth))
  app.use(rateLimit({ windowMs: 60_000, max: 240, keyPrefix: 'api' }))

  app.get('/api/regions', asyncHandler(async (_req, res) => res.json(ok(await repository.listRegions()))))
  app.get('/api/regions/:slug', asyncHandler(async (req, res) => { const region = await repository.getRegion(param(req, 'slug')); if (!region) throw ApiError.notFound('Region not found.'); return res.json(ok(region)) }))

  app.get('/api/heritage', asyncHandler(async (req, res) => {
    const filters = queryFilters(req)
    const items = sorted(await repository.listHeritage(filters), queryValue((req.query as Record<string, unknown>).sort))
    return res.json(ok(items))
  }))
  app.get('/api/hidden-heritage', asyncHandler(async (req, res) => {
    return res.json(ok(await repository.listHeritage({ ...queryFilters(req), hidden: true })))
  }))
  app.get('/api/heritage/:id/provenance', asyncHandler(async (req, res) => {
    const provenance = await repository.getProvenance('heritage', param(req, 'id'))
    if (!provenance) throw ApiError.notFound('Heritage provenance not found.')
    return res.json(ok(provenance))
  }))
  app.get('/api/heritage/:id', asyncHandler(async (req, res) => {
    const item = await repository.getHeritage(param(req, 'id'))
    if (!item) throw ApiError.notFound('Heritage location not found.')
    return res.json(ok(item))
  }))

  app.get('/api/artisans', asyncHandler(async (req, res) => res.json(ok(await repository.listArtisans(queryFilters(req))))))
  app.get('/api/artisans/:id/verification', asyncHandler(async (req, res) => res.json(ok(await platform.getVerifications(param(req, 'id'))))))
  app.get('/api/artisans/:id/inventory', requireAuth(), asyncHandler(async (req, res) => { const artisanId = param(req, 'id'); if (!canAccessPrivateArtisan(req, artisanId)) throw ApiError.forbidden('Private artisan records are restricted to the artisan, an authorized organization, or an administrator.'); return res.json(ok(await platform.getInventory(artisanId))) }))
  app.get('/api/artisans/:id/financials', requireAuth(), asyncHandler(async (req, res) => { const artisanId = param(req, 'id'); if (!canAccessPrivateArtisan(req, artisanId)) throw ApiError.forbidden('Private artisan records are restricted to the artisan, an authorized organization, or an administrator.'); return res.json(ok(await platform.getFinancials(artisanId))) }))
  app.get('/api/artisans/:id/business-health', requireAuth(), asyncHandler(async (req, res) => { const artisanId = param(req, 'id'); if (!canAccessPrivateArtisan(req, artisanId)) throw ApiError.forbidden('Private artisan records are restricted to the artisan, an authorized organization, or an administrator.'); const result = await platform.getFinancials(artisanId); return res.json(ok({ health: result.health, revenue: result.revenue, totalCosts: result.totalCosts, grossProfit: result.grossProfit, profitMargin: result.profitMargin, label: result.label })) }))
  app.get('/api/artisans/:id/livelihood', requireAuth(), asyncHandler(async (req, res) => { const artisanId = param(req, 'id'); if (!canAccessPrivateArtisan(req, artisanId)) throw ApiError.forbidden('Private artisan records are restricted to the artisan, an authorized organization, or an administrator.'); return res.json(ok(await repository.listLivelihoodRecords(artisanId))) }))
  app.get('/api/artisans/:id', asyncHandler(async (req, res) => {
    const item = await repository.getArtisan(param(req, 'id'))
    if (!item) throw ApiError.notFound('Artisan not found.')
    return res.json(ok(item))
  }))
  app.get('/api/verify/artisan/:id', asyncHandler(async (req, res) => {
    const item = await repository.getArtisan(param(req, 'id'))
    if (!item) throw ApiError.notFound('Verification record not found.')
    return res.json(ok({ ...item, verification: verificationMeta(config, 'artisan', param(req, 'id')) }))
  }))
  app.get('/api/verify/heritage/:id', asyncHandler(async (req, res) => {
    const item = await repository.getHeritage(param(req, 'id'))
    if (!item) throw ApiError.notFound('Verification record not found.')
    return res.json(ok({ ...item, verification: verificationMeta(config, 'heritage', param(req, 'id')) }))
  }))
  app.get('/api/verify/product/:id', asyncHandler(async (req, res) => {
    const item = await repository.getProduct(param(req, 'id'))
    if (!item) throw ApiError.notFound('Verification record not found.')
    return res.json(ok({ ...item, verification: verificationMeta(config, 'product', param(req, 'id')) }))
  }))

  app.get('/api/products', asyncHandler(async (req, res) => res.json(ok(await repository.listProducts(queryFilters(req))))))
  app.get('/api/products/:id/inventory', requireAuth(), asyncHandler(async (req, res) => { const product = await repository.getProduct(param(req, 'id')); if (!product) throw ApiError.notFound('Product not found.'); if (!canAccessPrivateArtisan(req, product.artisanId)) throw ApiError.forbidden('Private inventory is restricted to the artisan, an authorized organization, or an administrator.'); return res.json(ok((await platform.getInventory(product.artisanId)).filter((item) => item.productId === product.id))) }))
  app.post('/api/products/:id/inventory', requireAuth(), asyncHandler(async (req, res) => { const product = await repository.getProduct(param(req, 'id')); if (!product) throw ApiError.notFound('Product not found.'); if (!canAccessPrivateArtisan(req, product.artisanId)) throw ApiError.forbidden('Private inventory is restricted to the artisan, an authorized organization, or an administrator.'); const result = await platform.upsertInventory(product.artisanId, product.id, req.body); await audit.record({ actorUserId: req.user!.id, action: 'UPDATE', entityType: 'inventory', entityId: result.id }); return res.status(201).json(ok(result)) }))
  app.patch('/api/products/:id/inventory', requireAuth(), asyncHandler(async (req, res) => { const product = await repository.getProduct(param(req, 'id')); if (!product) throw ApiError.notFound('Product not found.'); if (!canAccessPrivateArtisan(req, product.artisanId)) throw ApiError.forbidden('Private inventory is restricted to the artisan, an authorized organization, or an administrator.'); const result = await platform.upsertInventory(product.artisanId, product.id, req.body); return res.json(ok(result)) }))
  app.get('/api/products/:id/prices', asyncHandler(async (req, res) => {
    const product = await repository.getProduct(param(req, 'id'))
    if (!product) throw ApiError.notFound('Product not found.')
    return res.json(ok(await repository.listProductPrices(param(req, 'id'))))
  }))
  app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const item = await repository.getProduct(param(req, 'id'))
    if (!item) throw ApiError.notFound('Product not found.')
    return res.json(ok(item))
  }))
  app.get('/api/stories', asyncHandler(async (req, res) => res.json(ok(await repository.listStories(queryFilters(req))))))
  app.get('/api/stories/:id', asyncHandler(async (req, res) => {
    const item = await repository.getStory(param(req, 'id'))
    if (!item) throw ApiError.notFound('Story not found.')
    return res.json(ok(item))
  }))
  app.get('/api/food', asyncHandler(async (req, res) => res.json(ok(await repository.listFood(queryFilters(req))))))
  app.get('/api/food/recommendations', asyncHandler(async (req, res) => { const query = req.query as unknown as Record<string, unknown>; const language = query.language === 'hi' ? 'hi' : 'en'; const weatherInput = typeof query.weather === 'object' ? query.weather : undefined; return res.json(ok(recommendWeatherFood(weatherInput as undefined, await repository.listFood(), language))) }))
  app.get('/api/food/:id', asyncHandler(async (req, res) => {
    const item = (await repository.listFood()).find((food) => food.id === param(req, 'id') || food.slug === param(req, 'id'))
    if (!item) throw ApiError.notFound('Food record not found.')
    return res.json(ok(item))
  }))

  for (const kind of ['heritage', 'artisans', 'stories', 'products'] as const) {
    app.post(`/api/${kind}`, requireRole('ADMIN', 'VERIFIER'), asyncHandler(async (req, res) => { const result = await writeContent(db, kind, req.body); await audit.record({ actorUserId: req.user!.id, action: 'CREATE', entityType: kind, entityId: String(result.id) }); return res.status(201).json(ok(result)) }))
    app.patch(`/api/${kind}/:id`, requireRole('ADMIN', 'VERIFIER'), asyncHandler(async (req, res) => { const recordId = param(req, 'id'); const result = await writeContent(db, kind, req.body, recordId, 'update'); await audit.record({ actorUserId: req.user!.id, action: 'UPDATE', entityType: kind, entityId: recordId }); return res.json(ok(result)) }))
    app.delete(`/api/${kind}/:id`, requireRole('ADMIN'), asyncHandler(async (req, res) => { const recordId = param(req, 'id'); const result = await deleteContent(db, kind, recordId); await audit.record({ actorUserId: req.user!.id, action: 'DELETE', entityType: kind, entityId: recordId }); return res.json(ok(result)) }))
  }

  app.get('/api/search', asyncHandler(async (req, res) => { const query = queryValue((req.query as Record<string, unknown>).q); if (!query) return res.json(ok({ heritage: [], artisans: [], stories: [], regions: [], products: [], food: [] })); const [heritageItems, artisanItems, storyItems, regionItems, productItems, foodItems] = await Promise.all([repository.listHeritage({ search: query }), repository.listArtisans({ search: query }), repository.listStories({ search: query }), repository.listRegions(), repository.listProducts({ search: query }), repository.listFood({ search: query })]); return res.json(ok({ heritage: heritageItems.slice(0, 6), artisans: artisanItems.slice(0, 6), stories: storyItems.slice(0, 6), regions: regionItems.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())).slice(0, 6), products: productItems.slice(0, 6), food: foodItems.slice(0, 6) })) }))
  app.get('/api/impact', asyncHandler(async (_req, res) => { const [heritageItems, artisanItems, storyItems, productItems, regionItems, hiddenItems, livelihoodItems] = await Promise.all([repository.listHeritage(), repository.listArtisans(), repository.listStories(), repository.listProducts(), repository.listRegions(), repository.listHeritage({ hidden: true }), repository.listLivelihoodRecords()]); return res.json(ok({ heritageEntries: heritageItems.length, artisanProfiles: artisanItems.length, culturalStories: storyItems.length, regionsRepresented: new Set(heritageItems.map((item) => item.regionId)).size || regionItems.length, livingTraditions: heritageItems.filter((item) => ['Folk Culture', 'Community Practice', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Living Heritage', 'Festival'].includes(item.category)).length, hiddenHeritageEntries: hiddenItems.length, productsTracked: productItems.length, productionRecords: livelihoodItems.length, revenueRecords: livelihoodItems.length, businessHealthExamples: artisanItems.length })) }))

  app.get('/api/weather', asyncHandler(async (req, res) => { const query = req.query as unknown as Record<string, unknown>; return res.json(ok(await weather.get(query.latitude, query.longitude))) }))
  app.post('/api/food/recommendations', asyncHandler(async (req, res) => { const language = req.body?.language === 'hi' ? 'hi' : 'en'; return res.json(ok(recommendWeatherFood(req.body?.weather, await repository.listFood(), language))) }))

  app.post('/api/heritage/identify', asyncHandler(async (req, res) => { try { return res.json(ok(identifyHeritage(req.body))) } catch { throw ApiError.badRequest('Could not process this prototype image.', 'IDENTIFICATION_INVALID') } }))
  app.post('/api/ask-jeevant', asyncHandler(async (req, res) => { try { const [heritageItems, storyItems, artisanItems] = await Promise.all([repository.listHeritage(), repository.listStories(), repository.listArtisans()]); return res.json(ok({ ...answerAskJeevant(req.body, heritageItems, storyItems, artisanItems), ai: ai.status })) } catch { throw ApiError.badRequest('Ask Jeevant could not use this context.', 'ASK_CONTEXT_INVALID') } }))

  app.post('/api/trails/generate', asyncHandler(async (req, res) => { const request = validateTrailRequest(req.body); const region = await repository.getRegion(request.regionSlug); if (!region) throw ApiError.badRequest('Choose a supported region.'); const trail = generateTrail({ ...request, regionSlug: region.id }, await repository.listHeritage(), region.name); await repository.saveTrail(trail, req.user?.id); return res.json(ok(trail)) }))
  app.get('/api/trails/:id', asyncHandler(async (req, res) => { const trail = await repository.getTrail(param(req, 'id')); if (!trail) throw ApiError.notFound('Trail not found.'); return res.json(ok(trail)) }))
  app.post('/api/trails', requireAuth(), asyncHandler(async (req, res) => { const request = validateTrailRequest(req.body); const region = await repository.getRegion(request.regionSlug); if (!region) throw ApiError.badRequest('Choose a supported region.'); const trail = generateTrail({ ...request, regionSlug: region.id }, await repository.listHeritage(), region.name); await repository.saveTrail(trail, req.user!.id); await audit.record({ actorUserId: req.user!.id, action: 'CREATE', entityType: 'trail', entityId: trail.id }); return res.status(201).json(ok(trail)) }))
  app.delete('/api/trails/:id', requireAuth(), asyncHandler(async (req, res) => { const trailId = param(req, 'id'); if (!await repository.deleteTrail(trailId, req.user!.id)) throw ApiError.notFound('Trail not found or not owned by this user.'); await audit.record({ actorUserId: req.user!.id, action: 'DELETE', entityType: 'trail', entityId: trailId }); return res.status(204).end() }))

  const authRate = rateLimit({ windowMs: 15 * 60_000, max: 20, keyPrefix: 'auth' })
  app.post('/api/auth/register', authRate, asyncHandler(async (req, res) => res.status(201).json(ok(await auth.register(req.body, res)))))
  app.post('/api/auth/login', authRate, asyncHandler(async (req, res) => { const user = await auth.login(req.body, res); await audit.record({ actorUserId: user.id, action: 'LOGIN', entityType: 'user', entityId: user.id }); return res.json(ok(user)) }))
  app.post('/api/auth/logout', requireAuth(), asyncHandler(async (req, res) => { await auth.logout(req, res); await audit.record({ actorUserId: req.user!.id, action: 'LOGOUT', entityType: 'user', entityId: req.user!.id }); return res.json(ok({ loggedOut: true })) }))
  app.get('/api/auth/me', asyncHandler(async (req, res) => res.json(ok(req.user ?? null))))
  app.post('/api/auth/password-reset/request', authRate, asyncHandler(async (req, res) => res.status(202).json(ok(await auth.requestPasswordReset(req.body)))))
  app.post('/api/auth/email-verification/request', requireAuth(), asyncHandler(async (req, res) => res.status(202).json(ok(await auth.requestEmailVerification(req)))))

  app.get('/api/favorites', requireAuth(), asyncHandler(async (req, res) => res.json(ok(await platform.listFavorites(req.user!.id)))))
  app.post('/api/favorites', requireAuth(), asyncHandler(async (req, res) => res.status(201).json(ok(await platform.addFavorite(req.user!.id, req.body)))))
  app.delete('/api/favorites/:id', requireAuth(), asyncHandler(async (req, res) => { await platform.removeFavorite(req.user!.id, param(req, 'id')); return res.status(204).end() }))

  const privateArtisan = (req: Request) => { const artisanId = param(req, 'id'); if (!canAccessPrivateArtisan(req, artisanId)) throw ApiError.forbidden('Private artisan records are restricted to the artisan, an authorized organization, or an administrator.'); return artisanId }
  app.post('/api/artisans/:id/inventory', requireAuth(), asyncHandler(async (req, res) => { const artisanId = privateArtisan(req); const result = await platform.upsertInventory(artisanId, stringValue(req.body?.productId, 'productId', { required: true })!, req.body); await audit.record({ actorUserId: req.user!.id, action: 'UPDATE', entityType: 'inventory', entityId: result.id }); return res.status(201).json(ok(result)) }))
  app.post('/api/artisans/:id/production', requireAuth(), asyncHandler(async (req, res) => { const artisanId = privateArtisan(req); const result = await platform.addProduction(artisanId, req.body); await audit.record({ actorUserId: req.user!.id, action: 'CREATE', entityType: 'production_record', entityId: result.id }); return res.status(201).json(ok(result)) }))
  app.post('/api/artisans/:id/sales', requireAuth(), asyncHandler(async (req, res) => { const artisanId = privateArtisan(req); const result = await platform.addSale(artisanId, req.body); await audit.record({ actorUserId: req.user!.id, action: 'CREATE', entityType: 'sales_record', entityId: result.id }); return res.status(201).json(ok(result)) }))
  app.post('/api/artisans/:id/expenses', requireAuth(), asyncHandler(async (req, res) => { const artisanId = privateArtisan(req); const result = await platform.addExpense(artisanId, req.body); await audit.record({ actorUserId: req.user!.id, action: 'CREATE', entityType: 'expense_record', entityId: result.id }); return res.status(201).json(ok(result)) }))
  app.post('/api/artisans/:id/verification-request', requireAuth(), asyncHandler(async (req, res) => { const artisanId = param(req, 'id'); const privileged = req.user!.roles.some((role) => ['ADMIN', 'VERIFIER'].includes(role)); const owner = req.user!.roles.includes('ARTISAN') && req.user!.artisanId === artisanId; if (!privileged && !owner) throw ApiError.forbidden(); const result = await platform.requestVerification(artisanId, req.body); await audit.record({ actorUserId: req.user!.id, action: 'VERIFICATION_REQUEST', entityType: 'artisan', entityId: artisanId }); return res.status(201).json(ok(result)) }))
  app.post('/api/verifications/:id/review', requireRole('VERIFIER', 'ADMIN'), asyncHandler(async (req, res) => { const verificationId = param(req, 'id'); const status = stringValue(req.body?.status, 'status', { required: true })!; const result = await platform.reviewVerification(verificationId, req.user!.id, status, stringValue(req.body?.notes, 'notes', { max: 1000 })); await audit.record({ actorUserId: req.user!.id, action: 'VERIFICATION_REVIEW', entityType: 'verification', entityId: verificationId, metadata: { status } }); return res.json(ok(result)) }))

  app.post('/api/submissions', requireAuth(), asyncHandler(async (req, res) => res.status(201).json(ok(await platform.createSubmission(req.user!.id, req.body)))))
  app.get('/api/submissions/:id', requireAuth(), asyncHandler(async (req, res) => { const submissionId = param(req, 'id'); const item = await platform.getSubmission(submissionId, req.user!.roles.includes('ADMIN') ? undefined : req.user!.id); if (!item) throw ApiError.notFound('Submission not found.'); return res.json(ok(item)) }))
  app.patch('/api/submissions/:id', requireRole('VERIFIER', 'ADMIN'), asyncHandler(async (req, res) => { const submissionId = param(req, 'id'); const result = await platform.moderateSubmission(submissionId, stringValue(req.body?.status, 'status', { required: true })!, stringValue(req.body?.notes, 'notes', { max: 1000 })); await audit.record({ actorUserId: req.user!.id, action: 'MODERATE', entityType: 'submission', entityId: submissionId, metadata: { status: result.status } }); return res.json(ok(result)) }))

  app.get('/api/admin/integrations', requireRole('ADMIN'), asyncHandler(async (_req, res) => res.json(ok({ ai: ai.status, media: media.status, payments: { enabled: payments.enabled }, notifications: { enabled: notifications.enabled }, database: db.enabled }))))
  app.post('/api/orders', requireAuth(), asyncHandler(async (_req, _res) => { throw ApiError.unavailable('Commerce is disabled until a payment provider and order workflow are configured.', 'COMMERCE_DISABLED') }))
  app.post('/api/payments/intents', requireAuth(), asyncHandler(async (_req, _res) => payments.createPaymentIntent()))
  app.get('/api/health', asyncHandler(async (_req, res) => res.json({ status: 'ok', service: 'jeevant-virasat-api', database: db.enabled ? 'postgres-configured' : 'in-memory-development-fallback', sessionSecret: config.sessionSecretEphemeral ? 'ephemeral-development-only' : 'configured' })))

  const distDir = join(dirname(fileURLToPath(import.meta.url)), '../dist')
  app.use(express.static(distDir))
  app.use((req, res, next) => { if (req.path.startsWith('/api')) return next(); return res.sendFile(join(distDir, 'index.html'), (error) => { if (error) next() }) })
  app.use((_req, _res, next) => next(ApiError.notFound('API route not found.')))
  app.use((error: unknown, req: Request, res: Response, _next: (error?: unknown) => void) => sendApiError(error, req, res))
  return app
}

export { pageParams }
