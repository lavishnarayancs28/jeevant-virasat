import { describe, expect, it } from 'vitest'
import { heritage } from '../shared/data'
import { generateTrail, validateTrailRequest } from '../server/recommendation'

describe('rule-based trail recommendation', () => {
  it('matches craft and food interests while respecting a half-day budget', () => {
    const request = validateTrailRequest({ interests: ['Crafts', 'Food', 'Local Stories'], timeChoice: 'Half day', experienceType: 'Cultural & Social', regionSlug: 'region-kurukshetra' })
    const trail = generateTrail(request, heritage, 'Kurukshetra')
    expect(trail.stops.length).toBeGreaterThan(0)
    expect(trail.duration).toBeLessThanOrEqual(300)
    expect(trail.stops.some((stop) => stop.category === 'Craft')).toBe(true)
    expect(trail.stops.some((stop) => stop.category === 'Food')).toBe(true)
  })

  it('rejects an empty interest selection', () => {
    expect(() => validateTrailRequest({ interests: [], timeChoice: '2 hours', experienceType: 'Photography', regionSlug: 'region-kurukshetra' })).toThrow('Choose at least one interest')
  })

  it('returns a bounded selection for a short window', () => {
    const request = validateTrailRequest({ interests: ['Photography'], timeChoice: '2 hours', experienceType: 'Quiet & Authentic', regionSlug: 'region-kurukshetra' })
    const trail = generateTrail(request, heritage, 'Kurukshetra')
    expect(trail.duration).toBeLessThanOrEqual(120)
    expect(trail.stops.length).toBeGreaterThan(0)
  })
})
