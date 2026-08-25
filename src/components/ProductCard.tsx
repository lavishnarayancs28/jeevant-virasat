import { Clock3, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../shared/types'
import { useLanguage } from '../lib/i18n'
import { ImageFrame, Tag } from './Shared'
import { VerificationStatusBadge } from './Verification'

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage()
  return <article className="product-card"><Link to={`/products/${product.slug}`}><ImageFrame src={product.image} alt={`${product.name}, prototype product image`} className="product-image" /></Link><div className="card-body"><div className="card-meta"><Tag>{product.craft}</Tag><VerificationStatusBadge status={product.verificationStatus} /></div><Link to={`/products/${product.slug}`}><h3>{product.name}</h3></Link><p>{product.description}</p><div className="product-meta"><span><MapPin size={13} /> {product.originDistrict}, Haryana</span>{product.productionTimeMinutes && <span><Clock3 size={13} /> {product.productionTimeMinutes} min</span>}</div><small className="prototype-label">{product.referencePrice.kind === 'PROTOTYPE_REFERENCE' ? t('product.pricePrototype') : t('product.referencePrice')}</small></div></article>
}
