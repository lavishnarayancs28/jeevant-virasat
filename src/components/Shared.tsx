import { Bookmark, Check, Clock3, MapPin, ArrowUpRight, Heart, Leaf, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Artisan, HeritageLocation, Story } from '../../shared/types'
import type { FavoriteRecord } from '../lib/favorites'
import { heritageCopy, storyCopy } from '../lib/content'
import { categoryTranslationKey, regionName, translateText, useLanguage } from '../lib/i18n'
import { VerificationStatusBadge } from './Verification'

export function ImageFrame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return <div className={`image-frame ${className}`} style={{ backgroundImage: `linear-gradient(135deg, rgba(30,50,53,.22), rgba(191,108,66,.35)), url(${src})` }} role="img" aria-label={alt} />
}

export function Eyebrow({ children }: { children: React.ReactNode }) { const { language } = useLanguage(); return <span className="eyebrow">{typeof children === 'string' ? translateText(children, language) : children}</span> }
export function Tag({ children, tone = '' }: { children: React.ReactNode; tone?: string }) { return <span className={`tag ${tone}`}>{children}</span> }
export function ArrowLink({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) { const { language } = useLanguage(); return <Link className={`arrow-link ${className}`} to={to}>{typeof children === 'string' ? translateText(children, language) : children} <ArrowUpRight size={15} /></Link> }

export function SectionHeading({ eyebrow, title, body, action }: { eyebrow?: string; title: string; body?: string; action?: React.ReactNode }) {
  const { language } = useLanguage()
  return <div className="section-heading">
    <div>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h2>{translateText(title, language)}</h2>{body && <p>{translateText(body, language)}</p>}</div>
    {action}
  </div>
}

export function StatusNotice({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'error' | 'success' }) { return <div className={`status-notice ${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div> }
export function LoadingState({ label }: { label?: string }) { const { t } = useLanguage(); return <div className="loading-state"><span className="loading-dot" />{label ?? t('common.loading')}</div> }
export function EmptyState({ title, body }: { title?: string; body?: string }) { const { language } = useLanguage(); return <div className="empty-state"><Leaf size={24} /><h3>{title ?? (language === 'hi' ? 'अभी यहाँ कुछ नहीं है' : 'Nothing here yet')}</h3><p>{body ?? (language === 'hi' ? 'खोज को विस्तृत करें या कोई दूसरा रास्ता चुनें।' : 'Try widening your search or choosing another route.')}</p></div> }

export function FavoriteButton({ favorite, active, onToggle }: { favorite: FavoriteRecord; active: boolean; onToggle: (favorite: FavoriteRecord) => void }) {
  const { language } = useLanguage()
  const label = active ? (language === 'hi' ? `${favorite.label} को सहेजे स्थानों से हटाएँ` : `Remove ${favorite.label} from favorites`) : (language === 'hi' ? `${favorite.label} को सहेजें` : `Save ${favorite.label} to favorites`)
  return <button className={`favorite-button ${active ? 'active' : ''}`} onClick={() => onToggle(favorite)} aria-pressed={active} aria-label={label}><Heart size={16} fill={active ? 'currentColor' : 'none'} /> <span>{active ? (language === 'hi' ? 'सहेजा गया' : 'Saved') : (language === 'hi' ? 'सहेजें' : 'Save')}</span></button>
}

export function HeritageCard({ item, favorite, compact = false, showHiddenNote = false }: { item: HeritageLocation; favorite?: { active: boolean; onToggle: (favorite: FavoriteRecord) => void }; compact?: boolean; showHiddenNote?: boolean }) {
  const { language, t } = useLanguage()
  const record: FavoriteRecord = { kind: 'heritage', id: item.id, label: item.name, href: `/heritage/${item.slug}`, image: item.image }
  const name = heritageCopy(item, 'name', language)
  return <article className={`heritage-card ${compact ? 'compact' : ''}`}>
      <Link to={`/heritage/${item.slug}`} aria-label={`${language === 'hi' ? 'पढ़ें' : 'Read'} ${name}`}><ImageFrame src={item.image} alt={`${name}, ${item.district}, ${item.state}`} className="card-image" /></Link>
    <div className="card-body"><div className="card-meta"><Tag>{t(categoryTranslationKey(item.category), item.category)}</Tag><span><Clock3 size={13} /> {item.durationMinutes} {language === 'hi' ? 'मिनट' : 'min'}</span></div>
      <Link to={`/heritage/${item.slug}`}><h3>{name}</h3></Link><p>{heritageCopy(item, 'shortDescription', language)}</p>{showHiddenNote && item.isHidden && <div className="hidden-card-note"><strong>{language === 'hi' ? 'इसे क्यों देखें?' : 'Why explore this?'}</strong><span>{item.hiddenReason ?? (language === 'hi' ? 'प्रोटोटाइप डेटा में कम-जाना स्थान।' : 'Less-known in our prototype dataset.')}</span></div>}
      <div className="card-footer"><span className="muted"><MapPin size={13} /> {regionName(item.regionName, language)}</span>{favorite && <FavoriteButton favorite={record} active={favorite.active} onToggle={favorite.onToggle} />}</div>
    </div>
  </article>
}

export function ArtisanCard({ item, favorite }: { item: Artisan; favorite?: { active: boolean; onToggle: (favorite: FavoriteRecord) => void } }) {
  const { language } = useLanguage()
  const record: FavoriteRecord = { kind: 'artisan', id: item.id, label: item.name, href: `/artisans/${item.slug}`, image: item.profileImage }
    return <article className="artisan-card"><Link to={`/artisans/${item.slug}`}><ImageFrame src={item.profileImage} alt={`${language === 'hi' ? 'शिल्प का प्रोटोटाइप चित्र' : 'Prototype image for'} ${item.craft}; ${language === 'hi' ? 'किसी व्यक्ति का चित्र नहीं' : 'no person depicted'}`} className="portrait-image" /></Link><div className="card-body"><div className="card-meta"><VerificationStatusBadge status={item.verificationStatus} /></div><span className="card-kicker">{item.craft}</span><Link to={`/artisans/${item.slug}`}><h3>{item.name}</h3></Link><p>{item.biography}</p><div className="card-footer"><span className="muted"><MapPin size={13} /> {regionName(item.location, language)}</span>{favorite && <FavoriteButton favorite={record} active={favorite.active} onToggle={favorite.onToggle} />}</div></div></article>
}

export function StoryCard({ item, favorite }: { item: Story; favorite?: { active: boolean; onToggle: (favorite: FavoriteRecord) => void } }) {
  const { language } = useLanguage()
  const record: FavoriteRecord = { kind: 'story', id: item.id, label: item.title, href: `/stories/${item.slug}`, image: item.image }
  return <article className="story-card"><Link to={`/stories/${item.slug}`}><ImageFrame src={item.image} alt={`${storyCopy(item, 'title', language)}, ${regionName(item.regionName, language)}`} className="card-image" /></Link><div className="card-body"><span className="card-kicker">{item.category} · {regionName(item.regionName, language)}</span><Link to={`/stories/${item.slug}`}><h3>{storyCopy(item, 'title', language)}</h3></Link><p>{storyCopy(item, 'excerpt', language)}</p>{favorite && <FavoriteButton favorite={record} active={favorite.active} onToggle={favorite.onToggle} />}</div></article>
}

export function MatchNote({ children }: { children: React.ReactNode }) { return <div className="match-note"><Sparkles size={15} /><span>{children}</span><Check size={15} /></div> }

export function PageHero({ eyebrow, title, body, children }: { eyebrow?: string; title: string; body?: string; children?: React.ReactNode }) {
  const { language } = useLanguage()
  return <section className="page-hero"><div className="page-hero-copy">{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h1>{translateText(title, language)}</h1>{body && <p>{translateText(body, language)}</p>}{children}</div></section>
}

export function CTAButton({ to, children, variant = 'primary' }: { to: string; children: React.ReactNode; variant?: 'primary' | 'secondary' }) { const { language } = useLanguage(); return <Link className={`button ${variant}`} to={to}>{typeof children === 'string' ? translateText(children, language) : children} <ArrowUpRight size={16} /></Link> }

export function JoinNotice({ text }: { text?: string }) { const { t } = useLanguage(); return <div className="prototype-note"><Bookmark size={16} /><span>{text ?? t('common.prototypeNotice')}</span></div> }
