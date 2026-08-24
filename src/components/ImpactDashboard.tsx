import { Compass, HeartHandshake, ShieldCheck } from 'lucide-react'
import { artisans, heritage, hiddenHeritage, stories } from '../../shared/data'
import type { ImpactMetrics } from '../../shared/types'
import { useResource } from '../lib/api'
import { Eyebrow, LoadingState, SectionHeading, StatusNotice } from './Shared'

const localImpactMetrics: ImpactMetrics = {
  heritageEntries: heritage.length,
  artisanProfiles: artisans.length,
  culturalStories: stories.length,
  regionsRepresented: new Set(heritage.map((item) => item.regionId)).size,
  livingTraditions: heritage.filter((item) => ['Folk Culture', 'Community Practice', 'Sacred Tradition'].includes(item.category)).length,
  hiddenHeritageEntries: hiddenHeritage.length,
}

const metricCards: Array<{ key: keyof ImpactMetrics; label: string }> = [
  { key: 'heritageEntries', label: 'Heritage entries mapped' },
  { key: 'artisanProfiles', label: 'Artisan profiles' },
  { key: 'culturalStories', label: 'Cultural stories' },
  { key: 'regionsRepresented', label: 'Regions represented' },
  { key: 'livingTraditions', label: 'Living traditions' },
  { key: 'hiddenHeritageEntries', label: 'Hidden-heritage prototype entries' },
]

export function ImpactDashboard({ compact = false }: { compact?: boolean }) {
  const { data, loading, error } = useResource<ImpactMetrics>('/api/impact', localImpactMetrics)
  return <section className={`impact-dashboard ${compact ? 'compact' : ''}`}>
    <SectionHeading eyebrow="Prototype Dataset Coverage" title="Cultural Impact" body="A transparent view of what this demonstration dataset currently makes discoverable." />
    {error && <StatusNotice>API unavailable — showing metrics derived from the local demonstration dataset.</StatusNotice>}
    {loading && <LoadingState label="Counting the prototype dataset…" />}
    <div className="impact-metrics">{metricCards.map((metric) => <div className="impact-metric" key={metric.key}><strong>{data[metric.key]}</strong><span>{metric.label}</span></div>)}</div>
    <div className="impact-pillars"><article><Compass size={21} /><Eyebrow>Discover</Eyebrow><h3>Find the quieter cultural routes.</h3><p>Helping travelers find lesser-known cultural experiences in the prototype dataset.</p></article><article><HeartHandshake size={21} /><Eyebrow>Connect</Eyebrow><h3>Meet the people behind practice.</h3><p>Connecting travelers with artisans and cultural practitioners through respectful context.</p></article><article><ShieldCheck size={21} /><Eyebrow>Preserve</Eyebrow><h3>Keep stories in motion.</h3><p>Making cultural stories and living traditions easier to discover and document.</p></article></div>
    {!compact && <p className="impact-footnote">These are prototype dataset counts, not real-world impact statistics.</p>}
  </section>
}
