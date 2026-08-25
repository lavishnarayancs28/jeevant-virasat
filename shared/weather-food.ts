import type { FoodProfile, HeritageLocation, Language, WeatherFoodRecommendation, WeatherObservation } from './types'

export function conditionFromQuestion(question: string): WeatherObservation['condition'] {
  const value = question.toLowerCase()
  if (/rain|raining|बारिश|वर्षा/.test(value)) return 'rain'
  if (/hot|heat|गर्मी|गरम/.test(value)) return 'hot'
  if (/cold|winter|ठंड|सर्द/.test(value)) return 'cold'
  if (/warm|उष्ण/.test(value)) return 'warm'
  return undefined
}

function localizedWeatherLabel(condition: WeatherObservation['condition'], language: Language) {
  const labels = { hot: { en: 'hot weather', hi: 'गर्म मौसम' }, warm: { en: 'warm weather', hi: 'गरम मौसम' }, cold: { en: 'cold weather', hi: 'ठंडा मौसम' }, rain: { en: 'rain', hi: 'बारिश' }, mild: { en: 'mild weather', hi: 'सौम्य मौसम' }, unknown: { en: 'the current weather', hi: 'वर्तमान मौसम' } }
  return labels[condition ?? 'unknown'][language]
}

export function recommendWeatherFood(weather: WeatherObservation | undefined, foodRecords: HeritageLocation[], language: Language): WeatherFoodRecommendation {
  if (!weather || (!weather.condition && weather.temperature === undefined && weather.precipitationProbability === undefined)) {
    return { weather: { source: 'unavailable' }, message: language === 'hi' ? 'मौसम की जानकारी अभी उपलब्ध नहीं है, इसलिए मौसम-आधारित भोजन सुझाव नहीं दिया जा सकता।' : 'Weather-aware recommendations are unavailable right now.', foodRecordIds: [], available: false }
  }
  const condition = weather.condition ?? (weather.temperature !== undefined && weather.temperature >= 30 ? 'hot' : weather.temperature !== undefined && weather.temperature <= 15 ? 'cold' : 'mild')
  const matching = foodRecords.filter((record) => record.foodProfile?.weatherSuitability.some((value) => value === condition || value === 'all'))
  const selected = (matching.length ? matching : foodRecords).slice(0, 3)
  const names = selected.map((record) => record.foodProfile?.dishName ?? record.name).join(', ')
  const label = localizedWeatherLabel(condition, language)
  const message = language === 'hi'
    ? `आज के ${label} को देखते हुए, आप ${names || 'स्थानीय भोजन रिकॉर्ड'} देख सकते हैं। यह सांस्कृतिक सुझाव है, चिकित्सीय सलाह नहीं।`
    : `Given today's ${label}, you may enjoy exploring ${names || 'the available local food record'}. This is a cultural suggestion, not medical advice.`
  return { weather: { ...weather, condition }, message, foodRecordIds: selected.map((record) => record.id), available: true }
}

export function weatherProfileForFood(record: HeritageLocation): FoodProfile | undefined {
  return record.foodProfile
}
