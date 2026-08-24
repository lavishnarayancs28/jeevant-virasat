export type HeritageCategory =
  | 'Architecture'
  | 'Architectural Heritage'
  | 'Craft'
  | 'Food'
  | 'Folk Culture'
  | 'Sacred Tradition'
  | 'Sacred Heritage'
  | 'Sacred Landscape'
  | 'Local History'
  | 'Archaeological Heritage'
  | 'Museum / Cultural Heritage'
  | 'Living Heritage'
  | 'Festival'
  | 'Community Practice'

export type ExperienceType =
  | 'Quiet & Authentic'
  | 'Quiet & Slow'
  | 'Cultural & Social'
  | 'Food-focused'
  | 'Food & Craft'
  | 'Photography'
  | 'Deep Historical'
  | 'History & Stories'
  | 'Family Friendly'
  | 'Local Stories'

export type TrailTime = '2 hours' | 'Half day' | 'Full day' | 'Weekend'
export type CrowdPreference = 'Popular' | 'Balanced' | 'Hidden Gems'

export interface Region {
  id: string
  name: string
  slug: string
  state: string
  country: string
  description: string
  image: string
  imageSource: string
  imageLicense: string
  sourceUrl: string
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
  district: string
  state: string
  imageSource: string
  imageLicense: string
  imageSourceUrl?: string
  sourceUrl: string
  latitude: number
  longitude: number
  coordinateNote?: string
  durationMinutes: number
  tags: string[]
  experienceTypes: ExperienceType[]
  verifiedStatus: 'Demonstration content' | 'Community source' | 'Research needed' | 'Official source'
  isHidden?: boolean
  hiddenReason?: string
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
  yearsOfExperience?: number
  profileImage: string
  gallery: string[]
  profileImageSource: string
  profileImageLicense: string
  profileSourceUrl?: string
  prototypeStatus: 'Unverified prototype record' | 'Community-reviewed' | 'Verified record'
  specialties: string[]
  relatedHeritageIds: string[]
  contactMethod: string
  workshopAvailability?: string
  skills?: string[]
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
  crowdPreference?: CrowdPreference
  aiAssisted?: boolean
}

export interface TrailStop extends HeritageLocation {
  matchReason: string
  distanceFromPreviousKm?: number
  culturalContext?: string
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
  crowdPreference?: CrowdPreference
}

export interface ImpactMetrics {
  heritageEntries: number
  artisanProfiles: number
  culturalStories: number
  regionsRepresented: number
  livingTraditions: number
  hiddenHeritageEntries: number
}

export interface RecognitionExample {
  id: string
  label: string
  heritageSlug: string
  image: string
  keywords: string[]
}

export interface HeritageRecognitionResult {
  matched: boolean
  message: string
  confidence: 'prototype match' | 'unmatched'
  identified?: HeritageLocation
  nearby: HeritageLocation[]
}
