import { heritage, recognitionExamples } from './data'
import type { HeritageRecognitionResult } from './types'

function normalized(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function identifyHeritage(input: unknown): HeritageRecognitionResult {
  const candidate = input && typeof input === 'object' ? input as { demoKey?: unknown; fileName?: unknown } : {}
  const demoKey = normalized(candidate.demoKey)
  const fileName = normalized(candidate.fileName)
  const example = recognitionExamples.find((item) => item.id === demoKey)
    ?? recognitionExamples.find((item) => fileName && item.keywords.some((keyword) => fileName.includes(keyword)))

  if (!example) {
    return {
      matched: false,
      confidence: 'unmatched',
      message: "We couldn't confidently identify this image in the current prototype dataset.",
      nearby: heritage.filter((item) => item.isHidden).slice(0, 3),
    }
  }

  const identified = heritage.find((item) => item.slug === example.heritageSlug)
  if (!identified) {
    return {
      matched: false,
      confidence: 'unmatched',
      message: "We couldn't confidently identify this image in the current prototype dataset.",
      nearby: [],
    }
  }

  return {
    matched: true,
    confidence: 'prototype match',
    message: `Prototype match: ${identified.name}`,
    identified,
    nearby: heritage.filter((item) => item.regionId === identified.regionId && item.id !== identified.id).slice(0, 3),
  }
}
