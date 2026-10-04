import Reveal from '../../components/Reveal.jsx'

const REVIEWS = [
  {
    quote: 'OceanLedger IHMM transformed how we manage hazardous material compliance across our 42-vessel fleet. What used to take weeks of manual paperwork is now done in hours. Our last DNV class survey was completed with zero deficiencies.',
    fleet: 'Fleet: 42 Bulk Carriers & Tankers',
    name: 'Capt. James Hartley',
    role: 'Fleet Technical Manager · Pacific Carriers Ltd, Singapore',
    avatar: { bg: '#e0f2fe', fg: '#0ea5e9' },
  },
  {
    quote: 'The PO screening feature alone saves us countless hours per month. Flagging suspected hazardous items automatically means we never miss a Material Declaration. Supplier submission through the portal is completely seamless.',
    fleet: 'Fleet: 18 Offshore Support Vessels',
    name: 'Anna Kowalski',
    role: 'VP of HSE & Sustainability · North Sea Shipping, Oslo',
    avatar: { bg: '#fce7f3', fg: '#ec4899' },
  },
  {
    quote: 'We manage a mixed fleet across three flag states. OceanLedger IHMM handles all the complexity for us: a single platform covering both HKC and EU SRR compliance. Implementation was incredibly fast and smooth.',
    fleet: 'Fleet: 35 Container Ships',
    name: 'Rajesh Menon',
    role: 'Senior Technical Superintendent · Global Maritime Group, Mumbai',
    avatar: { bg: '#ecfdf5', fg: '#10b981' },
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">Proven Results Across Global Fleets</div>
          <h2>Trusted by compliance &amp; fleet teams</h2>
          <p className="section-desc">
            See how leading vessel managers, superintendents, and HSE directors maintain 100% audit readiness with
            OceanLedger IHMM.
          </p>
          <div className="rating-row">
            <div className="stars">★★★★★</div>
            <span className="rating-text">
              <strong>4.9 / 5.0 Rating</strong> · Based on 140+ Fleet Inspections &amp; Class Audits
            </span>
          </div>
        </Reveal>

        <div className="quotes-grid">
          {REVIEWS.map((review) => (
            <Reveal className="quote-card" variant="zoom" key={review.name}>
              <div className="quote-card-top">
                <div className="stars">★★★★★</div>
                <span className="verified-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified Operator
                </span>
              </div>
              <p className="quote-text">{`"${review.quote}"`}</p>
              <div className="quote-fleet-chip">{review.fleet}</div>
              <div className="quote-author">
                <div className="avatar">
                  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                    <circle cx="19" cy="19" r="19" fill={review.avatar.bg} />
                    <circle cx="19" cy="15" r="6" fill={review.avatar.fg} />
                    <path d="M7 35c0-7 5-11 12-11s12 4 12 11" fill={review.avatar.fg} />
                  </svg>
                </div>
                <div>
                  <div className="author-name">{review.name}</div>
                  <div className="author-title">{review.role}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
