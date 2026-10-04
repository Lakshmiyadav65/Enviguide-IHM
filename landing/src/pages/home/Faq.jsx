import { useState } from 'react'
import Reveal from '../../components/Reveal.jsx'

const FAQS = [
  {
    q: 'How much time does OceanLedger IHMM save compared to manual processes?',
    a: 'Fleet operators typically save 60–80% of the time spent on IHM maintenance when moving from paper-based or spreadsheet processes to OceanLedger IHMM. Beyond time savings, you significantly reduce the risk of costly port-state detentions and class survey findings caused by incomplete or outdated IHM records. Most customers report measurable efficiency gains within the first few months of deployment.',
  },
  {
    q: 'Does it support Hong Kong Convention & EU SRR?',
    a: 'Yes. OceanLedger IHMM is built from the ground up to support both the Hong Kong International Convention for the Safe and Environmentally Sound Recycling of Ships (HKC) and the EU Ship Recycling Regulation (EU SRR). Reports are formatted to meet the specific requirements of each framework, including mandatory annexes and material thresholds.',
  },
  {
    q: "Can it be customized to our fleet's workflow?",
    a: 'Absolutely. You can customize the keyword library, approval workflows, notification templates and report formats. Role-based access control lets you tailor permissions for fleet managers, vessel officers, surveyors and external auditors. Our team also provides onboarding support to configure the system around your existing processes.',
  },
  {
    q: 'How do suppliers submit MD/SDoC documents?',
    a: 'Suppliers receive a secure, token-based link via email. They click the link and reach a branded upload portal where they can attach MD or SDoC documents without creating an account. Documents are automatically routed to the correct purchase order and vessel record. You get notified immediately upon submission, and can request clarifications directly through the portal.',
  },
  {
    q: 'Is it suitable for different vessel types?',
    a: 'Yes. OceanLedger IHMM supports all commercially operated vessel types including bulk carriers, tankers, container ships, ro-ro vessels, offshore support vessels and passenger ships. The GA plan viewer and hazmat mapping system are flexible enough to accommodate any vessel layout and equipment configuration.',
  },
]

export default function Faq() {
  // Only one answer is open at a time.
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="faq" id="faq">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">Help &amp; guidance</div>
          <h2>Frequently asked questions</h2>
        </Reveal>
        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            const id = `faq${index + 1}`
            return (
              <Reveal className={`faq-item${isOpen ? ' open' : ''}`} key={id}>
                <button className="faq-q" aria-expanded={isOpen} id={id} onClick={() => setOpenIndex(isOpen ? null : index)}>
                  {faq.q}
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-a" id={`${id}-a`}>
                  <p>{faq.a}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
