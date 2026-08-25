import { Menu, Search, X } from 'lucide-react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { languageOptions, regionName, useLanguage } from '../lib/i18n'
import type { Language } from '../../shared/types'

const navItems = [['/heritage', 'nav.discover'], ['/hidden-heritage', 'nav.hidden'], ['/map', 'nav.map'], ['/artisans', 'nav.artisans'], ['/vendors', 'nav.vendors'], ['/trails', 'nav.trails'], ['/stories', 'nav.stories']] as const

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { language, setLanguage, t } = useLanguage()
  return <div className="app-shell">
    <header className="site-header">
      <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">JV</span><span>Jeevant <em>Virasat</em></span></Link>
      <nav className={`main-nav ${open ? 'open' : ''}`} aria-label={t('nav.main')}>{navItems.map(([href, key]) => <NavLink key={href} to={href} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setOpen(false)}>{t(key)}</NavLink>)}<Link className="mobile-only-nav" to="/favorites" onClick={() => setOpen(false)}>{t('nav.saved')}</Link></nav>
      <div className="header-actions"><Link className="search-trigger" to="/discover" aria-label={t('nav.search')}><Search size={19} /></Link><label className="language-switcher"><span className="language-label">{t('language.label')}</span><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t('language.label')}>{languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><Link className="header-cta" to="/trails/create">{t('nav.startExploring')} <span>↗</span></Link><button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? t('nav.close') : t('nav.open')}>{open ? <X /> : <Menu />}</button></div>
    </header>
    {location.pathname !== '/' && <div className="route-ribbon"><span>{t('route.demo')}</span><strong>{regionName('Kurukshetra', language)} · {regionName('Haryana', language)}</strong><Link to="/map">{t('route.viewMap')}</Link></div>}
    <main><Outlet /></main>
    <footer className="site-footer"><div className="footer-main"><div><Link to="/" className="brand"><span className="brand-mark">JV</span><span>Jeevant <em>Virasat</em></span></Link><p>{t('footer.description')}</p></div><div className="footer-links"><div><span>{t('footer.explore')}</span><Link to="/heritage">{t('nav.discover')}</Link><Link to="/hidden-heritage">{t('nav.hidden')}</Link><Link to="/artisans">{t('nav.artisans')}</Link><Link to="/vendors">{t('nav.vendors')}</Link><Link to="/stories">{t('nav.stories')}</Link></div><div><span>{t('footer.plan')}</span><Link to="/trails/create">{t('home.buildTrail')}</Link><Link to="/identify">{t('identify.sectionTitle')}</Link><Link to="/impact">{t('footer.impact')}</Link><Link to="/favorites">{t('nav.saved')}</Link><Link to="/about">{t('footer.about')}</Link></div></div></div><div className="footer-bottom"><span>© 2026 Jeevant Virasat · SIH26195</span><span>{t('footer.note')}</span></div></footer>
  </div>
}
