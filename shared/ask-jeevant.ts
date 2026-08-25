import type { Artisan, AskIntent, AskJeevantRequest, AskJeevantResponse, HeritageLocation, Language, LocalizedText, Story, TrailRequest, WeatherObservation } from './types'
import { conditionFromQuestion, recommendWeatherFood } from './weather-food'

const livingCategories = ['Folk Culture', 'Community Practice', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Living Heritage', 'Festival']

function text(item: HeritageLocation, key: 'name' | 'shortDescription' | 'description' | 'culturalSignificance' | 'historicalContext' | 'livingToday', language: Language) {
  const value = item.translations?.[key] ?? item[key]
  return typeof value === 'string' ? value : value[language] || value.en
}

function storyText(item: Story, key: 'title' | 'excerpt', language: Language) {
  const value = item.translations?.[key] ?? item[key]
  return typeof value === 'string' ? value : value[language] || value.en
}

function normalize(question: string) {
  return question.trim().toLowerCase()
}

export function detectAskIntent(question: string): AskIntent {
  const value = normalize(question)
  if (/\bwhy\b|\bimportant\b|\bsignificance\b|महत्व|क्यों|महत्त्व/.test(value)) return 'WHY_IMPORTANT'
  if (/\bstory\b|\bhistory\b|\btell me\b|कहानी|कथा|इतिहास|बताओ/.test(value)) return 'STORY'
  if (/\bnearby\b|\baround\b|\bclose\b|\bexplore\b|पास|आसपास|नज़दीक|करीब/.test(value)) return 'NEARBY'
  if (/\bhindi\b|हिंदी|\benglish\b|अंग्रेज़ी|भाषा|\btranslate\b|\bexplain this in\b/.test(value)) return 'LANGUAGE'
  if ((/weather|today|hot|cold|rain|गर्मी|ठंड|बारिश|आज/.test(value)) && /\bfood\b|\beat\b|\btaste\b|भोजन|खाना|स्वाद/.test(value)) return 'WEATHER_FOOD'
  if (/\btrail\b|\broute\b|\bhour\b|\bhours\b|\bhr\b|घंटा|घंटे|मार्ग|यात्रा बन|रास्ता/.test(value)) return 'TRAIL'
  if (/\bliving heritage\b|\btradition\b|\bpractice\b|जीवित विरासत|परंपरा|प्रथा/.test(value)) return 'LIVING_HERITAGE'
  if (/\bartisan\b|\bmaker\b|\bcraftsperson\b|कारीगर|निर्माता|शिल्पकार|शिल्प/.test(value)) return 'ARTISAN'
  if (/\bfood\b|\beat\b|\btaste\b|भोजन|खाना|स्वाद/.test(value)) return 'FOOD'
  return 'GENERAL_HERITAGE'
}

function requestedLanguage(question: string, fallback: Language): Language {
  const value = normalize(question)
  return /hindi|हिंदी|देवनागरी|हिन्दी/.test(value) || /[\u0900-\u097f]/.test(value) ? 'hi' : fallback
}

function weatherFromQuestion(question: string): WeatherObservation | undefined {
  const condition = conditionFromQuestion(question)
  return condition ? { condition, source: 'user-provided', timestamp: new Date().toISOString() } : undefined
}

export function parseDurationMinutes(question: string) {
  const match = normalize(question).match(/(\d+)\s*(?:hour|hours|hr|घंटे?|घंटों)/)
  if (!match) return undefined
  const minutes = Number(match[1]) * 60
  return minutes >= 60 && minutes <= 960 ? minutes : undefined
}

function nearbyFor(current: HeritageLocation, heritage: HeritageLocation[]) {
  return heritage
    .filter((item) => item.id !== current.id && item.regionId === current.regionId)
    .sort((a, b) => Math.hypot(a.latitude - current.latitude, a.longitude - current.longitude) - Math.hypot(b.latitude - current.latitude, b.longitude - current.longitude))
    .slice(0, 3)
}

function localizedPair(en: string, hi: string): LocalizedText { return { en, hi } }

function trailRequestFor(current: HeritageLocation, request: AskJeevantRequest, durationMinutes?: number): TrailRequest {
  const minutes = durationMinutes ?? 300
  return {
    interests: request.interests?.length ? request.interests.slice(0, 3) : ['Local Stories'],
    timeChoice: minutes <= 120 ? '2 hours' : minutes <= 300 ? 'Half day' : 'Full day',
    experienceType: 'Local Stories',
    regionSlug: current.regionId,
    crowdPreference: request.crowdPreference ?? 'Balanced',
    durationMinutes: minutes,
    startingHeritageId: current.id,
  }
}

function fallbackResponse(language: Language): AskJeevantResponse {
  const answers = localizedPair(
    "I don't have enough verified information about that yet. Try asking about this place, nearby heritage, its story or a cultural trail.",
    'मेरे पास अभी उसके बारे में पर्याप्त सत्यापित जानकारी नहीं है। इस स्थान, आसपास की विरासत, इसकी कहानी या सांस्कृतिक मार्ग के बारे में पूछें.',
  )
  return { intent: 'GENERAL_HERITAGE', language, answer: answers[language], answers, confidence: 'fallback', relatedHeritageIds: [], relatedStoryIds: [], relatedArtisanIds: [] }
}

export function answerAskJeevant(input: AskJeevantRequest, heritage: HeritageLocation[], stories: Story[], artisans: Artisan[]): AskJeevantResponse {
  const question = typeof input.question === 'string' ? input.question.trim().slice(0, 500) : ''
  const current = heritage.find((item) => item.id === input.heritageId || item.slug === input.heritageId)
  const language = requestedLanguage(question, input.language === 'hi' ? 'hi' : 'en')
  if (!question || !current) return fallbackResponse(language)

  const intent = detectAskIntent(question)
  const sameRegion = nearbyFor(current, heritage)
  const relatedStories = stories.filter((story) => story.relatedHeritageIds.includes(current.id)).slice(0, 2)
  const relatedArtisans = artisans.filter((artisan) => artisan.relatedHeritageIds.includes(current.id) || artisan.regionId === current.regionId).slice(0, 3)
  const livingNearby = sameRegion.filter((item) => livingCategories.includes(item.category)).slice(0, 3)
  const foodNearby = sameRegion.filter((item) => item.category === 'Food').slice(0, 2)
  const nameEn = text(current, 'name', 'en')
  const nameHi = text(current, 'name', 'hi')
  const nearbyEn = sameRegion.map((item) => text(item, 'name', 'en')).join(', ')
  const nearbyHi = sameRegion.map((item) => text(item, 'name', 'hi')).join(', ')

  let answers: LocalizedText
  let responseTrail: TrailRequest | undefined
  let relatedHeritageIds = sameRegion.map((item) => item.id)
  const relatedStoryIds = relatedStories.map((story) => story.id)
  const relatedArtisanIds = relatedArtisans.map((artisan) => artisan.id)
  let foodRecordIds: string[] = []
  let weatherContext: WeatherObservation | undefined
  let suggestedTiming: string | undefined

  if (intent === 'WHY_IMPORTANT') {
    answers = localizedPair(
      `${nameEn} matters in the current prototype dataset because ${text(current, 'culturalSignificance', 'en')}`,
      `${nameHi} का महत्व वर्तमान प्रोटोटाइप डेटा में इसलिए है क्योंकि ${text(current, 'culturalSignificance', 'hi')}`,
    )
  } else if (intent === 'STORY') {
    const story = relatedStories[0]
    answers = story
      ? localizedPair(`${storyText(story, 'title', 'en')}: ${storyText(story, 'excerpt', 'en')}`, `${storyText(story, 'title', 'hi')}: ${storyText(story, 'excerpt', 'hi')}`)
      : localizedPair(`${nameEn}: ${text(current, 'historicalContext', 'en')}`, `${nameHi}: ${text(current, 'historicalContext', 'hi')}`)
  } else if (intent === 'NEARBY') {
    answers = sameRegion.length
      ? localizedPair(`The current dataset places ${nameEn} in the same Haryana region as ${nearbyEn}. Explore the linked records for context; the prototype does not claim a measured walking distance.`, `वर्तमान डेटा ${nameHi} को हरियाणा के उसी क्षेत्र में ${nearbyHi} के साथ रखता है। संदर्भ के लिए जुड़े रिकॉर्ड देखें; प्रोटोटाइप चलने की मापी हुई दूरी का दावा नहीं करता।`)
      : fallbackResponse(language).answers
  } else if (intent === 'LANGUAGE') {
    answers = localizedPair(`In Hindi: ${text(current, 'shortDescription', 'en')}`, `हिंदी में: ${text(current, 'shortDescription', 'hi')}`)
  } else if (intent === 'TRAIL') {
    const durationMinutes = parseDurationMinutes(question)
    responseTrail = trailRequestFor(current, input, durationMinutes)
    answers = localizedPair(
      `${nameEn} can anchor a ${durationMinutes ? `${durationMinutes / 60}-hour` : 'half-day'} cultural trail in the current prototype. Use the existing trail builder to generate the route from this place.`,
      `${nameHi} वर्तमान प्रोटोटाइप में ${durationMinutes ? `${durationMinutes / 60} घंटे` : 'आधे दिन'} के सांस्कृतिक मार्ग का आधार बन सकता है। इसी स्थान से मार्ग बनाने के लिए मौजूदा मार्ग निर्माता का उपयोग करें।`,
    )
  } else if (intent === 'LIVING_HERITAGE') {
    answers = livingNearby.length
      ? localizedPair(`Nearby living-heritage records in the dataset include ${livingNearby.map((item) => text(item, 'name', 'en')).join(', ')}. Each record should be read with its own access and cultural guidance.`, `डेटा में आसपास की जीवित विरासत के रिकॉर्ड में ${livingNearby.map((item) => text(item, 'name', 'hi')).join(', ')} शामिल हैं। हर रिकॉर्ड के साथ उसके अपने पहुँच और सांस्कृतिक निर्देश पढ़ें।`)
      : fallbackResponse(language).answers
    relatedHeritageIds = livingNearby.map((item) => item.id)
  } else if (intent === 'ARTISAN') {
    answers = relatedArtisans.length
      ? localizedPair(`The current dataset links this context to prototype maker records including ${relatedArtisans.map((artisan) => artisan.name).join(', ')}. These are not verified personal profiles.`, `वर्तमान डेटा इस संदर्भ को ${relatedArtisans.map((artisan) => artisan.name).join(', ')} जैसे प्रोटोटाइप निर्माता रिकॉर्ड से जोड़ता है। ये सत्यापित व्यक्तिगत प्रोफ़ाइल नहीं हैं।`)
      : fallbackResponse(language).answers
  } else if (intent === 'WEATHER_FOOD') {
    weatherContext = input.weather ?? weatherFromQuestion(question)
    const recommendation = recommendWeatherFood(weatherContext, sameRegion.filter((item) => item.category === 'Food'), language)
    foodRecordIds = recommendation.foodRecordIds
    relatedHeritageIds = [current.id, ...recommendation.foodRecordIds]
    const duration = parseDurationMinutes(question)
    suggestedTiming = duration ? (language === 'hi' ? `${duration} मिनट: पहले स्थल, फिर मौसम के अनुसार भोजन रिकॉर्ड देखें।` : `${duration} minutes: visit the heritage stop first, then explore the weather-aware food record.`) : (language === 'hi' ? 'पहले शांत विरासत अनुभव लें, फिर स्थानीय भोजन रिकॉर्ड देखें।' : 'Start with a considered heritage stop, then explore the local food record.')
    if (duration) responseTrail = trailRequestFor(current, input, duration)
    const stop = text(current, 'name', language)
    const foodRecord = sameRegion.find((item) => item.id === foodRecordIds[0])
    const foodName = foodRecord ? text(foodRecord, 'name', language) : (language === 'hi' ? 'स्थानीय भोजन रिकॉर्ड' : 'the local food record')
    answers = localizedPair(`${stop} is the heritage stop to anchor this visit. ${recommendation.message} The available food record is ${foodName}. ${suggestedTiming}`, `${stop} इस यात्रा का विरासत पड़ाव हो सकता है। ${recommendation.message} उपलब्ध भोजन रिकॉर्ड ${foodName} है। ${suggestedTiming}`)
  } else if (intent === 'FOOD') {
    answers = foodNearby.length
      ? localizedPair(`The current region has a food record for ${foodNearby.map((item) => text(item, 'name', 'en')).join(', ')}. It is a prototype prompt for local documentation, not a restaurant recommendation.`, `वर्तमान क्षेत्र में ${foodNearby.map((item) => text(item, 'name', 'hi')).join(', ')} का भोजन रिकॉर्ड है। यह स्थानीय दस्तावेज़ीकरण के लिए प्रोटोटाइप संकेत है, रेस्तराँ की अनुशंसा नहीं।`)
      : fallbackResponse(language).answers
    relatedHeritageIds = foodNearby.map((item) => item.id)
  } else {
    const datasetKeywords = /heritage|place|site|culture|visit|देख|स्थान|विरासत|संस्कृति|यात्रा|यह/.test(normalize(question))
    if (!datasetKeywords) return fallbackResponse(language)
    answers = localizedPair(`${nameEn} is described in the current prototype as ${text(current, 'shortDescription', 'en')} The record also notes: ${text(current, 'livingToday', 'en')}`, `${nameHi} का वर्तमान प्रोटोटाइप विवरण है: ${text(current, 'shortDescription', 'hi')} रिकॉर्ड यह भी बताता है: ${text(current, 'livingToday', 'hi')}`)
  }

  return {
    intent,
    language,
    answer: answers[language],
    answers,
    confidence: 'grounded',
    relatedHeritageIds,
    relatedStoryIds,
    relatedArtisanIds,
    ...(foodRecordIds.length ? { foodRecordIds } : {}),
    ...(weatherContext ? { weatherContext } : {}),
    ...(suggestedTiming ? { suggestedTiming } : {}),
    ...(responseTrail ? { trailRequest: responseTrail } : {}),
  }
}
