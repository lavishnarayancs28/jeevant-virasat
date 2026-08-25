import { ArrowRight, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { heritage, artisans, stories } from '../../shared/data'
import { answerAskJeevant } from '../../shared/ask-jeevant'
import type { HeritageLocation, AskJeevantResponse } from '../../shared/types'
import { useLanguage } from '../lib/i18n'
import { heritageCopy, storyCopy } from '../lib/content'
import { apiRequest } from '../lib/api'
import { AudioStoryPlayer } from './AudioStoryPlayer'
import { FoodCard } from './FoodCard'
import { CTAButton, HeritageCard, StatusNotice, Tag } from './Shared'

const suggestedQuestions = [
  { en: 'Why is this place important?', hi: 'यह जगह महत्वपूर्ण क्यों है?', value: 'Why is this place important?' },
  { en: 'Tell me its story.', hi: 'इसकी कहानी बताइए।', value: 'Tell me its story.' },
  { en: 'What can I explore nearby?', hi: 'आसपास क्या देख सकता हूँ?', value: 'What can I explore nearby?' },
  { en: 'Explain this in Hindi.', hi: 'इसे हिंदी में समझाइए।', value: 'Explain this in Hindi.' },
  { en: 'Build me a 3 hour trail from here.', hi: 'यहाँ से 3 घंटे का मार्ग बनाएँ।', value: 'Build me a 3 hour trail from here.' },
  { en: 'What living heritage is nearby?', hi: 'आसपास कौन-सी जीवित विरासत है?', value: 'What living heritage is nearby?' },
  { en: 'What should I eat today?', hi: 'आज मुझे क्या खाना चाहिए?', value: 'What should I eat today?' },
]

export function AskJeevant({ item }: { item: HeritageLocation }) {
  const { language, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<AskJeevantResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const relatedPlaces = useMemo(() => response ? heritage.filter((place) => response.relatedHeritageIds.includes(place.id)) : [], [response])
  const relatedStories = useMemo(() => response ? stories.filter((story) => response.relatedStoryIds.includes(story.id)) : [], [response])
  const relatedArtisans = useMemo(() => response ? artisans.filter((artisan) => response.relatedArtisanIds.includes(artisan.id)) : [], [response])
  const relatedFood = useMemo(() => response?.foodRecordIds ? heritage.filter((place) => response.foodRecordIds?.includes(place.id)) : [], [response])
  const trailHref = response?.trailRequest ? `/trails/create?heritage=${item.slug}&durationMinutes=${response.trailRequest.durationMinutes}` : `/trails/create?heritage=${item.slug}`

  const ask = async (value = question) => {
    const trimmed = value.trim()
    if (!trimmed || busy) return
    setQuestion(trimmed)
    setBusy(true)
    setError('')
    try {
      const next = await apiRequest<AskJeevantResponse>('/api/ask-jeevant', { method: 'POST', body: JSON.stringify({ question: trimmed, heritageId: item.id, language }) })
      setResponse(next)
    } catch {
      setResponse(answerAskJeevant({ question: trimmed, heritageId: item.id, language }, heritage, stories, artisans))
      setError(language === 'hi' ? 'एपीआई उपलब्ध नहीं है, इसलिए स्थानीय ग्राउंडेड उत्तर दिखाया जा रहा है।' : 'The API is unavailable, so a local grounded response is being shown.')
    } finally {
      setBusy(false)
    }
  }

  return <>
    <button type="button" className="button secondary ask-trigger" onClick={() => setOpen(true)}><Sparkles size={16} /> {t('ask.button')}</button>
    {open && <div className="modal-backdrop ask-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <section className="ask-panel" role="dialog" aria-modal="true" aria-labelledby="ask-jeevant-title">
        <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label={t('common.close')}><X size={18} /></button>
        <span className="eyebrow"><Sparkles size={13} /> {t('ask.button')}</span>
        <h2 id="ask-jeevant-title">{t('ask.button')}</h2>
        <p className="ask-subtitle">{t('ask.subtitle')}</p>
        <div className="ask-context"><span>{t('ask.exploring')}</span><strong>{heritageCopy(item, 'name', language)}, {item.regionName}</strong></div>
        {!response && <div className="ask-suggestions"><span>{t('ask.suggested')}</span>{suggestedQuestions.map((suggestion) => <button type="button" key={suggestion.value} onClick={() => ask(suggestion.value)}>{language === 'hi' ? suggestion.hi : suggestion.en}<ArrowRight size={14} /></button>)}</div>}
        <form className="ask-form" onSubmit={(event) => { event.preventDefault(); void ask() }}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t('ask.placeholder')} aria-label={t('ask.placeholder')} /><button type="submit" className="button primary" disabled={busy} aria-label={t('ask.send')}>{busy ? <span className="loading-dot" /> : <Send size={16} />}<span>{t('ask.send')}</span></button></form>
        <div className="ask-response" aria-live="polite">
          {busy && <div className="loading-state"><span className="loading-dot" />{t('ask.thinking')}</div>}
          {!busy && response && <>
            <div className="ask-response-head"><Tag tone={response.confidence === 'grounded' ? 'success' : ''}>{response.confidence === 'grounded' ? t('ask.grounded') : t('common.noResults')}</Tag><span>{response.language === 'hi' ? t('common.hindi') : t('common.english')}</span></div>
            <p className="ask-answer"><strong>{t('ask.answerLabel')}:</strong> {response.answer}</p>
            {response.weatherContext && <div className="ask-context ask-weather-context"><strong>{t('ask.weatherContext')}:</strong> <span>{response.weatherContext.condition ? t(`weather.${response.weatherContext.condition}`, response.weatherContext.condition) : t('weather.unavailable')}</span>{response.weatherContext.location && <span> · {response.weatherContext.location}</span>}<small>{response.weatherContext.source === 'user-provided' ? (language === 'hi' ? 'उपयोगकर्ता द्वारा दिया गया संदर्भ' : 'User-provided context') : ''}</small></div>}
            {response.suggestedTiming && <div className="ask-context ask-timing"><strong>{t('ask.suggestedTiming')}:</strong> <span>{response.suggestedTiming}</span></div>}
            <AudioStoryPlayer text={response.answers} compact />
            {relatedPlaces.length > 0 && <div className="ask-related"><h3>{language === 'hi' ? 'संबंधित विरासत' : 'Related heritage'}</h3><div className="ask-card-grid">{relatedPlaces.slice(0, 2).map((place) => <HeritageCard key={place.id} item={place} compact />)}</div></div>}
            {relatedFood.length > 0 && <div className="ask-related"><h3>{language === 'hi' ? 'मौसम के अनुसार भोजन रिकॉर्ड' : 'Weather-aware food record'}</h3><div className="ask-food-grid">{relatedFood.map((food) => <FoodCard key={food.id} item={food} />)}</div></div>}
            {relatedStories.length > 0 && <div className="ask-links"><strong>{language === 'hi' ? 'कहानी पढ़ें' : 'Read the story'}</strong>{relatedStories.map((story) => <a key={story.id} href={`/stories/${story.slug}`}>{storyCopy(story, 'title', language)} <ArrowRight size={14} /></a>)}</div>}
            {relatedArtisans.length > 0 && <div className="ask-links"><strong>{language === 'hi' ? 'संबंधित कारीगर रिकॉर्ड' : 'Related artisan records'}</strong>{relatedArtisans.map((artisan) => <a key={artisan.id} href={`/artisans/${artisan.slug}`}>{artisan.name} <ArrowRight size={14} /></a>)}</div>}
            <div className="ask-actions"><CTAButton to={trailHref}>{response.trailRequest ? t('ask.buildTrail') : t('home.buildTrail')}</CTAButton>{response.relatedHeritageIds.slice(0, 1).map((placeId) => { const place = heritage.find((candidate) => candidate.id === placeId); return place ? <a className="arrow-link" key={place.id} href={`/heritage/${place.slug}`}>{t('ask.explore', heritageCopy(place, 'name', language), { place: heritageCopy(place, 'name', language) })} <ArrowRight size={14} /></a> : null })}</div>
          </>}
          {error && <StatusNotice>{error}</StatusNotice>}
        </div>
      </section>
    </div>}
  </>
}
