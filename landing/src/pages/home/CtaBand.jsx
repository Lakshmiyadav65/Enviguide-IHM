import { Link } from 'react-router-dom'
import BackgroundVideo from '../../components/BackgroundVideo.jsx'
import Reveal from '../../components/Reveal.jsx'

const CTA_VIDEO = [
  { src: '/video.bookdemo.mp4', type: 'video/mp4' },
  { src: '/video.mp4', type: 'video/mp4' },
]

export default function CtaBand() {
  return (
    <section className="cta-band" id="cta">
      <div className="cta-video-bg">
        <BackgroundVideo className="cta-video" sources={CTA_VIDEO} />
        <div className="cta-video-overlay"></div>
      </div>
      <Reveal className="container cta-inner">
        <h2>Ready to keep your fleet permanently audit-ready?</h2>
        <p>Book a personalized demo or speak with our team about rolling OceanLedger IHMM out across your fleet.</p>
        <div className="cta-actions">
          <Link to="/book-demo" className="btn-primary btn-lg" id="cta-trial">Book a Demo</Link>
          <Link to="/book-demo" className="btn-outline btn-lg" id="cta-sales">Talk to Our Team</Link>
        </div>
      </Reveal>
    </section>
  )
}
