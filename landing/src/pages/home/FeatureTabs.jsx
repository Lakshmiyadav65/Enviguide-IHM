import { useEffect, useState } from 'react'
import Reveal from '../../components/Reveal.jsx'

const TABS = [
  {
    key: 'hazmat',
    label: 'Hazmat Mapping',
    stageLabel: 'Deck & Area Hazmat Map',
    image: '/one_image.png',
    imageAlt: 'Deck & Area Hazmat Map',
    eyebrow: 'Hazardous Material Mapping',
    title: 'Map every hazardous material to deck, area & equipment',
    body: 'Maintain a live, searchable inventory of hazardous materials onboard. Every item is mapped to GA plans, decks and equipment, complete with quantities, locations and supporting documents.',
    checklist: [
      'Deck & area-level hazmat mapping',
      'Equipment-linked material records',
      'GA plan & deck plan viewer',
      'Searchable materials register',
    ],
  },
  {
    key: 'po',
    label: 'PO Audits',
    stageLabel: 'Purchase Order Line-Item Screening',
    image: '/two_image.png',
    imageAlt: 'Purchase Order Line-Item Screening',
    eyebrow: 'Purchase Order Audits',
    title: 'Auto-screen purchase orders for suspected hazmat',
    body: 'Upload purchase orders by spreadsheet and let the system flag line items against your suspected-keyword list, so nothing hazardous slips onboard undocumented.',
    checklist: [
      'Bulk PO upload (CSV / Excel)',
      'Keyword-based hazmat flagging',
      'Line item review and approval workflow',
    ],
  },
  {
    key: 'mdsdc',
    label: 'MD & SDoC',
    stageLabel: 'MD / SDoC Auto-Collection',
    image: '/three_image.png',
    imageAlt: 'MD & SDoC Collection',
    eyebrow: 'MD & SDoC Collection',
    title: 'Collect Material Declarations with the email chase',
    body: 'Send suppliers a secure upload link. They submit MD/SDoC documents through a branded portal with no login required, and everything files itself against the correct PO and vessel automatically.',
    checklist: [
      'Token-based public supplier upload',
      'Automated MD/SDoC request emails',
      'Document audit & clarification requests',
    ],
  },
  {
    key: 'supplier',
    label: 'Supplier Portal',
    stageLabel: 'Supplier Upload Flow',
    image: '/four_image.png',
    imageAlt: 'Supplier Portal',
    eyebrow: 'Supplier Portal',
    title: 'A frictionless portal your suppliers will actually use',
    body: 'Give suppliers a clean, branded experience to submit documentation. No account creation needed: just a secure link that accepts their documents and routes them automatically.',
    checklist: [
      'Branded supplier-facing portal',
      'No supplier account required',
      'Automatic document routing & filing',
    ],
  },
  {
    key: 'reports',
    label: 'Compliance Reports',
    stageLabel: 'Class-Ready Report Export',
    image: '/five_image.png',
    imageAlt: 'Compliance Reports',
    eyebrow: 'Compliance Reports',
    title: 'Generate class-ready compliance reports in minutes',
    body: 'Export IHM Part I reports formatted for classification societies, port-state control and recycling yards. A full audit trail is included automatically with every report.',
    checklist: [
      'One-click PDF generation',
      'Classification society formats',
      'Full audit trail included',
      'Hong Kong Convention & EU SRR compliant',
    ],
  },
]

const TAB_DURATION = 6000 // ms per tab; keep in sync with the railFill animation in global.css

export default function FeatureTabs() {
  const [activeIndex, setActiveIndex] = useState(0)
  // Bumped on every activation (auto or click) to restart both the timer and the progress rail.
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex((index) => (index + 1) % TABS.length)
      setCycle((c) => c + 1)
    }, TAB_DURATION)
    return () => clearTimeout(timer)
  }, [cycle])

  const selectTab = (index) => {
    setActiveIndex(index)
    setCycle((c) => c + 1)
  }

  return (
    <section className="feature-tabs" id="features">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">Purpose-built for IHM compliance</div>
          <h2>One platform for the entire IHM lifecycle</h2>
        </Reveal>

        <div className="tabs-nav" role="tablist" aria-label="Features">
          {TABS.map((tab, index) => (
            <button
              key={tab.key}
              className={`tab${index === activeIndex ? ' active' : ''}`}
              role="tab"
              aria-selected={index === activeIndex}
              data-tab={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => selectTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tabs-progress-rail">
          {/* Remounting on each cycle restarts the CSS fill animation. */}
          <div className="tabs-progress-fill animating" id="tabs-rail-fill" key={cycle}></div>
        </div>

        {TABS.map((tab, index) => (
          <div
            key={tab.key}
            className={`tab-content${index === activeIndex ? '' : ' hidden'}`}
            id={`tab-${tab.key}-panel`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.key}`}
          >
            <div className="split">
              <div className="split-visual anim-stage-wrap">
                <div className="anim-stage-label">{tab.stageLabel}</div>
                <img src={tab.image} alt={tab.imageAlt} className="anim-stage-img" />
              </div>
              <div className="split-copy">
                <div className="eyebrow">{tab.eyebrow}</div>
                <h2>{tab.title}</h2>
                <p>{tab.body}</p>
                <ul className="checklist">
                  {tab.checklist.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
