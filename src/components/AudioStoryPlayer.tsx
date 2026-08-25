import { Pause, Play, Square, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Language, LocalizedText } from '../../shared/types'
import { browserSpeechAvailable, estimateNarrationSeconds, formatNarrationTime, speechLocale } from '../lib/audio'
import { localize, useLanguage } from '../lib/i18n'

export function AudioStoryPlayer({ text, compact = false }: { text: LocalizedText; compact?: boolean }) {
  const { language, t } = useLanguage()
  const [audioLanguage, setAudioLanguage] = useState<Language>(language)
  const [state, setState] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [unavailable, setUnavailable] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)
  const narration = localize(text, audioLanguage)
  const duration = useMemo(() => estimateNarrationSeconds(narration), [narration])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const stop = useCallback(() => {
    if (browserSpeechAvailable()) window.speechSynthesis.cancel()
    clearTimer()
    utteranceRef.current = null
    setState('idle')
    setElapsed(0)
  }, [clearTimer])

  useEffect(() => {
    setAudioLanguage(language)
    stop()
    return () => stop()
  }, [language, stop])

  const startTimer = () => {
    clearTimer()
    startedAtRef.current = Date.now() - elapsed * 1000
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.min(duration, (Date.now() - startedAtRef.current) / 1000))
    }, 250)
  }

  const play = () => {
    if (!browserSpeechAvailable()) {
      setUnavailable(true)
      return
    }
    setUnavailable(false)
    if (state === 'paused' && utteranceRef.current) {
      window.speechSynthesis.resume()
      setState('playing')
      startTimer()
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(narration)
    utterance.lang = speechLocale(audioLanguage)
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(audioLanguage))
    if (voice) utterance.voice = voice
    utterance.onstart = () => { setState('playing'); setElapsed(0); startTimer() }
    utterance.onend = () => { clearTimer(); setState('idle'); setElapsed(duration) }
    utterance.onerror = () => { clearTimer(); setState('idle'); setUnavailable(true) }
    utteranceRef.current = utterance
    setElapsed(0)
    window.speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (!browserSpeechAvailable()) return
    window.speechSynthesis.pause()
    clearTimer()
    setState('paused')
  }

  return <section className={`audio-player ${compact ? 'compact' : ''}`} aria-label={t('audio.listen')}>
    <div className="audio-player-head"><div><span className="eyebrow"><Volume2 size={13} /> {t('audio.listen')}</span><p>{t('audio.aiNarration')}</p></div><div className="audio-language" role="group" aria-label={t('language.label')}>
      <button type="button" aria-pressed={audioLanguage === 'en'} onClick={() => { setAudioLanguage('en'); stop() }}>{t('common.english')}</button>
      <button type="button" aria-pressed={audioLanguage === 'hi'} onClick={() => { setAudioLanguage('hi'); stop() }}>{t('common.hindi')}</button>
    </div></div>
    <div className="audio-controls"><button type="button" className="audio-control primary" onClick={state === 'playing' ? pause : play} aria-label={state === 'playing' ? t('audio.pause') : t('audio.play')}>{state === 'playing' ? <Pause size={16} /> : <Play size={16} />}</button><button type="button" className="audio-control" onClick={stop} aria-label={t('audio.stop')}><Square size={14} /></button><div className="audio-progress"><progress max={duration} value={Math.min(duration, elapsed)} aria-label={t('audio.listen')} /><div><span>{formatNarrationTime(elapsed)}</span><span>{formatNarrationTime(duration)}</span></div></div></div>
    {unavailable && <p className="audio-unavailable" role="status">{t('audio.unavailable')}</p>}
    <details className="audio-transcript" open><summary>{t('audio.transcript')} · {audioLanguage === 'hi' ? t('common.hindi') : t('common.english')}</summary><p>{narration}</p></details>
  </section>
}
