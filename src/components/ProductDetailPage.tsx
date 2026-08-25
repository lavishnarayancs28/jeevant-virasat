import { ArrowLeft, Clock3, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { artisans, heritage, products } from '../../shared/data'
import type { Product } from '../../shared/types'
import { useResource } from '../lib/api'
import { useLanguage } from '../lib/i18n'
import { DataProvenance, VerificationQr, VerificationStatusBadge } from './Verification'
import { ArtisanCard, HeritageCard, ImageFrame, LoadingState, StatusNotice, Tag } from './Shared'

export function ProductDetailPage() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const fallback = products.find((item) => item.slug === slug)
  const { data: product, loading, error } = useResource<Product | undefined>(`/api/products/${slug}`, fallback)
  if (loading && !product) return <div className="container page-container"><LoadingState /></div>
  if (!product) return <div className="container page-container"><h1>{t('common.noResults')}</h1></div>
  const artisan = artisans.find((item) => item.id === product.artisanId)
  const relatedHeritage = heritage.filter((item) => product.relatedHeritageIds.includes(item.id))
  const margin = product.estimatedCost !== undefined && product.referencePrice.max ? ((product.referencePrice.max - product.estimatedCost) / product.referencePrice.max) * 100 : null
  return <div className="container page-container product-detail-page"><Link className="back-link" to="/food"><ArrowLeft size={15} /> {t('common.back')}</Link>{error && <StatusNotice>{t('common.apiFallback')}</StatusNotice>}<section className="product-detail-hero"><ImageFrame src={product.image} alt={`${product.name}, prototype product image`} className="product-detail-image" /><div><Tag>{product.craft}</Tag><h1>{product.name}</h1><p className="product-lede">{product.description}</p><div className="product-detail-meta"><span><MapPin size={14} /> {product.originDistrict}, Haryana</span><span><Tag>{product.referencePrice.kind === 'PROTOTYPE_REFERENCE' ? t('product.pricePrototype') : t('product.referencePrice')}</Tag></span></div><div className="verification-status-line"><VerificationStatusBadge status={product.verificationStatus} /><span>{t('verification.disclaimer')}</span></div><div className="product-detail-actions"><VerificationQr kind="product" id={product.id} />{artisan && <Link className="arrow-link" to={`/artisans/${artisan.slug}`}>{t('product.relatedArtisan')} <ArrowLeft size={14} /></Link>}</div></div></section><div className="product-detail-grid"><article className="editorial-copy"><h2>{t('product.detail')}</h2><p>{product.culturalStory}</p><h3>{t('product.process')}</h3><ol className="process-list">{product.productionProcess.map((step) => <li key={step}>{step}</li>)}</ol><div className="product-financial-note"><div><span>{t('product.referencePrice')}</span><strong>{product.referencePrice.label}</strong></div>{product.estimatedCost !== undefined && <div><span>{t('product.estimatedCost')}</span><strong>₹{product.estimatedCost.toLocaleString('en-IN')}</strong></div>}{margin !== null && <div><span>{t('product.estimatedMargin')}</span><strong>{margin.toFixed(1)}%</strong></div>}</div><p className="prototype-note">{t('product.priceValidation')}</p><h3>{t('product.availability')}</h3><p>{product.availability}</p><DataProvenance provenance={product.provenance} /></article><aside className="product-facts"><div><span>{t('product.origin')}</span><strong>{product.originDistrict}, Haryana</strong></div><div><span>{t('product.material')}</span><strong>{product.material}</strong></div>{product.productionTimeMinutes && <div><span>{t('product.process')}</span><strong><Clock3 size={14} /> {product.productionTimeMinutes} min</strong></div>}</aside></div>{artisan && <section className="related-section"><h2>{t('product.relatedArtisan')}</h2><div className="artisan-grid"><ArtisanCard item={artisan} /></div></section>}{relatedHeritage.length > 0 && <section className="related-section"><h2>{t('heritage.relatedStories')}</h2><div className="heritage-grid">{relatedHeritage.map((item) => <HeritageCard key={item.id} item={item} />)}</div></section>}</div>
}
