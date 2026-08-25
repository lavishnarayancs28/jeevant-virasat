import { ArrowLeft, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { artisans } from '../../shared/data'
import type { Artisan } from '../../shared/types'
import { useResource } from '../lib/api'
import { useLanguage, regionName } from '../lib/i18n'
import { DataProvenance, VerificationQr, VerificationStatusBadge } from './Verification'
import { ImageFrame, LoadingState, StatusNotice } from './Shared'

function DataBanner({ error }: { error: string | null }) { const { t } = useLanguage(); return error ? <StatusNotice>{t('common.apiFallback')}</StatusNotice> : null }

export function ArtisanVerificationPage() {
  const { id } = useParams()
  const { language, t } = useLanguage()
  const fallback = artisans.find((item) => item.id === id)
  const { data: artisan, loading, error } = useResource<Artisan | undefined>(`/api/verify/artisan/${id}`, fallback)
  if (loading && !artisan) return <div className="container page-container"><LoadingState /></div>
  if (!artisan) return <div className="container page-container"><h1>{t('common.noResults')}</h1><p>{t('verification.open')}</p></div>
  const profileId = `JV-HR-${artisan.id.replace(/^artisan-/, '').slice(0, 8).toUpperCase()}`
  return <div className="container page-container verification-page"><Link className="back-link" to={`/artisans/${artisan.slug}`}><ArrowLeft size={15} /> {t('common.back')}</Link><DataBanner error={error} /><section className="verification-hero"><ImageFrame src={artisan.profileImage} alt={`${artisan.name} prototype craft image`} className="verification-image" /><div><span className="eyebrow">{t('verification.record')}</span><h1>{t('verification.title')}</h1><h2>{artisan.name}</h2><div className="verification-status-line"><VerificationStatusBadge status={artisan.verificationStatus} /><strong>{t('verification.statusPrototype')}</strong></div><p className="verification-disclaimer">{t('verification.disclaimer')}</p></div></section><section className="verification-facts"><div><span>{t('verification.profile')}</span><strong>{artisan.name}</strong></div><div><span>{t('verification.craft')}</span><strong>{artisan.craft}</strong></div><div><span>{t('verification.location')}</span><strong><MapPin size={14} /> {artisan.district || regionName(artisan.regionName, language)}, Haryana</strong></div><div><span>{t('verification.profileId')}</span><strong>{profileId}</strong></div><div><span>{t('verification.lastUpdated')}</span><strong>{artisan.lastUpdated}</strong></div><div><span>{t('verification.source')}</span><strong><a href={artisan.sourceUrl} target="_blank" rel="noreferrer">{artisan.source}</a></strong></div></section><div className="verification-actions"><VerificationQr kind="artisan" id={artisan.id} /><Link className="arrow-link" to={`/artisans/${artisan.slug}`}>{t('verification.open')}</Link></div><DataProvenance provenance={artisan.provenance} /></div>
}
