import { ArrowLeft, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { artisans, products } from '../../shared/data'
import type { Product } from '../../shared/types'
import { useResource } from '../lib/api'
import { useLanguage } from '../lib/i18n'
import { DataProvenance, VerificationQr, VerificationStatusBadge } from './Verification'
import { ImageFrame, LoadingState, StatusNotice } from './Shared'

export function ProductVerificationPage() {
  const { id } = useParams()
  const { t } = useLanguage()
  const fallback = products.find((item) => item.id === id)
  const { data: product, loading, error } = useResource<Product | undefined>(`/api/verify/product/${id}`, fallback)
  if (loading && !product) return <div className="container page-container"><LoadingState /></div>
  if (!product) return <div className="container page-container"><h1>{t('common.noResults')}</h1></div>
  const artisan = artisans.find((item) => item.id === product.artisanId)
  const profileId = `JV-PR-${product.id.replace(/^product-/, '').slice(0, 8).toUpperCase()}`
  return <div className="container page-container verification-page"><Link className="back-link" to={`/products/${product.slug}`}><ArrowLeft size={15} /> {t('common.back')}</Link>{error && <StatusNotice>{t('common.apiFallback')}</StatusNotice>}<section className="verification-hero"><ImageFrame src={product.image} alt={`${product.name} prototype image`} className="verification-image" /><div><span className="eyebrow">{t('verification.record')}</span><h1>{t('verification.title')}</h1><h2>{product.name}</h2><div className="verification-status-line"><VerificationStatusBadge status={product.verificationStatus} /><strong>{t('verification.statusPrototype')}</strong></div><p className="verification-disclaimer">{t('verification.disclaimer')}</p></div></section><section className="verification-facts"><div><span>{t('verification.profile')}</span><strong>{product.name}</strong></div><div><span>{t('verification.craft')}</span><strong>{product.craft}</strong></div><div><span>{t('verification.location')}</span><strong><MapPin size={14} /> {product.originDistrict}, Haryana</strong></div><div><span>{t('verification.profileId')}</span><strong>{profileId}</strong></div><div><span>{t('verification.lastUpdated')}</span><strong>{product.lastUpdated}</strong></div><div><span>{t('verification.source')}</span><strong><a href={product.sourceUrl} target="_blank" rel="noreferrer">{product.source}</a></strong></div></section><div className="verification-actions"><VerificationQr kind="product" id={product.id} />{artisan && <Link className="arrow-link" to={`/artisans/${artisan.slug}`}>{t('product.relatedArtisan')}</Link>}</div><DataProvenance provenance={product.provenance} /></div>
}
