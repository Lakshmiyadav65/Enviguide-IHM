import { useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import Nav from '../../components/Nav.jsx'
import Reveal from '../../components/Reveal.jsx'
import { usePage } from '../../hooks/usePage.js'
import {
  BulkCarrierIllustration, ContainerShipIllustration, OffshoreIllustration,
  PassengerShipIllustration, TankerIllustration,
} from './Illustrations.jsx'
import '../../styles/industries.css'

// `id` is the anchor used by /industries?type=<id> (linked from the nav's Industries dropdown).
const INDUSTRIES = [
  {
    id: 'bulk-carriers',
    badge: 'Bulk Carriers',
    heading: 'IHM compliance built for dry-bulk fleet operations',
    desc: 'Map cargo-hold coatings, hatch cover machinery, and hold-cleaning chemicals directly to your General Arrangement plan with PO screening built for dry-bulk shipping.',
    checks: [
      'Cargo hold coating & lining register',
      'Hatch cover & grab-gear equipment records',
      'Hold-cleaning chemical & fumigant screening',
    ],
    stats: [
      { num: '100%', label: 'Hold Coating Coverage' },
      { num: '<5 min', label: 'PO Screening Speed' },
    ],
    visualLabel: 'Cargo Hold Hazmat Mapping',
    Illustration: BulkCarrierIllustration,
  },
  {
    id: 'tankers',
    reverse: true,
    badge: 'Tankers',
    heading: 'Complete IHM tracking for tanker & chemical fleets',
    desc: 'Track cargo tank coatings, pump room machinery, and inert gas systems with hazmat screening tuned for liquid bulk and chemical tanker operations.',
    checks: [
      'Cargo & ballast tank coating register',
      'Pump room & IGS equipment tracking',
      'Chemical cargo compatibility screening',
    ],
    stats: [
      { num: '100%', label: 'Pump Room & IGS Coverage' },
      { num: '3×', label: 'Faster Tank Audits' },
    ],
    visualLabel: 'Cargo Tank Level Monitoring',
    Illustration: TankerIllustration,
  },
  {
    id: 'container-ships',
    badge: 'Container Ships',
    heading: 'High-speed IHM compliance for container fleets',
    desc: 'Manage lashing equipment, reefer plant refrigerants, and hold/deck coatings across large container vessels operating on tight port turnaround schedules.',
    checks: [
      'Lashing & securing equipment register',
      'Reefer plant & refrigerant tracking',
      'Hold & deck coating mapping',
    ],
    stats: [
      { num: 'Zero', label: 'Port-State Control Delays' },
      { num: '<2 min', label: 'Reefer Report Generation' },
    ],
    visualLabel: 'Container Load-out Tracking',
    Illustration: ContainerShipIllustration,
  },
  {
    id: 'offshore-vessels',
    reverse: true,
    badge: 'Offshore Vessels',
    heading: 'Specialized IHM management for OSV & MODU fleets',
    desc: 'Cover specialized offshore machinery, DP systems, subsea equipment, and charterer-specific compliance reporting across your offshore support fleet.',
    checks: [
      'Specialized machinery & DP system register',
      'Subsea equipment material tracking',
      'Charterer-specific compliance reporting',
    ],
    stats: [
      { num: '100%', label: 'DP System Material Audit' },
      { num: '24/7', label: 'Live Charterer Compliance' },
    ],
    visualLabel: 'Dynamic Positioning Monitoring',
    Illustration: OffshoreIllustration,
  },
  {
    id: 'passenger-ships',
    badge: 'Passenger Ships',
    heading: 'Interior & zone compliance for cruise & passenger ships',
    desc: 'Track interior furnishings, insulation, fire-safety materials, and public-area finishes across complex multi-deck passenger and cruise ship interiors.',
    checks: [
      'Interior furnishing & insulation register',
      'Fire-safety material tracking',
      'Public area finish & refurbishment logging',
    ],
    stats: [
      { num: '100%', label: 'Zone-by-Zone Coverage' },
      { num: 'Fast', label: 'Refurbishment Audit' },
    ],
    visualLabel: 'Occupancy Zone Monitoring',
    Illustration: PassengerShipIllustration,
  },
]

export default function IndustriesPage() {
  usePage({
    title: 'Industries & Vessel Types — OceanLedger IHMM Compliance',
    description:
      'Tailored IHM compliance solutions for Bulk Carriers, Tankers, Container Ships, Offshore Support Vessels, and Passenger Ships.',
    htmlClass: 'page-industries',
  })

  // Scroll to the vessel type picked in the nav (also when the same link is clicked again).
  const [searchParams] = useSearchParams()
  const { key } = useLocation()
  const type = searchParams.get('type')

  useEffect(() => {
    if (!type) return
    const timer = setTimeout(() => {
      document.getElementById(type)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => clearTimeout(timer)
  }, [type, key])

  return (
    <>
      <Nav variant="simple" activeLink="industries" />

      <main>
        {INDUSTRIES.map((industry) => (
          <IndustrySection key={industry.id} {...industry} />
        ))}

        <section className="cta-banner" style={{ background: '#071c37', color: '#fff', textAlign: 'center', padding: '72px 24px' }}>
          <div className="container">
            <h2 style={{ color: '#fff', fontSize: '2.1rem', marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
              Ready to digitize IHM compliance for your fleet?
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 600, margin: '0 auto 32px', fontSize: '1.05rem' }}>
              Book a personalized 30-minute demonstration tailored to your vessel type.
            </p>
            <Link to="/book-demo" className="btn-primary btn-lg">Book a Demo →</Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <img src="/ihm_logo.webp" alt="OceanLedger IHMM Logo" className="logo-img" />
            </Link>
            <p>© 2026 OceanLedger IHMM. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <Link to="/#features">Features</Link>{' '}
            <Link to="/industries">Industries</Link>{' '}
            <Link to="/book-demo">Book a Demo</Link>{' '}
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

function IndustrySection({ id, reverse, badge, heading, desc, checks, stats, visualLabel, Illustration }) {
  return (
    <section className="ind-section" id={id}>
      <div className="container">
        <div className={`ind-split${reverse ? ' reverse' : ''}`}>
          <Reveal className="ind-copy" variant={reverse ? 'up-right' : 'up-left'}>
            <div className="ind-badge">{badge}</div>
            <h2 className="ind-heading">{heading}</h2>
            <p className="ind-desc">{desc}</p>
            <div className="ind-checklist">
              {checks.map((check) => (
                <Reveal className="ind-check-card" key={check}>
                  <span className="ind-check-icon">✓</span> {check}
                </Reveal>
              ))}
            </div>
            <Reveal className="ind-stats-box">
              {stats.map((stat) => (
                <div className="ind-stat-item" key={stat.label}>
                  <div className="ind-stat-num">{stat.num}</div>
                  <div className="ind-stat-label">{stat.label}</div>
                </div>
              ))}
            </Reveal>
          </Reveal>
          <Reveal className="ind-visual-wrap" variant={reverse ? 'up-left' : 'up-right'}>
            <div className="ind-visual-card">
              <div className="ind-visual-badge">{visualLabel}</div>
              <Illustration />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
