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
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">Rapid fleet onboarding</div>
          <h2>From setup to audit-ready in 4 steps</h2>
        </Reveal>
        <div className="steps-grid">
          {STEPS.map((step, index) => (
            <Reveal className="step-card" key={step.title}>
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
