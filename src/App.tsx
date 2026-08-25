import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDownRight, ArrowLeft, ArrowRight, BookOpen, ChevronDown, Clock3, Filter, MapPin, Search, Sparkles, X } from 'lucide-react'
import { Layout } from './components/Layout'
import { MapView } from './components/MapView'
import { TrailBuilder } from './components/TrailBuilder'
import { HeritageIdentifier } from './components/HeritageIdentifier'
import { ImpactDashboard } from './components/ImpactDashboard'
import { PrototypeModal } from './components/PrototypeModal'
import { AudioStoryPlayer } from './components/AudioStoryPlayer'
import { AskJeevant } from './components/AskJeevant'
import { ArtisanVerificationPage } from './components/ArtisanVerificationPage'
import { HeritageVerificationPage } from './components/HeritageVerificationPage'
import { DataProvenance, VerificationQr, VerificationStatusBadge } from './components/Verification'
import { FoodCard } from './components/FoodCard'
import { LivelihoodDashboard } from './components/LivelihoodDashboard'
import { ProductCard } from './components/ProductCard'
import { ProductDetailPage } from './components/ProductDetailPage'
import { ProductVerificationPage } from './components/ProductVerificationPage'
import { WeatherFoodDiscovery } from './components/WeatherFoodDiscovery'
import { useResource } from './lib/api'
import { useFavorites } from './lib/favorites'
import { heritageCopy, heritageNarration, storyCopy, storyContent as localizedStoryContent, storyNarration } from './lib/content'
import { categoryTranslationKey, experienceTranslationKey, regionName, useLanguage } from './lib/i18n'
import type { Artisan, HeritageLocation, SearchResults, Story, Trail } from '../shared/types'
import { artisans, heritage, hiddenHeritage, livelihoodRecords, products, regions, sampleTrails, stories } from '../shared/data'
import { ArrowLink, ArtisanCard, CTAButton, EmptyState, Eyebrow, FavoriteButton, HeritageCard, ImageFrame, JoinNotice, LoadingState, MatchNote, PageHero, SectionHeading, StatusNotice, StoryCard, Tag } from './components/Shared'
import './styles.css'

const categories = ['Architecture', 'Architectural Heritage', 'Craft', 'Food', 'Folk Culture', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Local History', 'Archaeological Heritage', 'Museum / Cultural Heritage', 'Living Heritage', 'Festival', 'Community Practice']
const emptySearch: SearchResults = { heritage: [], artisans: [], stories: [], regions: [] }
const livingTraditionCategories = ['Folk Culture', 'Community Practice', 'Sacred Tradition', 'Sacred Heritage', 'Sacred Landscape', 'Living Heritage', 'Festival']
const matchesRegion = (item: HeritageLocation, region: string) => !region || item.regionId.endsWith(region) || item.regionName.toLowerCase() === region || (region === 'haryana' && item.state.toLowerCase() === 'haryana')

function DataBanner({ error }: { error: string | null }) { const { t } = useLanguage(); return error ? <StatusNotice>{t('common.apiFallback')}</StatusNotice> : null }

function DiscoveryTabs({ active }: { active: string }) {
  const { t } = useLanguage()
  const tabs = [['all', t('common.allHeritage'), '/heritage'], ['hidden', t('common.hiddenGems'), '/hidden-heritage'], ['living', t('common.livingTraditions'), '/heritage?mode=living'], ['food', t('common.localFood'), '/food'], ['artisans', t('nav.artisans'), '/artisans'], ['stories', t('common.stories'), '/stories']]
  return <nav className="discovery-tabs" aria-label={t('common.allHeritage')}>{tabs.map(([key, label, to]) => <Link key={key} className={active === key ? 'active' : ''} to={to}>{label}</Link>)}</nav>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function HomePage() {
  const { language, t } = useLanguage()
  const { toggle, has } = useFavorites()
  const featured = heritage.slice(0, 3)
  const artisanSet = artisans.slice(0, 4)
  return <>
    <section className="home-hero"><div className="hero-backdrop" /><div className="container hero-layout"><div className="hero-copy"><Eyebrow>{t('home.eyebrow')}</Eyebrow><h1>{t('home.heroLead')}<br /><em>{t('home.heroAccent')}</em></h1><p>{t('home.heroBody')}</p><div className="hero-actions"><CTAButton to="/heritage">{t('home.start')}</CTAButton><Link className="text-link light" to="/map">{t('home.hidden')} <ArrowDownRight size={17} /></Link></div></div><div className="hero-annotation"><span>01</span><p>{language === 'hi' ? <>शुरुआत करें<br /><strong>कुरुक्षेत्र</strong><br />हरियाणा</> : <>Begin with<br /><strong>Kurukshetra</strong><br />Haryana</>}</p><Link to="/map" aria-label={t('nav.viewMap')}><ArrowRight size={18} /></Link></div></div><div className="hero-scroll">{t('home.scroll')} <ArrowDownRight size={16} /></div></section>
    <section className="intro-section container"><div className="intro-mark">JV</div><div><Eyebrow>{t('home.why')}</Eyebrow><h2>{t('home.introTitle')}<br /><em>{t('home.introAccent')}</em></h2><p className="intro-lede">{t('home.introBody')}</p></div></section>
    <section className="feature-section"><div className="container"><SectionHeading eyebrow={t('home.differentWay')} title={t('home.followThreads')} body={t('home.followBody')} /><div className="feature-grid">{[['01', t('home.featureLiving'), t('home.featureLivingBody'), 'heritage'], ['02', t('home.featureCraft'), t('home.featureCraftBody'), 'artisans'], ['03', t('home.featureHidden'), t('home.featureHiddenBody'), 'hidden-heritage'], ['04', t('home.featureFood'), t('home.featureFoodBody'), 'food']].map(([number, title, body, route]) => <Link to={`/${route}`} className="feature-card" key={title}><span>{number}</span><h3>{title}</h3><p>{body}</p><ArrowDownRight size={18} /></Link>)}</div></div></section>
    <section className="container content-section hidden-home-section"><SectionHeading eyebrow={t('home.hiddenEyebrow')} title={t('home.hiddenTitle')} body={t('home.hiddenBody')} action={<ArrowLink to="/hidden-heritage">{t('home.exploreHidden')}</ArrowLink>} /><div className="heritage-grid">{hiddenHeritage.slice(0, 3).map((item) => <HeritageCard key={item.id} item={item} showHiddenNote favorite={{ active: has('heritage', item.id), onToggle: toggle }} />)}</div></section>
    <section className="container content-section"><SectionHeading eyebrow={t('home.featuredEyebrow')} title={t('home.featuredTitle')} body={t('home.featuredBody')} action={<ArrowLink to="/heritage?region=kurukshetra">{t('home.seeHeritage')}</ArrowLink>} /><div className="heritage-grid">{featured.map((item) => <HeritageCard key={item.id} item={item} favorite={{ active: has('heritage', item.id), onToggle: toggle }} />)}</div></section>
    <section className="artisan-band"><div className="container"><SectionHeading eyebrow={t('home.artisanEyebrow')} title={t('home.artisanTitle')} body={t('home.artisanBody')} action={<ArrowLink to="/artisans">{t('home.moreMakers')}</ArrowLink>} /><div className="artisan-grid">{artisanSet.map((item) => <ArtisanCard key={item.id} item={item} favorite={{ active: has('artisan', item.id), onToggle: toggle }} />)}</div></div></section>
    <section className="trail-promo container"><div className="trail-promo-copy"><Eyebrow>{t('home.trailEyebrow')}</Eyebrow><h2>{t('home.trailTitle')}<br /><em>{t('home.trailAccent')}</em></h2><p>{t('home.trailBody')}</p><CTAButton to="/trails/create">{t('home.buildTrail')}</CTAButton></div><div className="trail-promo-art"><span>{t('interest.Crafts')}</span><span>{t('interest.Local Food')}</span><span>{t('interest.Local Stories')}</span><div className="trail-circle">{language === 'hi' ? <>आपका<br /><strong>मार्ग</strong></> : <>Your<br /><strong>route</strong></>}</div></div></section>
    <section className="container content-section home-stories"><SectionHeading eyebrow={t('home.storiesEyebrow')} title={t('home.storiesTitle')} body={t('home.storiesBody')} action={<ArrowLink to="/stories">{t('home.readStories')}</ArrowLink>} /><div className="story-grid">{stories.slice(0, 3).map((item) => <StoryCard key={item.id} item={item} />)}</div></section>
    <section className="container content-section"><HeritageIdentifier compact /></section>
    <section className="impact-band"><div className="container"><ImpactDashboard compact /></div></section>
    <section className="region-section"><div className="container"><SectionHeading eyebrow={t('home.regionsEyebrow')} title={t('home.regionsTitle')} body={t('home.regionsBody')} /><div className="region-grid">{regions.map((region, index) => <Link className={`region-card ${index === 0 ? 'featured' : ''}`} to={`/heritage?region=${region.slug}`} key={region.id}><ImageFrame src={region.image} alt={`${regionName(region.name, language)}, ${region.state}`} className="region-image" /><div><span>{region.state}</span><h3>{regionName(region.name, language)}</h3><ArrowRight size={16} /></div></Link>)}</div></div></section>
    <section className="container note-section"><JoinNotice /></section>
  </>
}

function DiscoverPage() {
  const { t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [input, setInput] = useState(query)
  const path = `/api/search?q=${encodeURIComponent(query)}`
  const { data, loading, error } = useResource<SearchResults>(path, emptySearch)
  const submit = (event: React.FormEvent) => { event.preventDefault(); setParams(input ? { q: input } : {}) }
  return <div className="container page-container"><PageHero eyebrow="Search the living archive" title="Start with a word." body="Look across heritage places, artisans, stories and regions. Try pottery, water, food or Kurukshetra." /><form className="search-form large" onSubmit={submit}><Search size={21} /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('search.placeholder')} aria-label={t('nav.search')} /><button className="button primary" type="submit">{t('search.button')}</button></form><DataBanner error={error} />{loading && query && <LoadingState label={t('common.loading')} />}{!query && <div className="discover-start"><div><Eyebrow>{t('search.threeWays')}</Eyebrow><h2>{t('search.startTitle')}</h2><p>{t('search.startBody')}</p></div><div className="discover-links"><Link to="/heritage"><span>01</span><strong>{t('search.browse')}</strong><ArrowRight size={16} /></Link><Link to="/artisans"><span>02</span><strong>{t('search.meet')}</strong><ArrowRight size={16} /></Link><Link to="/trails/create"><span>03</span><strong>{t('search.build')}</strong><ArrowRight size={16} /></Link></div></div>}{query && !loading && <SearchResultGroups data={data} query={query} />}</div>
}

function SearchResultGroups({ data, query }: { data: SearchResults; query: string }) {
  const { language, t } = useLanguage()
  const total = data.heritage.length + data.artisans.length + data.stories.length + data.regions.length
  if (!total) return <EmptyState title={t('search.noResults', undefined, { query })} body={t('search.noResultsBody')} />
  return <div className="search-results"><div className="search-result-header"><Eyebrow>{t('search.results')}</Eyebrow><p>{t('search.connections', undefined, { count: total, query })}</p></div>{data.heritage.length > 0 && <section><SectionHeading title="Heritage" action={<ArrowLink to={`/heritage?search=${encodeURIComponent(query)}`}>View all</ArrowLink>} /><div className="heritage-grid">{data.heritage.map((item) => <HeritageCard key={item.id} item={item} />)}</div></section>}{data.artisans.length > 0 && <section><SectionHeading title="Artisans" /><div className="artisan-grid">{data.artisans.map((item) => <ArtisanCard key={item.id} item={item} />)}</div></section>}{data.stories.length > 0 && <section><SectionHeading title="Stories" /><div className="story-grid">{data.stories.map((item) => <StoryCard key={item.id} item={item} />)}</div></section>}{data.regions.length > 0 && <section><SectionHeading title="Regions" /><div className="region-list">{data.regions.map((region) => <Link to={`/heritage?region=${region.slug}`} key={region.id}><MapPin size={17} /><span><strong>{regionName(region.name, language)}</strong><small>{region.state}</small></span><ArrowRight size={16} /></Link>)}</div></section>}</div>
}

function FoodPage() {
  const { language, t } = useLanguage()
  const foodRecords = heritage.filter((item) => item.category === 'Food')
  return <div className="container page-container food-page"><PageHero eyebrow="Food + context" title="Taste the region with care." body="Food records are cultural documentation prompts. They are not restaurant listings, medical advice or claims about a current menu." /><WeatherFoodDiscovery /><section className="content-section food-records"><SectionHeading eyebrow={t('common.localFood')} title={language === 'hi' ? 'भोजन रिकॉर्ड' : 'Food records'} body={language === 'hi' ? 'हर रिकॉर्ड अपने स्रोत, संदर्भ और प्रोटोटाइप स्थिति के साथ पढ़ें।' : 'Read each record with its source, context and prototype status.'} /><div className="food-grid">{foodRecords.map((item) => <FoodCard key={item.id} item={item} />)}</div></section><section className="content-section product-records"><SectionHeading eyebrow="Craft products" title="From practice to product." body="Product relationships are shown only where the current dataset explicitly links a craft record to a product record." /><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section></div>
}

function HeritagePage() {
  const { language, t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const region = params.get('region') ?? ''
  const category = params.get('category') ?? ''
  const duration = params.get('duration') ?? ''
  const sort = params.get('sort') ?? ''
  const mode = params.get('mode') ?? ''
  const query = new URLSearchParams({ ...(search && { search }), ...(region && { region }), ...(category && { category }), ...(duration && { duration }), ...(sort && { sort }), ...(mode && { mode }) }).toString()
  const fallback = useMemo(() => heritage.filter((item) => (!search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) && matchesRegion(item, region) && (!category || item.category === category) && (mode !== 'living' || livingTraditionCategories.includes(item.category)) && (mode !== 'food' || item.category === 'Food')), [search, region, category, mode])
  const { data, loading, error } = useResource<HeritageLocation[]>(`/api/heritage${query ? `?${query}` : ''}`, fallback)
  const setFilter = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next) }
  return <div className="container page-container"><PageHero eyebrow="Discover heritage" title="Places with a pulse." body="Go beyond the headline attraction. Browse living traditions, local history, craft and food across Haryana." /><DiscoveryTabs active={mode === 'living' ? 'living' : mode === 'food' ? 'food' : 'all'} /><div className="filter-layout"><aside className="filter-panel"><div className="filter-title"><Filter size={16} /><strong>{t('heritage.refine')}</strong></div><label>{t('heritage.search')}<input value={search} onChange={(event) => setFilter('search', event.target.value)} placeholder={t('heritage.searchPlaceholder')} /></label><label>{t('heritage.region')}<select value={region} onChange={(event) => setFilter('region', event.target.value)}><option value="">{t('heritage.allRegions')}</option>{regions.map((item) => <option key={item.id} value={item.slug}>{regionName(item.name, language)}</option>)}</select></label><label>{t('heritage.category')}<select value={category} onChange={(event) => setFilter('category', event.target.value)}><option value="">{t('heritage.allCategories')}</option>{categories.map((item) => <option key={item}>{t(categoryTranslationKey(item), item)}</option>)}</select></label><label>{t('heritage.time')}<select value={duration} onChange={(event) => setFilter('duration', event.target.value)}><option value="">{t('heritage.anyDuration')}</option><option value="short">{t('heritage.shortDuration')}</option><option value="medium">{t('heritage.mediumDuration')}</option><option value="long">{t('heritage.longDuration')}</option></select></label>{(search || region || category || duration || sort || mode) && <button className="text-button clear-filters" onClick={() => setParams({})}>{t('heritage.clear')} <X size={15} /></button>}</aside><div className="results-column"><div className="results-toolbar"><p>{t('heritage.placesCount', undefined, { count: data.length })}</p><label className="sort-select">{t('heritage.sort')}<select value={sort} onChange={(event) => setFilter('sort', event.target.value)}><option value="">{t('heritage.curated')}</option><option value="name">{t('heritage.nameSort')}</option><option value="duration">{t('heritage.shortest')}</option></select><ChevronDown size={14} /></label></div><DataBanner error={error} />{loading && <LoadingState />}{!loading && !data.length ? <EmptyState title={t('heritage.noMatch')} body={t('heritage.noMatchBody')} /> : <div className="heritage-grid">{data.map((item) => <HeritageCard key={item.id} item={item} showHiddenNote={mode === 'hidden'} />)}</div>}</div></div></div>
}

function HiddenHeritagePage() {
  const { language, t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const region = params.get('region') ?? ''
  const category = params.get('category') ?? ''
  const query = new URLSearchParams({ ...(search && { search }), ...(region && { region }), ...(category && { category }) }).toString()
  const fallback = hiddenHeritage.filter((item) => (!search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) && matchesRegion(item, region) && (!category || item.category === category))
  const { data, loading, error } = useResource<HeritageLocation[]>(`/api/hidden-heritage${query ? `?${query}` : ''}`, fallback)
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next) }
  return <div className="container page-container hidden-page"><PageHero eyebrow="Hidden Heritage" title="Take the quieter path." body="A focused mode for places and practices marked as less-known in our prototype dataset. It is an invitation to look closer, not a claim of objective discovery." /><DiscoveryTabs active="hidden" /><div className="hidden-intro"><Sparkles size={22} /><div><strong>{t('hidden.dataset')}</strong><p>{t('hidden.why')}</p></div></div><div className="hidden-filters"><label>{t('heritage.search')}<input value={search} onChange={(event) => update('search', event.target.value)} placeholder={t('hidden.searchPlaceholder')} /></label><label>{t('heritage.region')}<select value={region} onChange={(event) => update('region', event.target.value)}><option value="">{t('heritage.allRegions')}</option>{regions.map((item) => <option key={item.id} value={item.slug}>{regionName(item.name, language)}</option>)}</select></label><label>{t('heritage.category')}<select value={category} onChange={(event) => update('category', event.target.value)}><option value="">{t('heritage.allCategories')}</option>{categories.map((item) => <option key={item}>{t(categoryTranslationKey(item), item)}</option>)}</select></label></div><DataBanner error={error} />{loading && <LoadingState label={t('common.loading')} />}{!loading && !data.length ? <EmptyState title={t('hidden.noMatch')} body={t('hidden.noMatchBody')} /> : <div className="heritage-grid">{data.map((item) => <HeritageCard key={item.id} item={item} showHiddenNote />)}</div>}</div>
}

function HeritageDetailPage() {
  const { language, t } = useLanguage()
  const { slug } = useParams()
  const fallback = heritage.find((item) => item.slug === slug)
  const { data: item, loading, error } = useResource<HeritageLocation | undefined>(`/api/heritage/${slug}`, fallback)
  const { toggle, has } = useFavorites()
  if (loading && !item) return <div className="container page-container"><LoadingState /></div>
  if (!item) return <NotFound label="This heritage place could not be found." />
  const relatedStories = stories.filter((story) => item.id && story.relatedHeritageIds.includes(item.id)).slice(0, 3)
  const relatedArtisans = artisans.filter((artisan) => artisan.relatedHeritageIds.includes(item.id)).slice(0, 3)
  const relatedProducts = products.filter((product) => product.relatedHeritageIds.includes(item.id)).slice(0, 3)
  const name = heritageCopy(item, 'name', language)
  const favorite = { kind: 'heritage' as const, id: item.id, label: name, href: `/heritage/${item.slug}`, image: item.image }
  return <div className="detail-page"><div className="container"><Link className="back-link" to="/heritage"><ArrowLeft size={15} /> {t('heritage.all')}</Link><DataBanner error={error} /><section className="detail-hero"><ImageFrame src={item.image} alt={`${name}, ${item.district}, Haryana`} className="detail-image" /><div className="detail-title"><Tag>{t(categoryTranslationKey(item.category), item.category)}</Tag><h1>{name}</h1><p className="detail-location"><MapPin size={16} /> {item.district}, {regionName(item.state, language)} · {item.durationMinutes} {language === 'hi' ? 'मिनट का दौरा' : 'min visit'}</p><div className="detail-actions"><FavoriteButton favorite={favorite} active={has('heritage', item.id)} onToggle={toggle} /><CTAButton to={`/trails/create?heritage=${item.slug}`}>{t('heritage.addTrail')}</CTAButton><VerificationQr kind="heritage" id={item.id} /></div></div></section><AudioStoryPlayer text={{ en: heritageNarration(item, 'en'), hi: heritageNarration(item, 'hi') }} /><AskJeevant item={item} /><div className="detail-grid"><article className="editorial-copy"><Eyebrow>{t('heritage.place')}</Eyebrow><h2>{heritageCopy(item, 'shortDescription', language)}</h2><p className="lead">{heritageCopy(item, 'description', language)}</p><h3>{t('heritage.why')}</h3><p>{heritageCopy(item, 'culturalSignificance', language)}</p><h3>{t('heritage.context')}</h3><p>{heritageCopy(item, 'historicalContext', language)}</p><div className="living-card"><span>{t('heritage.livingToday')}</span><p>{heritageCopy(item, 'livingToday', language)}</p></div><div className="prototype-note"><span><strong>{t('heritage.imageProvenance')}:</strong> {item.imageSource} · {item.imageLicense} <a href={item.sourceUrl} target="_blank" rel="noreferrer">{t('common.openSource', 'Open source')}</a></span></div><JoinNotice /><DataProvenance provenance={item.provenance ?? { source: item.verifiedStatus, sourceUrl: item.sourceUrl, verificationStatus: 'PROTOTYPE', lastUpdated: '2026-08-25', isPrototype: true, imageSource: item.imageSource, imageLicense: item.imageLicense }} /></article><aside className="detail-aside"><div className="tag-block"><span>{t('heritage.lookFor')}</span><div>{item.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div></div><div className="gallery-grid">{item.gallery.map((src, index) => <ImageFrame key={src} src={src} alt={`${name} detail ${index + 1}`} className={index === 0 ? 'gallery-wide' : ''} />)}</div></aside></div>{relatedArtisans.length > 0 && <section className="related-section"><SectionHeading eyebrow="Meet the people around the practice" title={t('heritage.relatedArtisans')} /><div className="artisan-grid">{relatedArtisans.map((artisan) => <ArtisanCard key={artisan.id} item={artisan} />)}</div></section>}{relatedProducts.length > 0 && <section className="related-section"><SectionHeading eyebrow="From practice to product" title="Related products" /><div className="product-grid">{relatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}{relatedStories.length > 0 && <section className="related-section"><SectionHeading eyebrow="Read before you go" title={t('heritage.relatedStories')} /><div className="story-grid">{relatedStories.map((story) => <StoryCard key={story.id} item={story} />)}</div></section>}</div></div>
}

function MapPage() {
  const { language, t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const region = params.get('region') ?? 'kurukshetra'
  const category = params.get('category') ?? ''
  const mode = params.get('mode') ?? ''
  const activeRegion = regions.find((item) => item.slug === region)
  const source = mode === 'hidden' ? hiddenHeritage : heritage
  const fallback = source.filter((item) => matchesRegion(item, region) && (!category || item.category === category))
  const endpoint = mode === 'hidden' ? '/api/hidden-heritage' : '/api/heritage'
  const { data, error } = useResource<HeritageLocation[]>(`${endpoint}?region=${region}${category ? `&category=${encodeURIComponent(category)}` : ''}`, fallback)
  const [selectedId, setSelectedId] = useState(data[0]?.id)
  const selected = data.find((item) => item.id === selectedId) ?? data[0]
  useEffect(() => { if (data[0] && !data.some((item) => item.id === selectedId)) setSelectedId(data[0].id) }, [data, selectedId])
  const mapContent = data.length ? <div className="map-layout"><MapView items={data} selected={selected} onSelect={(item) => setSelectedId(item.id)} height="650px" /><aside className="map-list">{data.map((item) => <button key={item.id} className={`map-list-item ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => setSelectedId(item.id)}><ImageFrame src={item.image} alt="" className="list-thumb" /><span><Tag>{t(categoryTranslationKey(item.category), item.category)}</Tag><strong>{heritageCopy(item, 'name', language)}</strong><small>{item.durationMinutes} {language === 'hi' ? 'मिनट' : 'min'} · {regionName(item.regionName, language)}</small></span><ArrowRight size={15} /></button>)}{selected && <div className="map-selected"><Eyebrow>{t('map.selected')}</Eyebrow><h3>{heritageCopy(selected, 'name', language)}</h3><p>{heritageCopy(selected, 'shortDescription', language)}</p><ArrowLink to={`/heritage/${selected.slug}`}>{t('common.readPlace')}</ArrowLink></div>}</aside></div> : <EmptyState title={t('map.noMatch')} body={t('map.noMatchBody')} />
  return <div className="container page-container map-page"><PageHero eyebrow={mode === 'hidden' ? 'Hidden Heritage on the map' : 'Heritage map'} title="Let the landscape lead." body={t('map.body', undefined, { region: regionName(activeRegion?.name ?? 'Haryana', language) })} /><div className="map-mode-link"><Link className="arrow-link" to={mode === 'hidden' ? '/map' : '/map?mode=hidden'}>{mode === 'hidden' ? t('map.showAll') : t('map.prioritizeHidden')} <ArrowRight size={15} /></Link></div><div className="map-toolbar"><label>{t('heritage.region')}<select value={region} onChange={(event) => setParams({ region: event.target.value, ...(category && { category }), ...(mode && { mode }) })}>{regions.map((item) => <option key={item.id} value={item.slug}>{regionName(item.name, language)}, {item.state}</option>)}</select></label><label>{t('heritage.category')}<select value={category} onChange={(event) => setParams({ region, ...(event.target.value && { category: event.target.value }), ...(mode && { mode }) })}><option value="">{t('heritage.allCategories')}</option>{categories.map((item) => <option key={item}>{t(categoryTranslationKey(item), item)}</option>)}</select></label><span className="map-count">{t('map.mappedCount', undefined, { count: data.length })}</span></div><DataBanner error={error} />{mapContent}</div>
}

function ArtisansPage() {
  const { language, t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const region = params.get('region') ?? ''
  const fallback = artisans.filter((item) => (!search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) && (!region || item.regionId.endsWith(region) || region === 'haryana'))
  const { data, error } = useResource<Artisan[]>(`/api/artisans?${new URLSearchParams({ ...(search && { search }), ...(region && { region }) })}`, fallback)
  const { toggle, has } = useFavorites()
  return <div className="container page-container"><PageHero eyebrow="People + craft + story" title="Meet the hands behind the place." body="Artisan discovery is not a marketplace shortcut. It is a way to understand a region through the people who keep making it." /><div className="list-controls"><form className="search-form" onSubmit={(event) => event.preventDefault()}><Search size={17} /><input value={search} onChange={(event) => setParams({ ...(event.target.value && { search: event.target.value }), ...(region && { region }) })} placeholder={t('artisans.searchPlaceholder')} /></form><select value={region} onChange={(event) => setParams({ ...(search && { search }), ...(event.target.value && { region: event.target.value }) })}><option value="">{t('heritage.allRegions')}</option>{regions.map((item) => <option value={item.slug} key={item.id}>{regionName(item.name, language)}</option>)}</select></div><DataBanner error={error} /><div className="artisan-grid large-grid">{data.map((item) => <ArtisanCard key={item.id} item={item} favorite={{ active: has('artisan', item.id), onToggle: toggle }} />)}</div>{!data.length && <EmptyState title={t('artisans.noMatch')} body={t('artisans.noMatchBody')} />}</div>
}

function ArtisanDetailPage() {
  const { language, t } = useLanguage()
  const { slug } = useParams()
  const fallback = artisans.find((item) => item.slug === slug)
  const { data: item, loading, error } = useResource<Artisan | undefined>(`/api/artisans/${slug}`, fallback)
  const { toggle, has } = useFavorites()
  const [modal, setModal] = useState<'connect' | 'experience' | 'story' | null>(null)
  if (loading && !item) return <div className="container page-container"><LoadingState /></div>
  if (!item) return <NotFound label="This artisan profile could not be found." />
  const related = heritage.filter((place) => item.relatedHeritageIds.includes(place.id))
  const artisanProducts = products.filter((product) => product.artisanId === item.id)
  const favorite = { kind: 'artisan' as const, id: item.id, label: item.name, href: `/artisans/${item.slug}`, image: item.profileImage }
  return <div className="detail-page artisan-detail"><div className="container">
    <Link className="back-link" to="/artisans"><ArrowLeft size={15} /> {t('artisans.all')}</Link>
    <DataBanner error={error} />
    <section className="artisan-profile-hero">
      <ImageFrame src={item.profileImage} alt={`Prototype image for ${item.craft}; no person depicted`} className="profile-image" />
      <div>
        <VerificationStatusBadge status={item.verificationStatus} />
        <span className="card-kicker">{item.craft}</span>
        <h1>{item.name}</h1>
        <p className="detail-location"><MapPin size={16} /> {item.location}{item.yearsOfExperience ? ` · ${item.yearsOfExperience} ${language === 'hi' ? 'वर्षों का अभ्यास' : 'years of practice'}` : language === 'hi' ? ' · अभ्यास विवरण समुदाय समीक्षा की प्रतीक्षा में' : ' · practice details pending community review'}</p>
        <p className="profile-intro">{item.biography}</p>
        <p className="verification-disclaimer">{t('verification.disclaimer')}</p>
        <div className="detail-actions">
          <FavoriteButton favorite={favorite} active={has('artisan', item.id)} onToggle={toggle} />
          <button className="button primary" onClick={() => setModal('connect')}>{t('artisans.connect')} <ArrowRight size={16} /></button>
          <VerificationQr kind="artisan" id={item.id} />
          <Link className="arrow-link" to={`/verify/artisan/${item.id}`}>{t('verification.open')} <ArrowRight size={14} /></Link>
        </div>
      </div>
    </section>
    <div className="artisan-action-row"><button className="button secondary" onClick={() => setModal('experience')}>{t('artisans.experience')} <ArrowRight size={16} /></button><button className="text-button" onClick={() => setModal('story')}>{t('artisans.craftStory')} <ArrowRight size={16} /></button></div>
    <div className="detail-grid"><article className="editorial-copy">
      <Eyebrow>{t('artisans.storyHeading')}</Eyebrow><h2>“{item.craftStory}”</h2><p>{item.biography}</p>
      <h3>{t('artisans.skills')}</h3><div className="tag-row">{(item.skills ?? item.specialties).map((skill) => <Tag key={skill}>{skill}</Tag>)}</div>
      <h3>{t('artisans.availability')}</h3><p>{item.workshopAvailability ?? (language === 'hi' ? 'सत्यापित स्थानीय परिचय के माध्यम से अनुरोध पर प्रोटोटाइप उपलब्धता।' : 'Prototype availability on request through a verified local introduction.')}</p>
      <div className="living-card"><span>{language === 'hi' ? 'सम्मानपूर्वक जुड़ें' : 'Connect respectfully'}</span><p>{item.contactMethod}. {language === 'hi' ? 'यह प्रोटोटाइप भुगतान या निजी संपर्क विवरण प्रकाशित नहीं करता।' : 'This prototype does not process payments or publish private contact details.'}</p></div>
    </article><aside className="detail-aside"><div className="gallery-grid">{item.gallery.map((src, index) => <ImageFrame key={src} src={src} alt={`${item.craft} detail ${index + 1}`} className={index === 0 ? 'gallery-wide' : ''} />)}</div></aside></div>
    {artisanProducts.length > 0 && <section className="related-section artisan-products"><SectionHeading eyebrow="Craft products" title="Products linked to this record" body="Reference prices are clearly labelled and require local market validation." /><div className="product-grid">{artisanProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}
    <LivelihoodDashboard artisan={item} records={livelihoodRecords} />
    <DataProvenance provenance={item.provenance} />
    <section className="artisan-why"><Eyebrow>{t('artisans.why')}</Eyebrow><h2>Jeevant Virasat connects cultural discovery with the people who keep traditions alive.</h2><p>Every connection should begin with consent, context and a clear understanding that this is a prototype workflow.</p></section>
    {related.length > 0 && <section className="related-section"><SectionHeading eyebrow="Follow the practice" title="Related heritage" /><div className="heritage-grid">{related.map((place) => <HeritageCard key={place.id} item={place} />)}</div></section>}
  </div>{modal && <PrototypeModal title={modal === 'connect' ? `${t('artisans.connect')} ${item.name}` : modal === 'experience' ? t('artisans.experience') : `${item.name}'s ${t('artisans.craftStory').toLowerCase()}`} onClose={() => setModal(null)}>{modal === 'story' ? <p>{item.craftStory}</p> : <><p>{language === 'hi' ? 'प्रोटोटाइप इंटरैक्शन — समुदाय कनेक्शन कार्यप्रवाह।' : 'Prototype interaction — community connection workflow.'}</p><p>{modal === 'experience' ? `${language === 'hi' ? 'आपका अनुरोध' : 'Your request would be prepared for'} ${item.name}, ${language === 'hi' ? 'सहमति, उपलब्धता और स्थानीय समन्वय के अधीन।' : 'subject to consent, availability and local coordination.'}` : `${language === 'hi' ? 'उत्पादन संस्करण सत्यापित स्थानीय साझेदार के माध्यम से' : 'A production version would route an introduction to'} ${item.name}${language === 'hi' ? ' तक परिचय भेजेगा।' : ' through a verified local partner.'}`}</p><JoinNotice text={t('common.noBooking')} /></>}<div className="modal-actions"><button className="button primary" onClick={() => setModal(null)}>{t('common.close')}</button></div></PrototypeModal>}</div>
}
function StoriesPage() {
  const { language, t } = useLanguage()
  const { data, error } = useResource<Story[]>('/api/stories', stories)
  const { toggle, has } = useFavorites()
  const storyContent = data.length ? <><div className="story-feature"><ImageFrame src={data[0].image} alt={`${storyCopy(data[0], 'title', language)} field note`} className="story-feature-image" /><div><Eyebrow>{t('stories.lead')}</Eyebrow><h2>{storyCopy(data[0], 'title', language)}</h2><p>{storyCopy(data[0], 'excerpt', language)}</p><ArrowLink to={`/stories/${data[0].slug}`}>{t('common.readStory')}</ArrowLink></div></div><div className="story-grid">{data.slice(1).map((item) => <StoryCard key={item.id} item={item} favorite={{ active: has('story', item.id), onToggle: toggle }} />)}</div></> : <EmptyState title={t('stories.more')} body={t('stories.moreBody')} />
  return <div className="container page-container"><PageHero eyebrow="Field notes" title="Stories that keep the place open." body="Editorial entries for the histories, practices and people you may miss when you only visit the landmark." /><DataBanner error={error} />{storyContent}</div>
}

function StoryDetailPage() {
  const { language, t } = useLanguage()
  const { slug } = useParams()
  const fallback = stories.find((item) => item.slug === slug)
  const { data: item, loading, error } = useResource<Story | undefined>(`/api/stories/${slug}`, fallback)
  const { toggle, has } = useFavorites()
  if (loading && !item) return <div className="container page-container"><LoadingState /></div>
  if (!item) return <NotFound label="This story could not be found." />
  const relatedPlaces = heritage.filter((place) => item.relatedHeritageIds.includes(place.id))
  const relatedArtisans = artisans.filter((artisan) => item.relatedArtisanIds.includes(artisan.id))
  const title = storyCopy(item, 'title', language)
  const favorite = { kind: 'story' as const, id: item.id, label: title, href: `/stories/${item.slug}`, image: item.image }
  return <div className="story-detail"><div className="container"><Link className="back-link" to="/stories"><ArrowLeft size={15} /> {t('common.stories')}</Link><DataBanner error={error} /><div className="story-detail-head"><Tag>{item.category}</Tag><h1>{title}</h1><p>{storyCopy(item, 'excerpt', language)}</p><div className="story-byline"><span>{regionName(item.regionName, language)}</span><span>·</span><span>{t('stories.fieldNote')}</span><FavoriteButton favorite={favorite} active={has('story', item.id)} onToggle={toggle} /></div></div><AudioStoryPlayer text={{ en: storyNarration(item, 'en'), hi: storyNarration(item, 'hi') }} /><ImageFrame src={item.image} alt="" className="story-detail-image" /><article className="longform">{localizedStoryContent(item, language).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article>{relatedPlaces.length > 0 && <section className="related-section"><SectionHeading eyebrow="Keep following the thread" title={t('stories.relatedPlaces')} /><div className="heritage-grid">{relatedPlaces.map((place) => <HeritageCard key={place.id} item={place} />)}</div></section>}{relatedArtisans.length > 0 && <section className="related-section"><SectionHeading eyebrow="The people in the frame" title={t('stories.relatedPeople')} /><div className="artisan-grid">{relatedArtisans.map((artisan) => <ArtisanCard key={artisan.id} item={artisan} />)}</div></section>}</div></div>
}

function IdentifyPage() {
  return <div className="container page-container"><PageHero eyebrow="AI vision prototype" title="Recognize a place, then follow the living context." body="Use a curated demonstration image or upload an image for a controlled prototype match. Recognition is limited to the demonstration dataset." /><HeritageIdentifier /><JoinNotice text="Prototype content — recognition results require cultural-source verification before public deployment." /></div>
}

function ImpactPage() {
  return <div className="container page-container"><PageHero eyebrow="Prototype Dataset Coverage" title="Measure what the prototype makes visible." body="Cultural Impact is a transparent view of dataset coverage, not a claim about real-world impact." /><ImpactDashboard /></div>
}

function TrailsPage() {
  const { language, t } = useLanguage()
  const { toggle, has } = useFavorites()
  return <div className="container page-container"><PageHero eyebrow="Routes with a point of view" title="Take the scenic route through culture." body="Use a sample trail to understand the format, or build one around what you want to notice." ><CTAButton to="/trails/create">{t('trails.create')}</CTAButton></PageHero><div className="trail-list">{sampleTrails.map((trail) => <article className="trail-card" key={trail.id}><div className="trail-card-art"><span>{t('trails.stops', undefined, { count: trail.stops.length })}</span><strong>{regionName(trail.regionName, language)}</strong></div><div className="trail-card-copy"><div className="card-meta"><Tag>{t(experienceTranslationKey(trail.experienceType), trail.experienceType)}</Tag><span><Clock3 size={13} /> {Math.floor(trail.duration / 60)}h {trail.duration % 60 ? `${trail.duration % 60}m` : ''}</span></div><h2>{trail.name}</h2><p>For {trail.interests.join(' · ').toLowerCase()}. A considered route through {trail.stops.map((stop) => heritageCopy(stop, 'name', language)).join(', ')}.</p><div className="card-footer"><ArrowLink to={`/trails/${trail.id}`}>{t('trails.view')}</ArrowLink><FavoriteButton favorite={{ kind: 'trail', id: trail.id, label: trail.name, href: `/trails/${trail.id}` }} active={has('trail', trail.id)} onToggle={toggle} /></div></div></article>)}</div></div>
}

function TrailDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const stateTrail = (location.state as { trail?: Trail } | null)?.trail
  const fallback = stateTrail ?? sampleTrails.find((trail) => trail.id === id)
  const { data: trail, loading, error } = useResource<Trail | undefined>(`/api/trails/${id}`, fallback)
  const { toggle, has } = useFavorites()
  if (loading && !trail) return <div className="container page-container"><LoadingState /></div>
  if (!trail) return <NotFound label="This trail has expired or could not be found." />
  const time = `${Math.floor(trail.duration / 60)}h${trail.duration % 60 ? ` ${trail.duration % 60}m` : ''}`
  return <div className="container page-container trail-detail"><Link className="back-link" to="/trails"><ArrowLeft size={15} /> All trails</Link><DataBanner error={error} /><div className="trail-detail-head"><div><Tag tone="success"><Sparkles size={12} /> AI-assisted prototype recommendation</Tag><Eyebrow>Your heritage trail</Eyebrow><h1>{trail.name}</h1><p>{trail.stops.length} stops · estimated {time} · {trail.experienceType}{trail.crowdPreference ? ` · ${trail.crowdPreference}` : ''}</p></div><FavoriteButton favorite={{ kind: 'trail', id: trail.id, label: trail.name, href: `/trails/${trail.id}` }} active={has('trail', trail.id)} onToggle={toggle} /></div><div className="trail-summary"><div><strong>{time}</strong><span>Total duration</span></div><div><strong>{trail.stops.length}</strong><span>Stops</span></div><div><strong>{trail.interests.length}</strong><span>Interests matched</span></div><div><strong>{trail.crowdPreference ?? 'Balanced'}</strong><span>Crowd preference</span></div></div><div className="trail-result-layout"><div className="trail-timeline">{trail.stops.map((stop, index) => <article className="timeline-stop" key={stop.id}><div className="timeline-index">0{index + 1}</div><div className="timeline-line" /><ImageFrame src={stop.image} alt="" className="timeline-image" /><div className="timeline-copy"><div className="card-meta"><Tag>{stop.category}</Tag><span><Clock3 size={13} /> {stop.durationMinutes} min</span></div><h2>{stop.name}</h2><p>{stop.description}</p><MatchNote>{stop.matchReason}</MatchNote><div className="stop-context"><strong>Cultural context</strong><p>{stop.culturalContext ?? stop.culturalSignificance}</p></div>{trail.stops[index + 1] && <p className="next-stop"><ArrowRight size={14} /> Next stop: <strong>{trail.stops[index + 1].name}</strong></p>}<Link className="arrow-link" to={`/heritage/${stop.slug}`}>Read place story <ArrowRight size={15} /></Link></div></article>)}</div><div className="trail-map-sticky"><MapView items={trail.stops} height="520px" /></div></div><div className="trail-footer-callout"><BookOpen size={20} /><div><strong>Travel with context</strong><p>These recommendations are deterministic and AI-assisted in presentation. Confirm timings and access locally, and let community guidance shape the visit.</p></div><CTAButton to="/trails/create">Make another trail</CTAButton></div></div>
}

function FavoritesPage() {
  const { favorites, toggle } = useFavorites()
  return <div className="container page-container"><PageHero eyebrow="Your field notebook" title="Saved for later." body="Keep places, people, stories and trails together while you plan your route." />{!favorites.length ? <div className="favorites-empty"><BookOpen size={27} /><h2>Your notebook is empty.</h2><p>Save a place, artisan, story or trail and it will appear here on this device.</p><CTAButton to="/heritage">Start with heritage</CTAButton></div> : <div className="favorites-grid">{favorites.map((favorite) => <article key={`${favorite.kind}-${favorite.id}`} className="favorite-card">{favorite.image && <ImageFrame src={favorite.image} alt="" className="favorite-image" />}<div><Tag>{favorite.kind}</Tag><Link to={favorite.href}><h3>{favorite.label}</h3></Link><div className="card-footer"><Link className="arrow-link" to={favorite.href}>Open <ArrowRight size={15} /></Link><FavoriteButton favorite={favorite} active onToggle={toggle} /></div></div></article>)}</div>}</div>
}

function AboutPage() { return <div className="container page-container about-page"><PageHero eyebrow="The idea" title="A platform for the heritage that keeps moving." body="Jeevant Virasat means living heritage. The project is built around a simple shift: look past the landmark, and ask who keeps a place meaningful now." /><div className="about-grid"><article><Eyebrow>The problem</Eyebrow><h2>Tourism often compresses culture into a list of attractions.</h2><p>That makes it harder to find local practices, community stories, regional food and the artisans whose work gives a place its texture.</p></article><article><Eyebrow>The bridge</Eyebrow><h2>Traveler ↔ Heritage ↔ Community ↔ Artisan</h2><p>Our discovery flow moves from a place to its context, then to the people and practices around it. The goal is a more useful first step, not a substitute for local knowledge.</p></article><article><Eyebrow>The prototype</Eyebrow><h2>Kurukshetra is the first chapter.</h2><p>The current demonstration region is intentionally small. Data structures, APIs and trail logic are designed to grow with more regions and community-reviewed content.</p></article><article><Eyebrow>The promise</Eyebrow><h2>Specific, grounded and responsible.</h2><p>We avoid invented credentials, testimonials and statistics. Demonstration content is clearly marked and should be validated before any public deployment.</p></article></div><JoinNotice /></div> }

function NotFound({ label = 'The page you are looking for has moved.' }: { label?: string }) { return <div className="container page-container not-found"><span className="not-found-number">404</span><h1>There’s another path from here.</h1><p>{label}</p><CTAButton to="/">Return home</CTAButton></div> }

export default function App() {
  return <><ScrollToTop /><Routes><Route element={<Layout />}><Route path="/" element={<HomePage />} /><Route path="/discover" element={<DiscoverPage />} /><Route path="/heritage" element={<HeritagePage />} /><Route path="/food" element={<FoodPage />} /><Route path="/hidden-heritage" element={<HiddenHeritagePage />} /><Route path="/heritage/:slug" element={<HeritageDetailPage />} /><Route path="/map" element={<MapPage />} /><Route path="/artisans" element={<ArtisansPage />} /><Route path="/artisans/:slug" element={<ArtisanDetailPage />} /><Route path="/verify/heritage/:id" element={<HeritageVerificationPage />} /><Route path="/verify/artisan/:id" element={<ArtisanVerificationPage />} /><Route path="/verify/product/:id" element={<ProductVerificationPage />} /><Route path="/products/:slug" element={<ProductDetailPage />} /><Route path="/stories" element={<StoriesPage />} /><Route path="/stories/:slug" element={<StoryDetailPage />} /><Route path="/identify" element={<IdentifyPage />} /><Route path="/recognition" element={<IdentifyPage />} /><Route path="/impact" element={<ImpactPage />} /><Route path="/trails" element={<TrailsPage />} /><Route path="/trails/create" element={<div className="container page-container"><PageHero eyebrow="AI Cultural Guide" title="Build My Cultural Trail" body="Five steps. A few honest preferences. A route you can actually explain to someone when you get home." /><TrailBuilder /></div>} /><Route path="/trails/:id" element={<TrailDetailPage />} /><Route path="/favorites" element={<FavoritesPage />} /><Route path="/about" element={<AboutPage />} /><Route path="*" element={<NotFound />} /></Route></Routes></>
}
