import express from 'express'
import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { artisans, heritage, regions, sampleTrails, stories } from '../shared/data'
import type { Artisan, HeritageLocation, Region, Story } from '../shared/types'
import { generateTrail, validateTrailRequest } from './recommendation'

const app = express()
const port = Number(process.env.PORT ?? 8787)
const host = process.env.HOST ?? '0.0.0.0'
const trailStore = new Map(sampleTrails.map((trail) => [trail.id, trail]))
const distDir = join(dirname(fileURLToPath(import.meta.url)), '../dist')

app.use(express.json({ limit: '100kb' }))

const ok = <T>(data: T) => ({ data })
const fail = (message: string, status = 400) => ({ error: message, status })
const bySlug = <T extends { slug: string }>(items: T[], slug: string) => items.find((item) => item.slug === slug)

function queryText(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function matchesText(item: HeritageLocation | Artisan | Story | Region, query: string) {
  return JSON.stringify(item).toLowerCase().includes(query)
}

app.get('/api/regions', (_req, res) => res.json(ok(regions)))
app.get('/api/regions/:slug', (req, res) => {
  const region = bySlug(regions, req.params.slug)
  return region ? res.json(ok(region)) : res.status(404).json(fail('Region not found.', 404))
})

app.get('/api/heritage', (req, res) => {
  const search = queryText(req.query.search)
  const region = queryText(req.query.region)
  const category = queryText(req.query.category)
  const duration = queryText(req.query.duration)
  const sort = queryText(req.query.sort)
  let result = heritage.filter((item) => {
    const matchesRegion = !region || item.regionId.endsWith(region) || item.regionName.toLowerCase() === region
    const matchesCategory = !category || item.category.toLowerCase() === category
    const matchesSearch = !search || matchesText(item, search)
    const matchesDuration = !duration || (duration === 'short' ? item.durationMinutes <= 90 : duration === 'medium' ? item.durationMinutes <= 180 : item.durationMinutes > 180)
    return matchesRegion && matchesCategory && matchesSearch && matchesDuration
  })
  if (sort === 'duration') result = [...result].sort((a, b) => a.durationMinutes - b.durationMinutes)
  if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name))
  return res.json(ok(result))
})
app.get('/api/heritage/:slug', (req, res) => {
  const item = bySlug(heritage, req.params.slug)
  return item ? res.json(ok(item)) : res.status(404).json(fail('Heritage location not found.', 404))
})

app.get('/api/artisans', (req, res) => {
  const search = queryText(req.query.search)
  const region = queryText(req.query.region)
  const result = artisans.filter((item) => (!search || matchesText(item, search)) && (!region || item.regionId.endsWith(region) || item.regionName.toLowerCase() === region))
  return res.json(ok(result))
})
app.get('/api/artisans/:slug', (req, res) => {
  const item = bySlug(artisans, req.params.slug)
  return item ? res.json(ok(item)) : res.status(404).json(fail('Artisan not found.', 404))
})

app.get('/api/stories', (req, res) => {
  const search = queryText(req.query.search)
  const region = queryText(req.query.region)
  const result = stories.filter((item) => (!search || matchesText(item, search)) && (!region || item.regionId.endsWith(region) || item.regionName.toLowerCase() === region))
  return res.json(ok(result))
})
app.get('/api/stories/:slug', (req, res) => {
  const item = bySlug(stories, req.params.slug)
  return item ? res.json(ok(item)) : res.status(404).json(fail('Story not found.', 404))
})

app.get('/api/search', (req, res) => {
  const search = queryText(req.query.q)
  if (!search) return res.json(ok({ heritage: [], artisans: [], stories: [], regions: [] }))
  return res.json(ok({
    heritage: heritage.filter((item) => matchesText(item, search)).slice(0, 6),
    artisans: artisans.filter((item) => matchesText(item, search)).slice(0, 6),
    stories: stories.filter((item) => matchesText(item, search)).slice(0, 6),
    regions: regions.filter((item) => matchesText(item, search)).slice(0, 6),
  }))
})

app.post('/api/trails/generate', (req, res) => {
  try {
    const request = validateTrailRequest(req.body)
    const region = regions.find((candidate: Region) => candidate.slug === request.regionSlug || candidate.id === request.regionSlug)
    if (!region) return res.status(400).json(fail('Choose a supported region.'))
    const trail = generateTrail({ ...request, regionSlug: region.id }, heritage, region.name)
    trailStore.set(trail.id, trail)
    return res.json(ok(trail))
  } catch (error) {
    return res.status(400).json(fail(error instanceof Error ? error.message : 'Could not generate trail.'))
  }
})
app.get('/api/trails/:id', (req, res) => {
  const trail = trailStore.get(req.params.id)
  return trail ? res.json(ok(trail)) : res.status(404).json(fail('Trail not found.', 404))
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'jeevant-virasat-api' }))

// In production, the same process can serve the Vite output and keep SPA routes
// working on refresh. Development still uses Vite's dev server and proxy.
app.use(express.static(distDir))
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  return res.sendFile(join(distDir, 'index.html'), (error) => {
    if (error) next()
  })
})
app.use((_req, res) => res.status(404).json(fail('API route not found.', 404)))

createServer(app).listen(port, host, () => {
  console.log(`Jeevant Virasat server listening on ${host}:${port}`)
})
