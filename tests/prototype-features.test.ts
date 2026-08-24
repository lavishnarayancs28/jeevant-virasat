import { describe, expect, it } from 'vitest'
import { artisans, heritage, hiddenHeritage } from '../shared/data'
import { identifyHeritage } from '../shared/recognition'
import { generateTrail, validateTrailRequest } from '../shared/recommendation'

describe('SIH prototype feature services', () => {
  it('prioritizes hidden entries and explains the selected preferences', () => {
    const request = validateTrailRequest({ interests: ['Crafts', 'Local Stories'], timeChoice: 'Full day', experienceType: 'History & Stories', crowdPreference: 'Hidden Gems', regionSlug: 'region-kurukshetra' })
    const trail = generateTrail(request, heritage, 'Kurukshetra')
    expect(trail.aiAssisted).toBe(true)
    expect(trail.crowdPreference).toBe('Hidden Gems')
    expect(trail.stops.some((stop) => stop.isHidden)).toBe(true)
    expect(trail.stops[0].matchReason).toContain('Crafts + Local Stories')
  })

  it('returns a controlled recognition match and a useful fallback', () => {
    const match = identifyHeritage({ demoKey: 'demo-pipli' })
    const fallback = identifyHeritage({ fileName: 'holiday-photo.png' })
    expect(match.matched).toBe(true)
    expect(match.identified?.slug).toBe('pipli-applique-courtyards')
    expect(fallback.matched).toBe(false)
    expect(fallback.nearby.length).toBeGreaterThan(0)
    expect(fallback.nearby.every((item) => hiddenHeritage.some((hidden) => hidden.id === item.id))).toBe(true)
  })

  it('keeps the expanded Haryana records and prototype relationships grounded', () => {
    const expanded = heritage.filter((item) => ['heritage-panipat-museum', 'heritage-shish-mahal'].includes(item.id))
    expect(expanded).toHaveLength(2)
    expect(expanded.every((item) => item.state === 'Haryana')).toBe(true)
    expect(identifyHeritage({ demoKey: 'demo-panipat-museum' }).identified?.slug).toBe('panipat-museum')
    expect(identifyHeritage({ demoKey: 'demo-shish-mahal' }).identified?.slug).toBe('shish-mahal-farrukhnagar')
    expect(artisans.find((item) => item.id === 'artisan-thanesar-terracotta')?.relatedHeritageIds).toEqual(['heritage-sheikh-chahelis-tomb'])
    expect(artisans.find((item) => item.id === 'artisan-rohtak-ragini')?.relatedHeritageIds).toEqual([])
  })
})
