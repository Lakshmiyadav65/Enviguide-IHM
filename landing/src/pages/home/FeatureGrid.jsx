import Reveal from '../../components/Reveal.jsx'
import {
  BookIcon, ClockIcon, DocumentIcon, GridIcon, HouseIcon, ReportIcon, StarIcon, UsersIcon,
} from '../../components/Icons.jsx'

const FEATURES = [
  {
    icon: GridIcon,
    color: 'fc-blue',
    title: 'Fleet & Vessel Management',
    body: 'Manage your entire fleet from a single dashboard. Add vessels, assign roles and track IHM status across all ships simultaneously.',
  },
  {
    icon: ClockIcon,
    color: 'fc-teal',
    title: 'Hazmat Material Mapping',
    body: 'Map hazardous materials to GA plans, decks and equipment with quantities, locations and supporting compliance documents.',
  },
  {
    icon: HouseIcon,
    color: 'fc-orange',
    title: 'Purchase Order Auditing',
    body: 'Upload PO spreadsheets and automatically flag suspected hazardous line items using a configurable keyword engine.',
  },
  {
    icon: DocumentIcon,
    color: 'fc-purple',
    title: 'MD/SDoC Collection',
    body: 'Automate the collection of Material Declarations and Statements of Compliance from your global supplier base.',
  },
  {
    icon: StarIcon,
    color: 'fc-red',
    title: 'Suspected Keyword Engine',
    body: 'Maintain and customize a library of hazardous material keywords used to flag purchase order items automatically.',
  },
  {
    icon: ReportIcon,
    color: 'fc-blue',
    title: 'GA / Deck Plan Viewer',
    body: 'Visualize hazardous material locations on General Arrangement and deck plans with interactive zone overlays.',
  },
  {
    icon: BookIcon,
    color: 'fc-teal',
    title: 'Compliance Reports (PDF)',
    body: 'Export IHM Part I reports formatted for classification societies, port-state control and recycling yard inspections.',
  },
  {
    icon: UsersIcon,
    color: 'fc-purple',
    title: 'Role-Based Access Control',
    body: 'Assign fleet managers, vessel officers, surveyors and read-only auditors with granular permission controls.',
  },
]

export default function FeatureGrid() {
  return (
    <section className="feature-grid" id="all-features">
      <div className="container">
        <Reveal className="section-header center">
          <div className="eyebrow">Full-coverage compliance toolset</div>
          <h2>Every tool your fleet needs, all in one place</h2>
          <p className="section-desc">
            From hazmat mapping and PO screening to supplier document collection and class-ready reporting,
            OceanLedger IHMM covers the complete IHM Part I lifecycle across your entire fleet.
          </p>
        </Reveal>
        <div className="grid3">
          {FEATURES.map(({ icon: Icon, color, title, body }) => (
            <Reveal className="feature-card" key={title}>
              <div className={`fc-icon-wrap ${color}`}>
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
