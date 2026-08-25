import { describe, expect, it } from 'vitest'
import { answerAskJeevant, detectAskIntent, parseDurationMinutes } from '../shared/ask-jeevant'
import { heritage, stories, artisans } from '../shared/data'
import { heritageTranslations } from '../shared/localized-data'
import { estimateNarrationSeconds, formatNarrationTime, speechLocale } from '../src/lib/audio'
import { heritageCopy } from '../src/lib/content'

describe('Haryana localization records', () => {
  it('keeps bilingual copy for the ten core heritage records', () => {
    const coreIds = [
      'heritage-brahma-sarovar',
      'heritage-jyotisar',
      'heritage-sheikh-chahelis-tomb',
      'heritage-sannihit-sarovar',
      'heritage-raja-karna-qila',
      'heritage-nabha-house',
      'heritage-sthaneshwar-mahadev',
      'heritage-rakhigarhi',
      'heritage-surajkund-crafts-mela',
      'heritage-pinjore-gardens',
    ]
    expect(coreIds.every((id) => heritageTranslations[id]?.name.hi && heritage.find((item) => item.id === id)?.translations?.description.hi)).toBe(true)
    const brahma = heritage.find((item) => item.id === 'heritage-brahma-sarovar')!
    expect(heritageCopy(brahma, 'name', 'hi')).toBe('ब्रह्म सरोवर')
    expect(stories.every((story) => story.translations?.title.hi && story.translations.content.length > 0)).toBe(true)
  })
})

describe('Ask Jeevant grounded service', () => {
  const current = heritage.find((item) => item.id === 'heritage-brahma-sarovar')!

  it('detects grounded intents and reuses the trail request shape', () => {
    expect(detectAskIntent('Why is this place important?')).toBe('WHY_IMPORTANT')
    expect(parseDurationMinutes('Build me a 3 hour trail')).toBe(180)
    const response = answerAskJeevant({ question: 'Build me a 3 hour trail from here.', heritageId: current.id }, heritage, stories, artisans)
    expect(response.confidence).toBe('grounded')
    expect(response.trailRequest?.durationMinutes).toBe(180)
    expect(response.trailRequest?.startingHeritageId).toBe(current.id)
  })

  it('answers Hindi questions in Hindi and refuses unsupported questions honestly', () => {
    const hindi = answerAskJeevant({ question: 'यह स्थान महत्वपूर्ण क्यों है?', heritageId: current.id, language: 'hi' }, heritage, stories, artisans)
    const fallback = answerAskJeevant({ question: 'What is the weather tomorrow?', heritageId: current.id }, heritage, stories, artisans)
    expect(hindi.language).toBe('hi')
    expect(hindi.answer).toContain('ब्रह्म सरोवर')
    expect(fallback.confidence).toBe('fallback')
    expect(fallback.answer).toContain("I don't have enough verified information")
  })

  it('acknowledges unavailable live travel conditions without inventing values', () => {
    const response = answerAskJeevant({ question: 'Is it a good time to visit this place?', heritageId: current.id, travelConditions: { weather: { status: 'UNAVAILABLE' }, traffic: { status: 'UNAVAILABLE' }, recommendation: 'Live weather and traffic are unavailable.' } }, heritage, stories, artisans)
    expect(response.intent).toBe('TRAVEL_CONDITIONS')
    expect(response.answer).toContain('Live weather is unavailable')
    expect(response.answer).toContain('Live traffic unavailable')
  })
})

describe('Audio narration fallback helpers', () => {
  it('provides browser language, duration and transcript timing primitives', () => {
    expect(speechLocale('en')).toBe('en-IN')
    expect(speechLocale('hi')).toBe('hi-IN')
    expect(estimateNarrationSeconds('one two three')).toBe(12)
    expect(formatNarrationTime(75)).toBe('1:15')
  })
})
