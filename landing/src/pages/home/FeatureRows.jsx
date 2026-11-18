import Reveal from '../../components/Reveal.jsx'

const ROWS = [
  {
    id: 'po-audits',
    stageLabel: 'Purchase Order Screening',
    image: '/two_image.webp',
    imageAlt: 'Purchase Order Screening for Ship Hazardous Materials',
    eyebrow: 'Automated Purchase Order Audits',
    title: 'How to screen purchase orders for suspected ship hazmat?',
    body: 'Automated purchase order screening is the process of checking ship requisitions against hazardous substance lists before delivery. OceanLedger scans PO line items in bulk, alerts superintendents to suspected items, and flags missing Material Declarations early so hazardous items never reach your ships uncertified.',
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
    image: '/four_image.webp',
    imageAlt: 'Maritime Supplier Portal for IHM Documentation',
    eyebrow: 'Frictionless Supplier Collaboration',
    title: 'What is an IHM supplier portal for marine vendors?',
    body: 'An IHM supplier portal is a secure web link where maritime vendors upload required Material Declarations and Statements of Compliance. Vendors submit verified certificates without passwords or logins. Documents route automatically to matching purchase orders, cutting email follow-ups by eighty percent.',
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
    image: '/three_image.webp',
    imageAlt: 'Automated Material Declaration and SDoC Collection Flow',
    eyebrow: 'MD & SDoC Auto-Collection',
    title: 'How to automate Material Declaration (MD) & SDoC collection?',
    body: 'Material Declaration and SDoC collection is an automated compliance workflow that requests and verifies supplier hazardous substance forms. When procurement teams place orders, the system sends token links to suppliers, monitors submission status, and stores validated documents directly in your ship hazardous material log.',
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
      <img
        src={image}
        alt={imageAlt}
        className="anim-stage-img"
        width="1672"
        height="941"
        loading="lazy"
        decoding="async"
      />
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
