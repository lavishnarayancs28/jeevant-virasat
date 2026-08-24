import { Bookmark, Check, Clock3, MapPin, ArrowUpRight, Heart, Leaf, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Artisan, HeritageLocation, Story } from '../../shared/types'
import type { FavoriteRecord } from '../lib/favorites'

export function ImageFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return <div className={`image-frame ${className}`} style={{ backgroundImage: `linear-gradient(135deg, rgba(30,50,53,.22), rgba(191,108,66,.35)), url(${src})` }} role="img" aria-label={alt} />
}

export function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow">{children}</span> }
export function Tag({ children, tone = '' }: { children: React.ReactNode; tone?: string }) { return <span className={`tag ${tone}`}>{children}</span> }
export function ArrowLink({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) { return <Link className={`arrow-link ${className}`} to={to}>{children} <ArrowUpRight size={15} /></Link> }

export function SectionHeading({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: React.ReactNode }) {
  return <div className="section-heading">
    <div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{body && <p>{body}</p>}</div>
    {action}
  </div>
}

export function StatusNotice({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'error' | 'success' }) { return <div className={`status-notice ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div> }
export function LoadingState({ label = 'Gathering the next story…' }: { label?: string }) { return <div className="loading-state"><span className="loading-dot" />{label}</div> }
export function EmptyState({ title = 'Nothing here yet', body = 'Try widening your search or choosing another route.' }: { title?: string; body?: string }) { return <div className="empty-state"><Leaf size={24} /><h3>{title}</h3><p>{body}</p></div> }

export function FavoriteButton({ favorite, active, onToggle }: { favorite: FavoriteRecord; active: boolean; onToggle: (favorite: FavoriteRecord) => void }) {
  return <button className={`favorite-button ${active ? 'active' : ''}`} onClick={() => onToggle(favorite)} aria-pressed={active} aria-label={active ? `Remove ${favorite.label} from favorites` : `Save ${favorite.label} to favorites`}><Heart size={16} fill={active ? 'currentColor' : 'none'} /> <span>{active ? 'Saved' : 'Save'}</span></button>
}

export function HeritageCard({ item, favorite, compact = false, showHiddenNote = false }: { item: HeritageLocation; favorite?: { active: boolean; onToggle: (favorite: FavoriteRecord) => void }; compact?: boolean; showHiddenNote?: boolean }) {
  const record: FavoriteRecord = { kind: 'heritage', id: item.id, label: item.name, href: `/heritage/${item.slug}`, image: item.image }
  return <article className={`heritage-card ${compact ? 'compact' : ''}`}>
      <Link to={`/heritage/${item.slug}`} aria-label={`Read ${item.name}`}><ImageFrame src={item.image} alt={`${item.name}, ${item.district}, ${item.state}`} className="card-image" /></Link>
    <div className="card-body"><div className="card-meta"><Tag>{item.category}</Tag><span><Clock3 size={13} /> {item.durationMinutes} min</span></div>
      <Link to={`/heritage/${item.slug}`}><h3>{item.name}</h3></Link><p>{item.shortDescription}</p>{showHiddenNote && item.isHidden && <div className="hidden-card-note"><strong>Why explore this?</strong><span>{item.hiddenReason ?? 'Less-known in our prototype dataset.'}</span></div>}
      <div className="card-footer"><span className="muted"><MapPin size={13} /> {item.regionName}</span>{favorite && <FavoriteButton favorite={record} active={favorite.active} onToggle={favorite.onToggle} />}</div>
    </div>
  </article>
}

export function ArtisanCard({ item, favorite }: { item: Artisan; favorite?: { active: boolean; onToggle: (favorite: FavoriteRecord) => void } }) {
  const record: FavoriteRecord = { kind: 'artisan', id: item.id, label: item.name, href: `/artisans/${item.slug}`, image: item.profileImage }
    return <article className="artisan-card"><Link to={`/artisans/${item.slug}`}><ImageFrame src={item.profileImage} alt={`Prototype image for ${item.craft}; no person depicted`} className="portrait-image" /></Link><div className="card-body"><div className="card-meta"><Tag tone="success">{item.prototypeStatus}</Tag></div><span className="card-kicker">{item.craft}</span><Link to={`/artisans/${item.slug}`}><h3>{item.name}</h3></Link><p>{item.biography}</p><div className="card-footer"><span className="muted"><MapPin size={13} /> {item.location}</span>{favorite && <FavoriteButton favorite={record} active={favorite.active} onToggle={favorite.onToggle} />}</div></div></article>
}

export function StoryCard({ item, favorite }: { item: Story; favorite?: { active: boolean; onToggle: (favorite: FavoriteRecord) => void } }) {
  const record: FavoriteRecord = { kind: 'story', id: item.id, label: item.title, href: `/stories/${item.slug}`, image: item.image }
  return <article className="story-card"><Link to={`/stories/${item.slug}`}><ImageFrame src={item.image} alt={`${item.title}, ${item.regionName}`} className="card-image" /></Link><div className="card-body"><span className="card-kicker">{item.category} · {item.regionName}</span><Link to={`/stories/${item.slug}`}><h3>{item.title}</h3></Link><p>{item.excerpt}</p>{favorite && <FavoriteButton favorite={record} active={favorite.active} onToggle={favorite.onToggle} />}</div></article>
}

export function MatchNote({ children }: { children: React.ReactNode }) { return <div className="match-note"><Sparkles size={15} /><span>{children}</span><Check size={15} /></div> }

export function PageHero({ eyebrow, title, body, children }: { eyebrow?: string; title: string; body?: string; children?: React.ReactNode }) {
  return <section className="page-hero"><div className="page-hero-copy">{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h1>{title}</h1>{body && <p>{body}</p>}{children}</div></section>
}

export function CTAButton({ to, children, variant = 'primary' }: { to: string; children: React.ReactNode; variant?: 'primary' | 'secondary' }) { return <Link className={`button ${variant}`} to={to}>{children} <ArrowUpRight size={16} /></Link> }

export function JoinNotice({ text = 'Prototype content should be validated with cultural researchers, local institutions and community practitioners before public deployment.' }) { return <div className="prototype-note"><Bookmark size={16} /><span>{text}</span></div> }
