import { createServer, type Server } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../server/app'
import { loadConfig } from '../server/config/env'
import { calculateBusinessHealth } from '../server/services/platform'

let server: Server
let baseUrl = ''

async function request(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, init)
}

beforeAll(async () => {
  const app = createApp({ config: loadConfig({ NODE_ENV: 'test', PORT: '8788', HOST: '127.0.0.1', FRONTEND_URL: 'http://localhost:5173', APP_URL: 'http://localhost:8788' }) })
  server = createServer(app)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => { const address = server.address(); if (address && typeof address !== 'string') baseUrl = `http://127.0.0.1:${address.port}`; resolve() }))
})

afterAll(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())) })

describe('backend foundation', () => {
  it('serves public content and provenance without authentication', async () => {
    const heritage = await request('/api/heritage')
    expect(heritage.status).toBe(200)
    const provenance = await request('/api/heritage/brahma-sarovar/provenance')
    expect(provenance.status).toBe(200)
    expect((await provenance.json()).data.isPrototype).toBe(false)
    const prices = await request('/api/products/product-pipli-applique-panel/prices')
    expect(prices.status).toBe(200)
    expect((await prices.json()).data[0].label).toContain('prototype')
    const impact = await request('/api/impact')
    expect(impact.status).toBe(200)
    expect((await impact.json()).data.productionRecords).toBeGreaterThan(0)
  })

  it('registers a hashed-password session and protects private records', async () => {
    const registration = await request('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `test-${Date.now()}@example.com`, password: 'secure-passphrase-123', displayName: 'Test User' }) })
    expect(registration.status).toBe(201)
    const cookie = registration.headers.get('set-cookie')
    expect(cookie).toContain('jv_session=')
    const me = await request('/api/auth/me', { headers: { cookie: cookie!.split(';')[0] } })
    expect(me.status).toBe(200)
    expect((await me.json()).data.roles).toContain('USER')
    const privateResponse = await request('/api/artisans/artisan-saroj-devi/financials', { headers: { cookie: cookie!.split(';')[0] } })
    expect(privateResponse.status).toBe(403)
    const privateLivelihood = await request('/api/artisans/artisan-saroj-devi/livelihood', { headers: { cookie: cookie!.split(';')[0] } })
    expect(privateLivelihood.status).toBe(403)
  })

  it('allows favorites for users but never fabricates payment success', async () => {
    const registration = await request('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `favorite-${Date.now()}@example.com`, password: 'secure-passphrase-456' }) })
    const cookie = registration.headers.get('set-cookie')!.split(';')[0]
    const favorite = await request('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ type: 'heritage', targetId: 'heritage-brahma-sarovar' }) })
    expect(favorite.status).toBe(201)
    const payment = await request('/api/payments/intents', { method: 'POST', headers: { cookie } })
    expect(payment.status).toBe(503)
    expect((await payment.json()).error.code).toBe('PAYMENTS_DISABLED')
  })

  it('returns a transparent weather fallback and derives business health', async () => {
    const weather = await request('/api/weather?latitude=29.9&longitude=76.8')
    expect(weather.status).toBe(200)
    expect((await weather.json()).data.available).toBe(false)
    expect(calculateBusinessHealth([{ id: 's', artisanId: 'a', unitsSold: 2, sellingPrice: 100, saleDate: '2026-01-01' }], [{ id: 'e', artisanId: 'a', category: 'material', amount: 250, date: '2026-01-01' }]).health).toBe('NEGATIVE_MARGIN')
  })

  it('stores and deletes an authenticated user trail only through its owner route', async () => {
    const registration = await request('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `trail-${Date.now()}@example.com`, password: 'secure-passphrase-987' }) })
    const cookie = registration.headers.get('set-cookie')!.split(';')[0]
    const trail = await request('/api/trails', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify({ interests: ['Crafts'], timeChoice: 'Half day', experienceType: 'Cultural & Social', regionSlug: 'region-kurukshetra' }) })
    expect(trail.status).toBe(201)
    const trailId = (await trail.json()).data.id
    const deleted = await request(`/api/trails/${trailId}`, { method: 'DELETE', headers: { cookie } })
    expect(deleted.status).toBe(204)
  })
})
