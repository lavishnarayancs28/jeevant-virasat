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
export type Language = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as' | 'ur'
export type VerificationStatus = 'VERIFIED' | 'COMMUNITY_VERIFIED' | 'PROTOTYPE' | 'PENDING_VERIFICATION'

export type LocalizedText = { en: string } & Partial<Record<Exclude<Language, 'en'>, string>>

export interface HeritageTranslations {
  name: LocalizedText
  shortDescription: LocalizedText
  description: LocalizedText
  culturalSignificance: LocalizedText
  historicalContext: LocalizedText
  livingToday: LocalizedText
}

export interface StoryTranslations {
  title: LocalizedText
  excerpt: LocalizedText
  content: LocalizedText[]
}

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
  translations?: HeritageTranslations
  provenance?: DataProvenance
  foodProfile?: FoodProfile
}

export interface DataProvenance {
  source: string
  sourceUrl: string
  verificationStatus: VerificationStatus
  lastUpdated: string
  isPrototype: boolean
  imageSource?: string
  imageLicense?: string
}

export interface FoodProfile {
  dishName: string
  culturalStory: string
  weatherSuitability: string[]
  typicalContext: string
  isPrototype: boolean
  provenance: DataProvenance
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
  district: string
  verificationStatus: VerificationStatus
  verificationDate: string
  verificationSource: string
  verifierType: string
  profileVersion: string
  source: string
  sourceUrl: string
  lastUpdated: string
  isPrototype: boolean
  provenance: DataProvenance
}

export interface PriceReference {
  kind: 'SOURCED' | 'PROTOTYPE_REFERENCE'
  label: string
  min?: number
  max?: number
  unit: string
  source?: string
  sourceUrl?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  craft: string
  originDistrict: string
  regionName: string
  description: string
  culturalStory: string
  productionProcess: string[]
  image: string
  material: string
  productionTimeMinutes?: number
  availability: string
  referencePrice: PriceReference
  estimatedCost?: number
  verificationStatus: VerificationStatus
  isPrototype: boolean
  source: string
  sourceUrl: string
  lastUpdated: string
  provenance: DataProvenance
  artisanId: string
  relatedHeritageIds: string[]
}

export interface LivelihoodRecordInput {
  artisanId: string
  period: string
  productionUnits: number
  unitsSold: number
  averageSellingPrice: number
  materialCost: number
  labourCost: number
  transportCost: number
  otherCosts: number
  source: string
  isPrototype: boolean
}

export interface LivelihoodRecord extends LivelihoodRecordInput {
  revenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number | null
}

export type BusinessHealth = 'POSITIVE_MARGIN' | 'LOW_MARGIN' | 'NEGATIVE_MARGIN' | 'INSUFFICIENT_DATA'

export interface WeatherObservation {
  temperature?: number
  precipitationProbability?: number
  condition?: 'hot' | 'warm' | 'mild' | 'cold' | 'rain' | 'unknown'
  location?: string
  timestamp?: string
  source?: 'live' | 'user-provided' | 'unavailable'
}

export interface WeatherFoodRecommendation {
  weather: WeatherObservation
  message: string
  foodRecordIds: string[]
  available: boolean
}

export interface Story {
  id: string
  title: string
  translations?: StoryTranslations
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
  durationMinutes?: number
  startingHeritageId?: string
}

export interface ImpactMetrics {
  heritageEntries: number
  artisanProfiles: number
  culturalStories: number
  regionsRepresented: number
  livingTraditions: number
  hiddenHeritageEntries: number
  productsTracked: number
  productionRecords: number
  revenueRecords: number
  businessHealthExamples: number
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

export type AskIntent = 'WHY_IMPORTANT' | 'STORY' | 'NEARBY' | 'LANGUAGE' | 'TRAIL' | 'LIVING_HERITAGE' | 'ARTISAN' | 'FOOD' | 'WEATHER_FOOD' | 'GENERAL_HERITAGE'

export interface AskJeevantRequest {
  question: string
  heritageId: string
  language?: Language
  interests?: string[]
  crowdPreference?: CrowdPreference
  durationMinutes?: number
  location?: string
  weather?: WeatherObservation
}

export interface AskJeevantResponse {
  intent: AskIntent
  language: Language
  answer: string
  answers: LocalizedText
  confidence: 'grounded' | 'fallback'
  relatedHeritageIds: string[]
  relatedStoryIds: string[]
  relatedArtisanIds: string[]
  foodRecordIds?: string[]
  weatherContext?: WeatherObservation
  suggestedTiming?: string
  trailRequest?: TrailRequest
}
