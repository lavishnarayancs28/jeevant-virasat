import { ArrowLeft, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { heritage } from '../../shared/data'
import type { HeritageLocation } from '../../shared/types'
import { useResource } from '../lib/api'
import { useLanguage } from '../lib/i18n'
import { DataProvenance, VerificationQr, VerificationStatusBadge } from './Verification'
import { ImageFrame, LoadingState, StatusNotice } from './Shared'

export function HeritageVerificationPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const fallback = heritage.find((item) => item.id === id)
  const { data: item, loading, error } = useResource<HeritageLocation | undefined>(`/api/verify/heritage/${id}`, fallback)
  if (loading && !item) return <div className="container page-container"><LoadingState /></div>
  if (!item) return <div className="container page-container"><h1>{t('common.noResults')}</h1></div>
  const provenance = item.provenance ?? { source: item.verifiedStatus, sourceUrl: item.sourceUrl, verificationStatus: 'PROTOTYPE' as const, lastUpdated: '2026-08-25', isPrototype: true, imageSource: item.imageSource, imageLicense: item.imageLicense }
  const profileId = `JV-HE-${item.id.replace(/^heritage-/, '').slice(0, 8).toUpperCase()}`
  return <div className="container page-container verification-page"><Link className="back-link" to={`/heritage/${item.slug}`}><ArrowLeft size={15} /> {t('common.back')}</Link>{error && <StatusNotice>{t('common.apiFallback')}</StatusNotice>}<section className="verification-hero"><ImageFrame src={item.image} alt={`${item.name} prototype heritage image`} className="verification-image" /><div><span className="eyebrow">{t('verification.record')}</span><h1>{t('verification.title')}</h1><h2>{item.name}</h2><div className="verification-status-line"><VerificationStatusBadge status={provenance.verificationStatus} /><strong>{provenance.isPrototype ? t('verification.statusPrototype') : t('verification.statusVerified')}</strong></div>{provenance.isPrototype && <p className="verification-disclaimer">{t('verification.disclaimer')}</p>}</div></section><section className="verification-facts"><div><span>{t('verification.profile')}</span><strong>{item.name}</strong></div><div><span>{t('verification.craft')}</span><strong>{item.category}</strong></div><div><span>{t('verification.location')}</span><strong><MapPin size={14} /> {item.district}, Haryana</strong></div><div><span>{t('verification.profileId')}</span><strong>{profileId}</strong></div><div><span>{t('verification.lastUpdated')}</span><strong>{provenance.lastUpdated}</strong></div><div><span>{t('verification.source')}</span><strong><a href={provenance.sourceUrl} target="_blank" rel="noreferrer">{provenance.source}</a></strong></div></section><div className="verification-actions"><VerificationQr kind="heritage" id={item.id} /><Link className="arrow-link" to={`/heritage/${item.slug}`}>{t('verification.open')}</Link></div><DataProvenance provenance={provenance} /></div>
}
