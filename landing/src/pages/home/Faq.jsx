import { useState } from 'react'
import Reveal from '../../components/Reveal.jsx'

const FAQS = [
  {
    q: 'What is IHM Part I maintenance for ships?',
    a: 'IHM Part I maintenance is the continuous recording of hazardous materials installed on a ship throughout its working life. Fleet teams must update records whenever new equipment arrives or repairs occur, ensuring compliance with the Hong Kong Convention and EU Ship Recycling Regulation.',
  },
  {
    q: 'How much time does OceanLedger IHM software save compared to manual processes?',
    a: 'OceanLedger IHM software saves fleet operators sixty to eighty percent of compliance time. The platform replaces slow spreadsheets with automated purchase order scans and direct supplier uploads. This stops survey findings and port detentions before ships enter harbor.',
  },
  {
    q: 'Does it support Hong Kong Convention & EU SRR?',
    a: 'Yes. OceanLedger supports both regulations by checking onboard substances against mandatory Hong Kong Convention and EU SRR substance tables. The software updates hazardous material quantities and produces approved Part I reports ready for classification surveyors and port inspectors.',
  },
  {
    q: 'How do suppliers submit MD and SDoC documents?',
    a: 'Suppliers submit Material Declarations and SDoC documents through a secure web link without creating an account. Once uploaded, documents are checked and attached to matching purchase orders and vessel records automatically within seconds.',
  },
  {
    q: 'Is it suitable for different vessel types?',
    a: 'Yes, OceanLedger supports all commercial vessels including bulk carriers, oil tankers, container ships, offshore vessels, and passenger liners. The system adapts to any ship layout, equipment list, and General Arrangement plan.',
  },
  {
    q: 'Why is digital IHM management essential for modern ship operations?',
    a: 'Digital IHM management is essential because manual tracking often leads to missing declarations, survey delays, and port-state detentions. Digital records give superintendents instant fleet visibility and guarantee compliant recycling documentation.',
  },
]

export default function Faq() {
  // Only one answer is open at a time.
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="faq" id="faq" aria-labelledby="faq-heading">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">Help &amp; guidance</div>
          <h2 id="faq-heading">Frequently asked questions</h2>
        </Reveal>
        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            const id = `faq${index + 1}`
            return (
              <Reveal as="article" className={`faq-item${isOpen ? ' open' : ''}`} key={id}>
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
