import { describe, expect, it } from 'vitest'
import { answerAskJeevant, detectAskIntent } from '../shared/ask-jeevant'
import { artisans, heritage, livelihoodRecords, products, stories } from '../shared/data'
import { calculateLivelihood, classifyBusinessHealth } from '../shared/livelihood'
import { recommendWeatherFood } from '../shared/weather-food'
import { verificationPath } from '../src/lib/verification'

describe('verification and provenance records', () => {
  it('keeps current artisan records explicitly prototype', () => {
    expect(artisans.length).toBeGreaterThan(0)
    expect(artisans.every((artisan) => artisan.verificationStatus === 'PROTOTYPE' && artisan.isPrototype && artisan.provenance.isPrototype)).toBe(true)
    expect(artisans.every((artisan) => artisan.district && artisan.source && artisan.lastUpdated && artisan.profileVersion)).toBe(true)
  })

  it('generates record-scoped QR paths without implying identity certification', () => {
    expect(verificationPath('artisan', 'artisan-pipli-applique')).toBe('/verify/artisan/artisan-pipli-applique')
    expect(verificationPath('heritage', 'heritage-brahma-sarovar')).toBe('/verify/heritage/heritage-brahma-sarovar')
    expect(verificationPath('product', 'product-pipli-applique-panel')).toBe('/verify/product/product-pipli-applique-panel')
  })

  it('attaches provenance to heritage and food records', () => {
    expect(heritage.every((item) => item.provenance?.source && item.provenance.sourceUrl && item.provenance.lastUpdated)).toBe(true)
    const food = heritage.find((item) => item.category === 'Food')
    expect(food?.foodProfile?.isPrototype).toBe(true)
    expect(food?.foodProfile?.provenance.verificationStatus).toBe('PENDING_VERIFICATION')
  })
})

describe('transparent livelihood calculations', () => {
  it('calculates revenue, costs, gross profit and margin from inputs', () => {
    const record = calculateLivelihood({ artisanId: 'a', period: '2026-08', productionUnits: 20, unitsSold: 10, averageSellingPrice: 500, materialCost: 1200, labourCost: 1000, transportCost: 200, otherCosts: 100, source: 'Illustrative prototype data', isPrototype: true })
    expect(record.revenue).toBe(5000)
    expect(record.totalCost).toBe(2500)
    expect(record.grossProfit).toBe(2500)
    expect(record.profitMargin).toBe(50)
  })

  it('classifies positive, low, negative and insufficient business health', () => {
    expect(classifyBusinessHealth(100, 50)).toBe('POSITIVE_MARGIN')
    expect(classifyBusinessHealth(100, 10)).toBe('LOW_MARGIN')
    expect(classifyBusinessHealth(100, -1)).toBe('NEGATIVE_MARGIN')
    expect(classifyBusinessHealth(0, 0)).toBe('INSUFFICIENT_DATA')
    expect(livelihoodRecords.every((record) => record.isPrototype && record.source === 'Illustrative prototype data')).toBe(true)
  })
})

describe('products and weather-aware food', () => {
  it('keeps product relationships grounded in existing artisan records', () => {
    expect(products.length).toBeGreaterThan(0)
    expect(products.every((product) => artisans.some((artisan) => artisan.id === product.artisanId))).toBe(true)
    expect(products.every((product) => product.referencePrice.kind === 'PROTOTYPE_REFERENCE' && product.isPrototype)).toBe(true)
  })

  it('returns an honest missing-weather fallback and a cultural hot-weather suggestion', () => {
    const food = heritage.filter((item) => item.category === 'Food')
    const unavailable = recommendWeatherFood(undefined, food, 'en')
    expect(unavailable.available).toBe(false)
    expect(unavailable.message).toContain('unavailable right now')
    const recommendation = recommendWeatherFood({ condition: 'hot', location: 'Kurukshetra', source: 'user-provided' }, food, 'en')
    expect(recommendation.available).toBe(true)
    expect(recommendation.foodRecordIds.length).toBeGreaterThan(0)
    expect(recommendation.message).toContain('cultural suggestion, not medical advice')
  })

  it('combines weather, time, heritage and food in Ask Jeevant', () => {
    const current = heritage.find((item) => item.id === 'heritage-brahma-sarovar')!
    expect(detectAskIntent('2 hours in Kurukshetra. It is hot. What should I do and eat?')).toBe('WEATHER_FOOD')
    const response = answerAskJeevant({ question: '2 hours in Kurukshetra. It is hot. What should I do and eat?', heritageId: current.id }, heritage, stories, artisans)
    expect(response.intent).toBe('WEATHER_FOOD')
    expect(response.trailRequest?.durationMinutes).toBe(120)
    expect(response.weatherContext?.condition).toBe('hot')
    expect(response.foodRecordIds?.length).toBeGreaterThan(0)
    expect(response.answer).toContain('cultural suggestion')
  })
})
