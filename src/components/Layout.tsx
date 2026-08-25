import { Menu, Search, X } from 'lucide-react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { regionName, useLanguage } from '../lib/i18n'

const navItems = [['/heritage', 'nav.discover'], ['/hidden-heritage', 'nav.hidden'], ['/map', 'nav.map'], ['/artisans', 'nav.artisans'], ['/trails', 'nav.trails'], ['/stories', 'nav.stories']] as const

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { language, setLanguage, t } = useLanguage()
  return <div className="app-shell">
    <header className="site-header">
      <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">JV</span><span>Jeevant <em>Virasat</em></span></Link>
      <nav className={`main-nav ${open ? 'open' : ''}`} aria-label={t('nav.main')}>{navItems.map(([href, key]) => <NavLink key={href} to={href} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setOpen(false)}>{t(key)}</NavLink>)}<Link className="mobile-only-nav" to="/favorites" onClick={() => setOpen(false)}>{t('nav.saved')}</Link></nav>
      <div className="header-actions"><Link className="search-trigger" to="/discover" aria-label={t('nav.search')}><Search size={19} /></Link><div className="language-switcher" role="group" aria-label={t('language.label')}><button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button><span aria-hidden="true">|</span><button type="button" className={language === 'hi' ? 'active' : ''} aria-pressed={language === 'hi'} onClick={() => setLanguage('hi')}>हिंदी</button></div><Link className="header-cta" to="/trails/create">{t('nav.startExploring')} <span>↗</span></Link><button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? t('nav.close') : t('nav.open')}>{open ? <X /> : <Menu />}</button></div>
    </header>
    {location.pathname !== '/' && <div className="route-ribbon"><span>{language === 'hi' ? 'प्रदर्शन क्षेत्र' : 'Demonstration region'}</span><strong>{regionName('Kurukshetra', language)} · {regionName('Haryana', language)}</strong><Link to="/map">{t('nav.viewMap')}</Link></div>}
    <main><Outlet /></main>
    <footer className="site-footer"><div className="footer-main"><div><Link to="/" className="brand"><span className="brand-mark">JV</span><span>Jeevant <em>Virasat</em></span></Link><p>{language === 'hi' ? 'जीवित विरासत, स्थानीय आवाज़ें और उनके बीच के रास्ते।' : 'Living heritage, local voices and the routes between them.'}</p></div><div className="footer-links"><div><span>{language === 'hi' ? 'देखें' : 'Explore'}</span><Link to="/heritage">{t('nav.discover')}</Link><Link to="/hidden-heritage">{t('nav.hidden')}</Link><Link to="/artisans">{t('nav.artisans')}</Link><Link to="/stories">{t('nav.stories')}</Link></div><div><span>{language === 'hi' ? 'योजना बनाएँ' : 'Make a plan'}</span><Link to="/trails/create">{t('home.buildTrail')}</Link><Link to="/identify">{t('identify.sectionTitle')}</Link><Link to="/impact">{language === 'hi' ? 'सांस्कृतिक प्रभाव' : 'Cultural Impact'}</Link><Link to="/favorites">{t('nav.saved')}</Link><Link to="/about">{language === 'hi' ? 'परियोजना के बारे में' : 'About the project'}</Link></div></div></div><div className="footer-bottom"><span>© 2026 Jeevant Virasat · SIH26195</span><span>{language === 'hi' ? 'जिज्ञासु, जिम्मेदार यात्रा के लिए।' : 'Built for curious, responsible travel.'}</span></div></footer>
  </div>
}
