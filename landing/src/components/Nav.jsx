import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteLink from './SiteLink.jsx'
import {
  ArticleIcon, BookIcon, ChevronIcon, ClockIcon, ContainerIcon, DocumentIcon, GridIcon,
  HouseIcon, InfoIcon, OffshoreIcon, ReportIcon, TankerIcon, UserIcon,
} from './Icons.jsx'

const MENUS = [
  {
    id: 'features',
    label: 'Features',
    sections: [
      {
        label: 'Core Features',
        items: [
          { to: '/#features', icon: ClockIcon, color: 'fc-teal', title: 'Hazmat Mapping', desc: 'Map materials to deck, area & equipment' },
          { to: '/#po-audits', icon: HouseIcon, color: 'fc-orange', title: 'PO Auditing', desc: 'Auto-screen purchase orders for hazmat' },
          { to: '/#supplier-portal', icon: DocumentIcon, color: 'fc-purple', title: 'MD/SDoC Collection', desc: 'Collect declarations with email chase' },
        ],
      },
      {
        label: 'Tools',
        items: [
          { to: '/#all-features', icon: UserIcon, color: 'fc-green', title: 'Supplier Portal', desc: 'Frictionless portal for your suppliers' },
          { to: '/#all-features', icon: ReportIcon, color: 'fc-blue', title: 'Compliance Reports', desc: 'Class-ready PDF reports in minutes' },
        ],
      },
    ],
  },
  {
    id: 'industries',
    label: 'Industries',
    small: true,
    sections: [
      {
        label: 'Vessel Types',
        items: [
          { to: '/industries?type=bulk-carriers', icon: GridIcon, color: 'fc-blue', title: 'Bulk Carriers', desc: 'Full IHM lifecycle for dry bulk fleets' },
          { to: '/industries?type=tankers', icon: TankerIcon, color: 'fc-teal', title: 'Tankers', desc: 'Hazmat compliance for liquid bulk' },
          { to: '/industries?type=container-ships', icon: ContainerIcon, color: 'fc-orange', title: 'Container Ships', desc: 'PO screening & MD collection at scale' },
          { to: '/industries?type=offshore-vessels', icon: OffshoreIcon, color: 'fc-purple', title: 'Offshore Vessels', desc: 'IHM support for OSV & MODU' },
          { to: '/industries?type=passenger-ships', icon: UserIcon, color: 'fc-green', title: 'Passenger Ships', desc: 'Cruise & RoPax compliance ready' },
        ],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    small: true,
    sections: [
      {
        label: 'Learn',
        items: [
          { to: '#', icon: BookIcon, color: 'fc-blue', title: 'Documentation', desc: 'Platform guides & API reference' },
          { to: '#', icon: ReportIcon, color: 'fc-teal', title: 'IHM Guidelines', desc: 'HKC & EU SRR explained' },
          { to: '#', icon: ArticleIcon, color: 'fc-orange', title: 'Blog & Insights', desc: 'Latest trends in maritime compliance' },
        ],
      },
      {
        label: 'Support',
        items: [
          { to: '#', icon: ClockIcon, color: 'fc-purple', title: 'Case Studies', desc: 'Customer success stories' },
          { to: '/#faq', icon: InfoIcon, color: 'fc-green', title: 'Help Center & FAQ', desc: 'Common questions & answers' },
        ],
      },
    ],
  },
]

const HOVER_OPEN_DELAY = 150 // ms before opening on hover, to ignore the mouse just passing over
const HOVER_SWITCH_DELAY = 60 // faster when moving from one open dropdown to another
const HOVER_CLOSE_DELAY = 200 // grace period after the mouse leaves

/**
 * variant="full"   — homepage nav with Features / Industries / Resources dropdowns
 * variant="simple" — plain links (Industries, Book a Demo pages)
 */
export default function Nav({ variant = 'full', activeLink, showAccountPrompt = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const hamburgerRef = useRef(null)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = 'hidden'

    const onClick = (e) => {
      const path = e.composedPath()
      if (!path.includes(mobileMenuRef.current) && !path.includes(hamburgerRef.current)) {
        setMenuOpen(false)
      }
    }
    const onResize = () => {
      if (window.innerWidth > 1024) setMenuOpen(false)
    }
    document.addEventListener('click', onClick)
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} id="main-nav">
        <div className="nav-inner">
          <Link to="/" className="logo" aria-label="OceanLedger IHMM Home">
            <img src="/ihm_logo.webp" alt="OceanLedger IHMM Logo" className="logo-img" width="200" height="52" fetchPriority="high" />
          </Link>

          {variant === 'full' ? (
            <DropdownMenus />
          ) : (
            <div className="nav-links">
              <Link to="/#features" className="nav-link">Features</Link>
              <Link to="/industries" className={`nav-link${activeLink === 'industries' ? ' active' : ''}`}>Industries</Link>
              <Link to="/#faq" className="nav-link">Resources</Link>
            </div>
          )}

          <div className="nav-actions">
            {showAccountPrompt && (
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginRight: 4 }}>Have an account?</span>
            )}
            <Link to="/login" className="btn-ghost" id="nav-login">Login</Link>
            <Link to="/book-demo" className="btn-primary" id="nav-get-started">Book a Demo</Link>
          </div>

          <button
            ref={hamburgerRef}
            className={`hamburger${menuOpen ? ' open' : ''}`}
            id="hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <div ref={mobileMenuRef} className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobile-menu" aria-hidden={!menuOpen}>
        <Link className="nav-link" to="/#features" onClick={closeMenu}>Features</Link>
        <Link className="nav-link" to="/industries" onClick={closeMenu}>Industries</Link>
        <Link className="nav-link" to="/#faq" onClick={closeMenu}>Resources</Link>
        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }}></div>
        <Link className="btn-ghost" to="/login" id="mob-login" style={{ justifyContent: 'center' }} onClick={closeMenu}>Login</Link>
        <Link className="btn-primary" to="/book-demo" id="mob-get-started" style={{ justifyContent: 'center' }} onClick={closeMenu}>Book a Demo</Link>
      </div>
    </>
  )
}

// Hover-intent dropdowns: open after a short hover, close after a grace period,
// toggle on click, follow keyboard focus, and close on outside click or Escape.
function DropdownMenus() {
  const [openId, setOpenId] = useState(null)
  const openTimer = useRef(null)
  const closeTimer = useRef(null)

  const clearTimers = () => {
    clearTimeout(openTimer.current)
    clearTimeout(closeTimer.current)
  }
  const open = (id) => {
    clearTimers()
    setOpenId(id)
  }
  const close = (id) => {
    clearTimers()
    setOpenId((current) => (current === id ? null : current))
  }

  useEffect(() => {
    const closeAll = () => {
      clearTimeout(openTimer.current)
      clearTimeout(closeTimer.current)
      setOpenId(null)
    }
    const onClick = (e) => {
      if (!e.target.closest('.nav-item.has-dropdown')) closeAll()
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeAll()
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      clearTimeout(openTimer.current)
      clearTimeout(closeTimer.current)
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className="nav-links">
      {MENUS.map((menu) => {
        const isOpen = openId === menu.id
        return (
          <div
            key={menu.id}
            className={`nav-item has-dropdown${isOpen ? ' dropdown-open' : ''}`}
            id={`nav-${menu.id}`}
            onMouseEnter={() => {
              clearTimers()
              const delay = openId && openId !== menu.id ? HOVER_SWITCH_DELAY : HOVER_OPEN_DELAY
              openTimer.current = setTimeout(() => open(menu.id), delay)
            }}
            onMouseLeave={() => {
              clearTimers()
              closeTimer.current = setTimeout(() => {
                setOpenId((current) => (current === menu.id ? null : current))
              }, HOVER_CLOSE_DELAY)
            }}
            onFocus={() => open(menu.id)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) close(menu.id)
            }}
          >
            <button
              className="nav-link"
              aria-expanded={isOpen}
              aria-haspopup="true"
              id={`btn-${menu.id}`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isOpen) close(menu.id)
                else open(menu.id)
              }}
            >
              {menu.label} <ChevronIcon />
            </button>
            <div
              className={`dropdown${menu.small ? ' dropdown--sm' : ''}`}
              id={`dropdown-${menu.id}`}
              role="menu"
              aria-labelledby={`btn-${menu.id}`}
            >
              <div className="dropdown-inner">
                {menu.sections.map((section) => (
                  <div className="dropdown-section" key={section.label}>
                    <div className="dropdown-section-label">{section.label}</div>
                    {section.items.map(({ to, icon: Icon, color, title, desc }) => (
                      <SiteLink key={title} to={to} className="dropdown-item" role="menuitem">
                        <span className={`dropdown-icon ${color}`}><Icon /></span>
                        <span><strong>{title}</strong><span>{desc}</span></span>
                      </SiteLink>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
