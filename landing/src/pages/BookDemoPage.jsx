import { useState } from 'react'
import BackgroundVideo from '../components/BackgroundVideo.jsx'
import Nav from '../components/Nav.jsx'
import { useEntranceTrigger } from '../hooks/useEntranceTrigger.js'
import { usePage } from '../hooks/usePage.js'
import '../styles/book-demo.css'

const DEMO_VIDEO = [
  { src: '/video.bookdemo.mp4', type: 'video/mp4' },
  { src: '/video.mp4', type: 'video/mp4' },
  { src: '/video.webm', type: 'video/webm' },
]

const FLEET_SIZES = [
  { value: '1-10', label: '1-10 vessels' },
  { value: '11-50', label: '11-50 vessels' },
  { value: '51-200', label: '51-200 vessels' },
  { value: '200+', label: '200+ vessels' },
]

const ROLES = [
  { value: 'fleet-manager', label: 'Fleet Technical Manager' },
  { value: 'superintendent', label: 'Technical Superintendent' },
  { value: 'hse-director', label: 'HSE & Sustainability Director' },
  { value: 'compliance-officer', label: 'Compliance / Class Officer' },
  { value: 'vessel-operator', label: 'Vessel Owner / Operator' },
  { value: 'other', label: 'Other' },
]

const FLAG_STATES = [
  { value: 'panama', label: '🇵🇦 Panama' },
  { value: 'marshall-islands', label: '🇲🇭 Marshall Islands' },
  { value: 'liberia', label: '🇱🇷 Liberia' },
  { value: 'singapore', label: '🇸🇬 Singapore' },
  { value: 'bahamas', label: '🇧🇸 Bahamas' },
  { value: 'malta', label: '🇲🇹 Malta' },
  { value: 'cyprus', label: '🇨🇾 Cyprus' },
  { value: 'united-kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'norway', label: '🇳🇴 Norway' },
  { value: 'other', label: '🌐 Other Flag State' },
]

export default function BookDemoPage() {
  usePage({
    title: 'Book a Demo — OceanLedger IHMM',
    description:
      'Book a personalized 30-minute demo of OceanLedger IHMM. Discover how our digital platform simplifies hazardous material compliance across your fleet.',
    htmlClass: 'page-book-demo',
  })
  const animate = useEntranceTrigger()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  // Sends the request to /api/contact, which emails it to our inbox via Resend.
  const handleSubmit = async (e) => {
    e.preventDefault()
    const fields = e.currentTarget.elements
    const value = (id) => fields.namedItem(id).value.trim()
    // Send the visible option text (e.g. "11-50 vessels") so the email reads naturally.
    const optionText = (id) => {
      const select = fields.namedItem(id)
      return select.value ? select.options[select.selectedIndex].text : ''
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: value('firstname'),
          lastName: value('lastname'),
          email: value('workemail'),
          phone: value('phone'),
          company: value('companyname'),
          fleetSize: optionText('fleetsize'),
          role: optionText('userrole'),
          flag: optionText('countryflag'),
          notes: value('notes'),
          website: value('website'),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
    } catch (err) {
      console.error('Demo request failed:', err)
      setStatus('error')
    }
  }

  return (
    <>
      <Nav variant="simple" showAccountPrompt />

      <section className={`demo-hero-section${animate ? ' demo-animate' : ''}`}>
        <div className="demo-wire-card">
          <div className="demo-grid">
            <div className="visual-panel">
              <BackgroundVideo id="demoVideo" sources={DEMO_VIDEO} />
              <div className="visual-panel-overlay"></div>
            </div>

            <div className="demo-form-card" id="demo-form-card">
              <div className="form-inner-wrap">
                <div className="eyebrow" style={{ marginBottom: 4 }}>Book a demo</div>
                <h2>Talk to our team</h2>
                <p className="demo-subtitle">
                  Fill in your details and we&apos;ll get back to you within 1 business day to schedule.
                </p>

                {status === 'sent' ? (
                  <div id="form-success-msg" style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div
                      style={{
                        width: 48, height: 48, borderRadius: '50%', background: '#ecfdf5', color: '#10b981', fontSize: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                      }}
                    >
                      ✓
                    </div>
                    <h3 style={{ marginBottom: 8 }}>Demo Request Received!</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                      Thank you. A compliance specialist will confirm your request via email shortly.
                    </p>
                  </div>
                ) : (
                  <form id="demo-request-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="firstname" className="form-label">First Name</label>
                        <input type="text" id="firstname" className="form-control" placeholder="Jane" required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="lastname" className="form-label">Last Name</label>
                        <input type="text" id="lastname" className="form-control" placeholder="Doe" required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="workemail" className="form-label">Email</label>
                      <input type="email" id="workemail" className="form-control" placeholder="jane@company.com" required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Phone Number</label>
                      <input type="tel" id="phone" className="form-control" placeholder="+1 (___) ___-____" required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="companyname" className="form-label">Company Name</label>
                      <input type="text" id="companyname" className="form-control" placeholder="Acme Shipping Ltd." required />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="fleetsize" className="form-label">Fleet Size</label>
                        <select id="fleetsize" className="form-control" required defaultValue="">
                          <option value="" disabled>Select range</option>
                          {FLEET_SIZES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="userrole" className="form-label">Role</label>
                        <select id="userrole" className="form-control" required defaultValue="">
                          <option value="" disabled>Select role</option>
                          {ROLES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="countryflag" className="form-label">Country Flag (optional)</label>
                      <select id="countryflag" className="form-control" defaultValue="">
                        <option value="">Select Flag State (optional)</option>
                        {FLAG_STATES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="notes" className="form-label">What would you like to see? (optional)</label>
                      <input type="text" id="notes" className="form-control" placeholder="e.g. supplier portal, PO auditing, reporting…" />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '16px 0 18px' }}>
                      <input
                        type="checkbox"
                        id="agree-terms"
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: '#0099e6', cursor: 'pointer' }}
                        required
                      />
                      <label htmlFor="agree-terms" style={{ fontSize: '0.82rem', color: '#475569', cursor: 'pointer', lineHeight: 1.4 }}>
                        I agree to be contacted about OceanLedger IHMM products and services
                      </label>
                    </div>

                    {/* Honeypot: hidden from people, bots fill it in and get silently dropped */}
                    <div aria-hidden="true" style={{ position: 'absolute', left: -9999 }}>
                      <label htmlFor="website">Website</label>
                      <input type="text" id="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    {status === 'error' && (
                      <p id="form-error-msg" role="alert" style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#dc2626' }}>
                        Something went wrong sending your request. Please try again, or message us on{' '}
                        <a href="https://wa.me/919867941103" style={{ color: 'inherit', textDecoration: 'underline' }}>WhatsApp</a>.
                      </p>
                    )}

                    <button
                      type="submit"
                      className="btn-primary btn-lg"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? 'Sending…' : 'Request Demo →'}
                    </button>
                  </form>
                )}

                <div className="auth-footer-note" style={{ marginTop: 24, textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8' }}>
                  © OceanLedger IHMM · Privacy Policy · Terms
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
