import type { Language } from '../../shared/types'

export function speechLocale(language: Language) {
  return language === 'hi' ? 'hi-IN' : 'en-IN'
}

export function estimateNarrationSeconds(text: string) {
  return Math.max(12, Math.round(text.trim().split(/\s+/).filter(Boolean).length / 2.25))
}

export function formatNarrationTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`
}

export function browserSpeechAvailable() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}
