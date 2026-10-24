import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import SiteLink from './SiteLink.jsx'
import { FacebookIcon, InstagramIcon, LinkedInIcon } from './Icons.jsx'

// Navigation link structure
const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Hazmat Mapping', to: '/#features' },
      { label: 'PO Auditing', to: '/#po-audits' },
      { label: 'MD/SDoC Collection', to: '/#supplier-portal' },
      { label: 'Supplier Portal', to: '/#supplier-portal' },
      { label: 'Compliance Reports', to: '/#all-features' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Bulk Carriers', to: '/industries?type=bulk-carriers' },
      { label: 'Tankers', to: '/industries?type=tankers' },
      { label: 'Container Ships', to: '/industries?type=container-ships' },
      { label: 'Offshore Vessels', to: '/industries?type=offshore-vessels' },
      { label: 'Passenger Ships', to: '/industries?type=passenger-ships' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog & Insights', to: '/blogs' },
      { label: 'IHM Part 1 Checklist', to: '/blogs/ihm-part-1-maintenance-checklist' },
      { label: 'MD vs SDoC Guide', to: '/blogs/material-declaration-vs-sdoc-guide' },
      { label: 'HKC & EU SRR Overview', to: '/blogs/hkc-vs-eu-srr-maritime-compliance' },
      { label: 'Help Center & FAQ', to: '/#faq' },
    ],
  },
]

const SOCIAL_LINKS = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/maricomx/',
    icon: LinkedInIcon,
    ariaLabel: 'Follow MARICOMX on LinkedIn',
    colorClass: 'social-linkedin',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/maricomx_official/',
    icon: InstagramIcon,
    ariaLabel: 'Follow MARICOMX on Instagram',
    colorClass: 'social-instagram',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61594895703962',
    icon: FacebookIcon,
    ariaLabel: 'Follow MARICOMX on Facebook',
    colorClass: 'social-facebook',
  },
]

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo logo--footer" aria-label="MARICOMX OceanLedger Home">
              <img src="/ihm_logo.webp" alt="OceanLedger by MARICOMX Logo" className="logo-img" width="200" height="50" loading="lazy" />
            </Link>
            <p className="footer-tagline">
              <strong>MARICOMX</strong> · Leading digital platform for IHM Part I maintenance, automated purchase order screening, and fleet hazmat compliance.
            </p>

            <div className="footer-social-block">
              <div className="footer-social-title">
                <span>🌊 Stay Connected</span>
              </div>
              <p className="footer-social-desc">
                Follow us across our social media platforms for the latest updates, maritime insights, and industry news.
              </p>
              <div className="footer-social-links">
                {SOCIAL_LINKS.map(({ name, url, icon: Icon, ariaLabel, colorClass }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`footer-social-btn ${colorClass}`}
                    aria-label={ariaLabel}
                    title={`${name} - MARICOMX`}
                  >
                    <Icon size={18} />
                    <span className="social-btn-text">{name}</span>
                  </a>
                ))}
              </div>
              <div className="footer-social-motto">
                <span>⚓ Maritime Innovation &amp; Safety</span>
              </div>
            </div>
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
          <div className="footer-bottom-copy">
            <span>© 2026 MARICOMX · OceanLedger IHM Platform · All rights reserved</span>
            <span className="footer-brand-note">Follow • Connect • Stay Updated</span>
          </div>
          <div className="footer-legal">
            <Link to="/blogs">Blog</Link>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms &amp; Conditions</a>
            <Link to="/book-demo">Contact / Demo</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
