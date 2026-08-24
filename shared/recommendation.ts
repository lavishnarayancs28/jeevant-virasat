import type { HeritageLocation, Trail, TrailRequest, TrailStop } from './types'

const timeBudgets: Record<TrailRequest['timeChoice'], number> = {
  '2 hours': 120,
  'Half day': 300,
  'Full day': 600,
  Weekend: 960,
}

const interestCategories: Record<string, string[]> = {
  History: ['Local History', 'Sacred Tradition', 'Architecture'],
  Food: ['Food'],
  Crafts: ['Craft'],
  Architecture: ['Architecture'],
  Spirituality: ['Sacred Tradition'],
  'Folk Culture': ['Folk Culture', 'Festival', 'Community Practice'],
  Photography: ['Architecture', 'Craft', 'Local History', 'Sacred Tradition'],
  'Local Stories': ['Local History', 'Community Practice', 'Folk Culture', 'Food'],
}

export function validateTrailRequest(input: unknown): TrailRequest {
  if (!input || typeof input !== 'object') throw new Error('Trail preferences are required.')
  const candidate = input as Partial<TrailRequest>
  const validTimes = Object.keys(timeBudgets)
  const validExperiences = ['Quiet & Authentic', 'Cultural & Social', 'Food-focused', 'Photography', 'Deep Historical', 'Local Stories']
  if (!Array.isArray(candidate.interests) || candidate.interests.length === 0) throw new Error('Choose at least one interest.')
  if (!candidate.timeChoice || !validTimes.includes(candidate.timeChoice)) throw new Error('Choose a valid time window.')
  if (!candidate.experienceType || !validExperiences.includes(candidate.experienceType)) throw new Error('Choose an experience preference.')
  if (typeof candidate.regionSlug !== 'string' || !candidate.regionSlug.trim()) throw new Error('Choose a region.')
  return {
    interests: candidate.interests.filter((value): value is string => typeof value === 'string').slice(0, 8),
    timeChoice: candidate.timeChoice,
    experienceType: candidate.experienceType,
    regionSlug: candidate.regionSlug,
  }
}

function scoreLocation(location: HeritageLocation, request: TrailRequest) {
  const wantedCategories = request.interests.flatMap((interest) => interestCategories[interest] ?? [])
  const categoryMatch = wantedCategories.includes(location.category) ? 1 : 0
  const tagMatch = request.interests.reduce((count, interest) => {
    const normalized = interest.toLowerCase()
    return count + (location.tags.some((tag) => tag.toLowerCase().includes(normalized.replace('local ', ''))) ? 1 : 0)
  }, 0)
  const experienceMatch = location.experienceTypes.includes(request.experienceType) ? 1 : 0
  const durationFit = location.durationMinutes <= timeBudgets[request.timeChoice] ? 1 : 0
  const regionMatch = location.regionId === request.regionSlug || location.regionId.endsWith(request.regionSlug) ? 1 : 0
  const score = categoryMatch * 5 + (categoryMatch ? 4 : 0) + tagMatch * 3 + durationFit * 3 + experienceMatch * 2 + regionMatch * 2
  return { score, categoryMatch, tagMatch, experienceMatch, durationFit, regionMatch }
}

export function generateTrail(request: TrailRequest, locations: HeritageLocation[], regionName: string): Trail {
  const budget = timeBudgets[request.timeChoice]
  const ranked = locations
    .filter((location) => location.regionId === request.regionSlug || location.regionId.endsWith(request.regionSlug))
    .map((location) => ({ location, metrics: scoreLocation(location, request) }))
    .sort((a, b) => b.metrics.score - a.metrics.score || a.location.durationMinutes - b.location.durationMinutes)

  const selected: TrailStop[] = []
  let usedMinutes = 0
  for (const item of ranked) {
    if (selected.length >= 5) break
    if (usedMinutes + item.location.durationMinutes > budget) continue
    const relevantInterest = request.interests.find((interest) => {
      const categories = interestCategories[interest] ?? []
      return categories.includes(item.location.category) || item.location.tags.some((tag) => tag.toLowerCase().includes(interest.toLowerCase().replace('local ', '')))
    })
    selected.push({
      ...item.location,
      matchReason: relevantInterest
        ? `Matches your interest in ${relevantInterest.toLowerCase()} through ${item.location.category.toLowerCase()}.`
        : `A complementary ${item.location.category.toLowerCase()} stop for the pace you chose.`,
      distanceFromPreviousKm: selected.length ? Math.round((3.2 + selected.length * 1.7) * 10) / 10 : undefined,
    })
    usedMinutes += item.location.durationMinutes
  }

  return {
    id: `trail-${Date.now().toString(36)}`,
    name: `${regionName} Cultural Trail`,
    regionId: request.regionSlug,
    regionName,
    duration: usedMinutes,
    interests: request.interests,
    experienceType: request.experienceType,
    timeChoice: request.timeChoice,
    stops: selected,
    createdAt: new Date().toISOString(),
  }
}

export const trailTimeBudgets = timeBudgets
