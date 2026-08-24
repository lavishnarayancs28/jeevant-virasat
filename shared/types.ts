export type HeritageCategory =
  | 'Architecture'
  | 'Craft'
  | 'Food'
  | 'Folk Culture'
  | 'Sacred Tradition'
  | 'Local History'
  | 'Festival'
  | 'Community Practice'

export type ExperienceType =
  | 'Quiet & Authentic'
  | 'Cultural & Social'
  | 'Food-focused'
  | 'Photography'
  | 'Deep Historical'
  | 'Local Stories'

export type TrailTime = '2 hours' | 'Half day' | 'Full day' | 'Weekend'

export interface Region {
  id: string
  name: string
  slug: string
  state: string
  country: string
  description: string
  image: string
  latitude: number
  longitude: number
}

export interface HeritageLocation {
  id: string
  regionId: string
  regionName: string
  name: string
  slug: string
  category: HeritageCategory
  shortDescription: string
  description: string
  culturalSignificance: string
  historicalContext: string
  livingToday: string
  image: string
  gallery: string[]
  latitude: number
  longitude: number
  durationMinutes: number
  tags: string[]
  experienceTypes: ExperienceType[]
  verifiedStatus: 'Demonstration content' | 'Community source' | 'Research needed'
}

export interface Artisan {
  id: string
  name: string
  slug: string
  craft: string
  regionId: string
  regionName: string
  location: string
  biography: string
  craftStory: string
  yearsOfExperience: number
  profileImage: string
  gallery: string[]
  specialties: string[]
  relatedHeritageIds: string[]
  contactMethod: string
}

export interface Story {
  id: string
  title: string
  slug: string
  regionId: string
  regionName: string
  category: string
  excerpt: string
  content: string[]
  image: string
  relatedHeritageIds: string[]
  relatedArtisanIds: string[]
}

export interface Trail {
  id: string
  name: string
  regionId: string
  regionName: string
  duration: number
  interests: string[]
  experienceType: ExperienceType
  timeChoice: TrailTime
  stops: TrailStop[]
  createdAt: string
}

export interface TrailStop extends HeritageLocation {
  matchReason: string
  distanceFromPreviousKm?: number
}

export interface SearchResults {
  heritage: HeritageLocation[]
  artisans: Artisan[]
  stories: Story[]
  regions: Region[]
}

export interface TrailRequest {
  interests: string[]
  timeChoice: TrailTime
  experienceType: ExperienceType
  regionSlug: string
}
