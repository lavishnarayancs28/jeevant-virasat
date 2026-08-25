import type { HeritageLocation, Language, Story } from '../../shared/types'
import { localize } from './i18n'

export type HeritageCopyKey = 'name' | 'shortDescription' | 'description' | 'culturalSignificance' | 'historicalContext' | 'livingToday'

export function heritageCopy(item: HeritageLocation, key: HeritageCopyKey, language: Language) {
  return localize(item.translations?.[key] ?? item[key], language)
}

export function storyCopy(item: Story, key: 'title' | 'excerpt', language: Language) {
  return localize(item.translations?.[key] ?? item[key], language)
}

export function storyContent(item: Story, language: Language) {
  return item.translations?.content?.map((paragraph) => localize(paragraph, language)) ?? item.content
}

export function heritageNarration(item: HeritageLocation, language: Language) {
  return [
    heritageCopy(item, 'name', language),
    heritageCopy(item, 'description', language),
    heritageCopy(item, 'culturalSignificance', language),
    heritageCopy(item, 'livingToday', language),
  ].join(' ')
}

export function storyNarration(item: Story, language: Language) {
  return [storyCopy(item, 'title', language), storyCopy(item, 'excerpt', language), ...storyContent(item, language)].join(' ')
}
