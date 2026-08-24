import { Menu, Search, X } from 'lucide-react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [['/heritage', 'Discover'], ['/hidden-heritage', 'Hidden Heritage'], ['/map', 'Heritage map'], ['/artisans', 'Artisans'], ['/trails', 'Trails'], ['/stories', 'Stories']]

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  return <div className="app-shell">
    <header className="site-header">
      <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark">JV</span><span>Jeevant <em>Virasat</em></span></Link>
      <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Main navigation">{navItems.map(([href, label]) => <NavLink key={href} to={href} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setOpen(false)}>{label}</NavLink>)}<Link className="mobile-only-nav" to="/favorites" onClick={() => setOpen(false)}>Saved places</Link></nav>
      <div className="header-actions"><Link className="search-trigger" to="/discover" aria-label="Search heritage"><Search size={19} /></Link><Link className="header-cta" to="/trails/create">Start exploring <span>↗</span></Link><button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X /> : <Menu />}</button></div>
    </header>
    {location.pathname !== '/' && <div className="route-ribbon"><span>Demonstration region</span><strong>Kurukshetra · Haryana</strong><Link to="/map">View on map ↗</Link></div>}
    <main><Outlet /></main>
    <footer className="site-footer"><div className="footer-main"><div><Link to="/" className="brand"><span className="brand-mark">JV</span><span>Jeevant <em>Virasat</em></span></Link><p>Living heritage, local voices and the routes between them.</p></div><div className="footer-links"><div><span>Explore</span><Link to="/heritage">Heritage</Link><Link to="/hidden-heritage">Hidden Heritage</Link><Link to="/artisans">Artisans</Link><Link to="/stories">Stories</Link></div><div><span>Make a plan</span><Link to="/trails/create">Build a cultural trail</Link><Link to="/identify">Identify Heritage</Link><Link to="/impact">Cultural Impact</Link><Link to="/favorites">Saved places</Link><Link to="/about">About the project</Link></div></div></div><div className="footer-bottom"><span>© 2026 Jeevant Virasat · SIH26195</span><span>Built for curious, responsible travel.</span></div></footer>
  </div>
}
