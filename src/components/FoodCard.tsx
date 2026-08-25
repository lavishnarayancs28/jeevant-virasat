import { Link } from 'react-router-dom'
import type { HeritageLocation } from '../../shared/types'
import { useLanguage } from '../lib/i18n'
import { ImageFrame, Tag } from './Shared'
import { VerificationStatusBadge } from './Verification'

export function FoodCard({ item }: { item: HeritageLocation }) {
  const { t } = useLanguage()
  const profile = item.foodProfile
  return <article className="food-card"><Link to={`/heritage/${item.slug}`}><ImageFrame src={item.image} alt={`${profile?.dishName ?? item.name}, food prototype image`} className="food-image" /></Link><div className="card-body"><div className="card-meta"><Tag>{t('category.Food')}</Tag>{item.provenance && <VerificationStatusBadge status={item.provenance.verificationStatus} />}</div><Link to={`/heritage/${item.slug}`}><h3>{profile?.dishName ?? item.name}</h3></Link><p>{profile?.culturalStory ?? item.shortDescription}</p><small>{profile?.typicalContext ?? 'Prototype food record'}</small></div></article>
}
