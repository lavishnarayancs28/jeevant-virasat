import { Compass, HeartHandshake, ShieldCheck, WalletCards } from 'lucide-react'
import { artisans, heritage, hiddenHeritage, livelihoodRecords, products, stories } from '../../shared/data'
import type { ImpactMetrics } from '../../shared/types'
import { useResource } from '../lib/api'
import { useLanguage } from '../lib/i18n'
import { Eyebrow, LoadingState, SectionHeading, StatusNotice } from './Shared'

const localImpactMetrics: ImpactMetrics = {
  heritageEntries: heritage.length,
  artisanProfiles: artisans.length,
  culturalStories: stories.length,
  regionsRepresented: new Set(heritage.map((item) => item.regionId)).size,
  livingTraditions: heritage.filter((item) => ['Folk Culture', 'Community Practice', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Living Heritage', 'Festival'].includes(item.category)).length,
  hiddenHeritageEntries: hiddenHeritage.length,
  productsTracked: products.length,
  productionRecords: livelihoodRecords.length,
  revenueRecords: livelihoodRecords.length,
  businessHealthExamples: artisans.length,
}

const metricCards: Array<{ key: keyof ImpactMetrics; label: string }> = [
  { key: 'heritageEntries', label: 'impact.metricHeritage' },
  { key: 'artisanProfiles', label: 'impact.metricArtisans' },
  { key: 'culturalStories', label: 'impact.metricStories' },
  { key: 'regionsRepresented', label: 'impact.metricRegions' },
  { key: 'livingTraditions', label: 'impact.metricLiving' },
  { key: 'hiddenHeritageEntries', label: 'impact.metricHidden' },
  { key: 'productsTracked', label: 'impact.productsTracked' },
  { key: 'productionRecords', label: 'impact.productionRecords' },
  { key: 'revenueRecords', label: 'impact.revenueRecords' },
  { key: 'businessHealthExamples', label: 'impact.businessHealthExamples' },
]

export function ImpactDashboard({ compact = false }: { compact?: boolean }) {
  const { language, t } = useLanguage()
  const { data, loading, error } = useResource<ImpactMetrics>('/api/impact', localImpactMetrics)
  return <section className={`impact-dashboard ${compact ? 'compact' : ''}`}>
    <SectionHeading eyebrow={t('impact.eyebrow')} title={language === 'hi' ? 'सांस्कृतिक प्रभाव' : 'Cultural Impact'} body={t('impact.coverage')} />
    {error && <StatusNotice>{t('common.apiFallback')}</StatusNotice>}
    {loading && <LoadingState label={t('impact.counting')} />}
    <div className="impact-metrics">{metricCards.map((metric) => <div className="impact-metric" key={metric.key}><strong>{data[metric.key]}</strong><span>{t(metric.label)}</span></div>)}</div>
    <div className="impact-pillars"><article><Compass size={21} /><Eyebrow>{t('impact.discover')}</Eyebrow><h3>{t('impact.discoverTitle')}</h3><p>{t('impact.discoverBody')}</p></article><article><HeartHandshake size={21} /><Eyebrow>{t('impact.connect')}</Eyebrow><h3>{t('impact.connectTitle')}</h3><p>{t('impact.connectBody')}</p></article><article><ShieldCheck size={21} /><Eyebrow>{t('impact.preserve')}</Eyebrow><h3>{t('impact.preserveTitle')}</h3><p>{t('impact.preserveBody')}</p></article><article><WalletCards size={21} /><Eyebrow>{t('impact.livelihood')}</Eyebrow><h3>{t('impact.livelihoodTitle')}</h3><p>{t('impact.livelihoodBody')}</p></article></div>
    {!compact && <p className="impact-footnote">{t('impact.footnote')}</p>}
  </section>
}
