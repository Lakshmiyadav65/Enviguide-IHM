import { Link } from 'react-router-dom'
import BackgroundVideo from '../../components/BackgroundVideo.jsx'
import { useEntranceTrigger } from '../../hooks/useEntranceTrigger.js'

const HERO_VIDEO = [
  { src: '/video.mp4', type: 'video/mp4' },
  { src: '/video.webm', type: 'video/webm' },
]

const TRUST_LOGOS = ['MAERSK', 'MSC', 'CMA CGM', 'HAPAG']

export default function Hero() {
  const animate = useEntranceTrigger()

  return (
    <section className={`hero${animate ? ' hero-animate' : ''}`} id="hero">
      <div className="hero-bg">
        <BackgroundVideo className="hero-video" sources={HERO_VIDEO} pauseOffscreen />
        <div className="hero-video-overlay"></div>
        <div className="hero-glow"></div>
      </div>
      <div className="container hero-inner">
        <div className="hero-content">
          <div className="badge">
            <span className="badge-dot"></span>
            MARICOMX · OceanLedger IHM Platform
          </div>
          <h1>IHM Management Software for Smarter, Audit-Ready Fleets</h1>
          <p className="hero-desc">
            Manage Inventory of Hazardous Materials (IHM) Part I records, screen purchase orders, collect supplier declarations
            and organise compliance reporting across your fleet from one digital platform.
          </p>
          <div className="hero-cta">
            <Link to="/book-demo" className="btn-primary btn-lg" id="hero-trial">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Book a Demo
            </Link>
            <a href="#features" className="btn-outline btn-lg" id="hero-features">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Explore IHM Features
            </a>
          </div>
          <div className="hero-micro">
            <span>✓ Fleet-wide setup</span>
            <span>✓ Hong Kong Convention &amp; EU SRR ready</span>
            <span>✓ MEPC Guidelines compliant</span>
          </div>
          <div className="trust-strip">
            <span className="trust-label">Engineered for commercial shipping &amp; fleet managers</span>
            <div className="trust-logos">
              {TRUST_LOGOS.map((name) => (
                <div className="trust-logo" key={name}>{name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
