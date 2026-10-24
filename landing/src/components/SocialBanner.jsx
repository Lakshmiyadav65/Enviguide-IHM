import Reveal from './Reveal.jsx'
import { FacebookIcon, InstagramIcon, LinkedInIcon } from './Icons.jsx'

const CHANNELS = [
  {
    name: 'LinkedIn',
    handle: '@maricomx',
    url: 'https://www.linkedin.com/company/maricomx/',
    icon: LinkedInIcon,
    theme: 'social-card--linkedin',
    label: 'Professional Network',
    desc: 'Maritime regulatory breakdowns, IHM best practices, and executive commentary.',
    cta: 'Follow on LinkedIn →',
  },
  {
    name: 'Instagram',
    handle: '@maricomx_official',
    url: 'https://www.instagram.com/maricomx_official/',
    icon: InstagramIcon,
    theme: 'social-card--instagram',
    label: 'Visual Updates',
    desc: 'Fleet highlights, team spotlights, maritime technology in action, and infographics.',
    cta: 'Follow on Instagram →',
  },
  {
    name: 'Facebook',
    handle: 'MARICOMX Official',
    url: 'https://www.facebook.com/profile.php?id=61594895703962',
    icon: FacebookIcon,
    theme: 'social-card--facebook',
    label: 'Community & News',
    desc: 'Latest company announcements, feature updates, and maritime community news.',
    cta: 'Connect on Facebook →',
  },
]

export default function SocialBanner() {
  return (
    <section className="social-banner-section" id="social-connect">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">⚓ MARICOMX — Maritime Innovation &amp; Safety</div>
          <h2 className="social-banner-heading">🌊 MARICOMX | Stay Connected</h2>
          <p className="section-desc social-banner-sub">
            Follow us across our social media platforms for the latest updates, maritime insights, and industry news.
          </p>
          <div className="social-pill-badge">
            <span>Follow • Connect • Stay Updated</span>
          </div>
        </Reveal>

        <div className="social-cards-grid">
          {CHANNELS.map((item) => {
            const Icon = item.icon
            return (
              <Reveal className={`social-connect-card ${item.theme}`} key={item.name} variant="zoom">
                <div className="scc-header">
                  <div className="scc-icon-wrap">
                    <Icon size={24} />
                  </div>
                  <div className="scc-meta">
                    <span className="scc-label">{item.label}</span>
                    <h3 className="scc-name">{item.name}</h3>
                  </div>
                </div>
                <p className="scc-desc">{item.desc}</p>
                <div className="scc-footer">
                  <span className="scc-handle">{item.handle}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scc-btn"
                    aria-label={`Follow MARICOMX on ${item.name}`}
                  >
                    {item.cta}
                  </a>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
