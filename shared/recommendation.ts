import type { HeritageLocation, Trail, TrailRequest, TrailStop } from './types'

const timeBudgets: Record<TrailRequest['timeChoice'], number> = {
  '2 hours': 120,
  'Half day': 300,
  'Full day': 600,
  Weekend: 960,
}

const interestCategories: Record<string, string[]> = {
  History: ['Local History', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Archaeological Heritage', 'Architecture', 'Architectural Heritage'],
  Food: ['Food'],
  Crafts: ['Craft'],
  Architecture: ['Architecture', 'Architectural Heritage', 'Museum / Cultural Heritage'],
  Spirituality: ['Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape'],
  'Folk Culture': ['Folk Culture', 'Festival', 'Community Practice', 'Living Heritage'],
  Photography: ['Architecture', 'Architectural Heritage', 'Craft', 'Local History', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Archaeological Heritage'],
  'Local Stories': ['Local History', 'Community Practice', 'Folk Culture', 'Food', 'Archaeological Heritage'],
  'Local Food': ['Food'],
  'Living Traditions': ['Folk Culture', 'Community Practice', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Living Heritage', 'Festival'],
  'Spiritual/Cultural': ['Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Community Practice'],
}

export function validateTrailRequest(input: unknown): TrailRequest {
  if (!input || typeof input !== 'object') throw new Error('Trail preferences are required.')
  const candidate = input as Partial<TrailRequest>
  const validTimes = Object.keys(timeBudgets)
  const validExperiences = ['Quiet & Authentic', 'Cultural & Social', 'Food-focused', 'Photography', 'Deep Historical', 'Local Stories', 'Quiet & Slow', 'Food & Craft', 'History & Stories', 'Family Friendly']
  const validCrowdPreferences = ['Popular', 'Balanced', 'Hidden Gems']
  if (!Array.isArray(candidate.interests) || candidate.interests.length === 0) throw new Error('Choose at least one interest.')
  if (!candidate.timeChoice || !validTimes.includes(candidate.timeChoice)) throw new Error('Choose a valid time window.')
  if (!candidate.experienceType || !validExperiences.includes(candidate.experienceType)) throw new Error('Choose an experience preference.')
  if (typeof candidate.regionSlug !== 'string' || !candidate.regionSlug.trim()) throw new Error('Choose a region.')
  if (candidate.crowdPreference && !validCrowdPreferences.includes(candidate.crowdPreference)) throw new Error('Choose a valid crowd preference.')
  return {
    interests: candidate.interests.filter((value): value is string => typeof value === 'string').slice(0, 8),
    timeChoice: candidate.timeChoice,
    experienceType: candidate.experienceType,
    regionSlug: candidate.regionSlug,
    crowdPreference: candidate.crowdPreference,
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
  const regionMatch = location.regionId === request.regionSlug || location.regionId.endsWith(request.regionSlug) || (request.regionSlug.endsWith('haryana') && location.state === 'Haryana') ? 1 : 0
  const hiddenMatch = location.isHidden ? 1 : 0
  const crowdMatch = request.crowdPreference === 'Hidden Gems' ? hiddenMatch : request.crowdPreference === 'Popular' ? (hiddenMatch ? 0 : 1) : 0
  const score = categoryMatch * 5 + (categoryMatch ? 4 : 0) + tagMatch * 3 + durationFit * 3 + experienceMatch * 2 + regionMatch * 2 + crowdMatch * 4
  return { score, categoryMatch, tagMatch, experienceMatch, durationFit, regionMatch, hiddenMatch }
}

export function generateTrail(request: TrailRequest, locations: HeritageLocation[], regionName: string): Trail {
  const budget = timeBudgets[request.timeChoice]
  const ranked = locations
    .filter((location) => location.regionId === request.regionSlug || location.regionId.endsWith(request.regionSlug) || (request.regionSlug.endsWith('haryana') && location.state === 'Haryana'))
    .map((location) => ({ location, metrics: scoreLocation(location, request) }))
    .sort((a, b) => b.metrics.score - a.metrics.score || a.location.durationMinutes - b.location.durationMinutes)

  const selected: TrailStop[] = []
  let usedMinutes = 0
  for (const item of ranked) {
    if (selected.length >= 5) break
    if (usedMinutes + item.location.durationMinutes > budget) continue
    const relevantInterests = request.interests.filter((interest) => {
      const categories = interestCategories[interest] ?? []
      return categories.includes(item.location.category) || item.location.tags.some((tag) => tag.toLowerCase().includes(interest.toLowerCase().replace('local ', '')))
    })
    const interestSummary = request.interests.slice(0, 3).join(' + ')
    const crowdSummary = request.crowdPreference === 'Hidden Gems'
      ? ' and prefer hidden experiences'
      : request.crowdPreference === 'Popular'
        ? ' and prefer popular places'
        : request.crowdPreference === 'Balanced'
          ? ' and prefer a balanced mix'
          : ''
    selected.push({
      ...item.location,
      matchReason: relevantInterests.length
        ? `Recommended because you selected ${interestSummary}${crowdSummary}. This stop brings those interests into ${item.location.category.toLowerCase()}.`
        : `Recommended as a complementary ${item.location.category.toLowerCase()} stop for the pace you chose${crowdSummary}.`,
      distanceFromPreviousKm: selected.length ? Math.round((3.2 + selected.length * 1.7) * 10) / 10 : undefined,
      culturalContext: item.location.culturalSignificance,
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
    crowdPreference: request.crowdPreference,
    aiAssisted: true,
  }
}

export const trailTimeBudgets = timeBudgets
