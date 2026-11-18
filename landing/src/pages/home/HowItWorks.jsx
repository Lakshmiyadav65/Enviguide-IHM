import Reveal from '../../components/Reveal.jsx'

const STEPS = [
  {
    title: 'Add your fleet',
    body: 'Register your vessels, upload existing IHM documentation and set up roles for your fleet management team and onboard officers.',
  },
  {
    title: 'Upload POs',
    body: 'Import purchase orders via CSV or Excel. The system automatically screens every line item for suspected hazardous materials.',
  },
  {
    title: 'Collect MD/SDoC',
    body: 'Send automated requests to suppliers for Material Declarations. They upload through the portal and you get notified when documents arrive.',
  },
  {
    title: 'Generate reports',
    body: 'Export audit-ready IHM Part I reports in formats accepted by classification societies, ready for surveyor or port-state inspection.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works" aria-labelledby="how-it-works-heading">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">Rapid fleet onboarding</div>
          <h2 id="how-it-works-heading">How does automated IHM compliance work for ship fleets?</h2>
          <p className="section-desc" style={{ maxWidth: 720, margin: '14px auto 0' }}>
            Automated IHM compliance works by linking vessel purchasing directly to hazardous material registers. The platform flags suspect line items, requests supplier Material Declarations, and compiles verified certificates into live General Arrangement plans. Fleet managers achieve continuous inspection readiness across every ship without manual paperwork.
          </p>
        </Reveal>
        <div className="steps-grid">
          {STEPS.map((step, index) => (
            <Reveal as="article" className="step-card" key={step.title}>
              <div className="step-num">{index + 1}</div>
              {index < STEPS.length - 1 && <div className="step-connector"></div>}
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
