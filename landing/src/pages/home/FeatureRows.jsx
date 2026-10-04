import Reveal from '../../components/Reveal.jsx'

const ROWS = [
  {
    id: 'po-audits',
    stageLabel: 'Purchase Order Screening',
    image: '/two_image.png',
    imageAlt: 'Purchase Order Screening',
    eyebrow: 'Purchase Order Audits',
    title: 'Auto-screen purchase orders for suspected hazmat',
    body: 'Upload purchase orders by spreadsheet and let the system flag line items against your keyword list, so nothing hazardous slips onboard undocumented.',
    checklist: [
      'Bulk PO upload (CSV / Excel)',
      'Keyword-based hazmat flagging',
      'Line item review and approval workflow',
    ],
    stats: [
      { num: '12,000+', label: 'PO lines screened / month' },
      { num: '99%', label: 'Keyword match accuracy' },
    ],
  },
  {
    id: 'supplier-portal',
    reverse: true,
    stageLabel: 'Supplier Upload Flow',
    image: '/four_image.png',
    imageAlt: 'Supplier Upload Flow',
    eyebrow: 'Supplier Portal',
    title: 'A frictionless portal your suppliers will actually use',
    body: 'Give suppliers a clean, branded experience to submit documentation. No account creation needed: just a secure link that accepts their documents and routes them automatically.',
    checklist: [
      'Branded supplier-facing portal',
      'No supplier account required',
      'Automatic document routing & filing',
    ],
    stats: [
      { num: 'Zero', label: 'Supplier account needed' },
      { num: '<2 min', label: 'Avg supplier submission time' },
    ],
  },
  {
    id: 'mdsdc',
    stageLabel: 'MD / SDoC Auto-Collection',
    image: '/three_image.png',
    imageAlt: 'MD & SDoC Auto-Collection',
    eyebrow: 'MD & SDoC Collection',
    title: 'Collect Material Declarations with the email chase',
    body: 'Send suppliers a secure upload link. They submit MD/SDoC documents through a branded portal with no login required, and everything files itself against the correct PO and vessel automatically.',
    checklist: [
      'Token-based public supplier upload',
      'Automated MD/SDoC request emails',
      'Document audit & clarification requests',
      'Auto-routed to correct PO & vessel',
    ],
    stats: [
      { num: '80%', label: 'Reduction in email follow-ups' },
      { num: '3×', label: 'Faster document collection' },
    ],
  },
]

export default function FeatureRows() {
  return ROWS.map((row) => <FeatureRow key={row.id} {...row} />)
}

function FeatureRow({ id, reverse, stageLabel, image, imageAlt, eyebrow, title, body, checklist, stats }) {
  // Whichever block sits on the left slides in from the left.
  const visual = (
    <Reveal className="split-visual anim-stage-wrap" variant={reverse ? 'right' : 'left'}>
      <div className="anim-stage-label">{stageLabel}</div>
      <img src={image} alt={imageAlt} className="anim-stage-img" />
    </Reveal>
  )
  const copy = (
    <Reveal className="split-copy" variant={reverse ? 'left' : 'right'}>
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      <p>{body}</p>
      <ul className="checklist">
        {checklist.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <div className="feature-row-stats">
        {stats.map((stat) => (
          <div className="fr-stat" key={stat.label}>
            <span className="fr-stat-num">{stat.num}</span>
            <span className="fr-stat-lbl">{stat.label}</span>
          </div>
        ))}
      </div>
    </Reveal>
  )

  return (
    <section className={`feature-row${reverse ? ' feature-row--alt' : ''}`} id={id}>
      <div className="container">
        <div className={`split${reverse ? ' split--reverse' : ''}`}>
          {reverse ? <>{copy}{visual}</> : <>{visual}{copy}</>}
        </div>
      </div>
    </section>
  )
}
