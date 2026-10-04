import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import SiteLink from './SiteLink.jsx'

// `to: '#'` marks a page that doesn't exist yet.
const COLUMNS = [
  {
    title: 'Features',
    links: [
      { label: 'Hazmat Mapping', to: '#' },
      { label: 'PO Auditing', to: '#' },
      { label: 'MD/SDoC Collection', to: '#' },
      { label: 'Supplier Portal', to: '#' },
      { label: 'Compliance Reports', to: '#' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Bulk Carriers', to: '#' },
      { label: 'Tankers', to: '#' },
      { label: 'Container Ships', to: '#' },
      { label: 'Offshore Vessels', to: '#' },
      { label: 'Passenger Ships', to: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '#' },
      { label: 'IHM Guidelines', to: '#' },
      { label: 'Blog', to: '#' },
      { label: 'Case Studies', to: '#' },
      { label: 'Support', to: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo logo--footer">
              <img src="/ihm_logo.webp" alt="OceanLedger IHMM Logo" className="logo-img" width="200" height="50" loading="lazy" />
            </Link>
            <p className="footer-tagline">
              The leading digital platform for IHM Part I maintenance and fleet hazmat compliance.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <Reveal className="footer-col" key={column.title}>
              <h4>{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}><SiteLink to={link.to}>{link.label}</SiteLink></li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 OceanLedger IHMM · All rights reserved</span>
          <span className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
