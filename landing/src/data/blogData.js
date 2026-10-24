// Initial foundational blog articles for MARICOMX (pre-publication / draft stage)
// Focused on search intent: IHM Part I Maintenance, MD/SDoC, HKC vs EU SRR, and PO Screening

export const BLOG_POSTS = [
  {
    id: 'ihm-part-1-maintenance-checklist',
    slug: 'ihm-part-1-maintenance-checklist',
    title: 'IHM Part I Maintenance Checklist: Keeping Your Fleet Audit-Ready for Hong Kong Convention & EU SRR',
    subtitle: 'A practical, step-by-step checklist for superintendents and compliance officers to maintain continuous, verifiable records.',
    category: 'Compliance Checklist',
    categoryColor: 'badge-teal',
    readTime: '7 min read',
    date: 'October 2026',
    author: {
      name: 'Capt. H. Lindqvist',
      role: 'Principal Maritime Compliance Specialist, MARICOMX Technical Advisory',
    },
    status: 'Draft / Editorial Review',
    statusNote: 'Pre-Publication Preview · Staged for SEO launch',
    excerpt: 'Avoid last-minute class survey findings and port-state control delays. Discover the essential onboard workflow to track equipment replacements, shipyard modifications, and hazmat records continuously.',
    keywords: [
      'IHM Part I maintenance',
      'Hong Kong Convention compliance',
      'EU SRR checklist',
      'Inventory of Hazardous Materials ship audit',
      'vessel superintendent compliance',
    ],
    sections: [
      {
        heading: '1. Why Spreadsheet-Led IHM Maintenance Fails Class Surveys',
        content: `When the Inventory of Hazardous Materials (IHM) was first compiled for your vessel, an accredited hazmat expert sampled decks, machinery spaces, and accommodation zones. That baseline report represented a single snapshot in time.

In operational reality, a commercial vessel is continuously modified. Main engine spares are fitted, electrical switchboards are overhauled, pipe gaskets are renewed during drydocking, and hull coatings are touched up in port. Under both IMO MEPC.269(68) and EU Ship Recycling Regulation (EU SRR 1257/2013), **any equipment or material brought onboard that contains Annex I or Annex II hazardous substances must be recorded in IHM Part I**.

Spreadsheets inevitably lead to broken audit trails: missing Material Declarations (MD), misplaced Supplier Declarations of Conformity (SDoC), and unrecorded deck modifications that surface only when a Class surveyor or Port State Control inspector boards.`,
      },
      {
        heading: '2. The 5-Point IHM Maintenance Checklist',
        content: `Follow this routine verification cadence to ensure your fleet never faces an audit finding:`,
        checklist: [
          'Pre-Procurement Screening: Flag high-risk requisition keywords (coatings, gaskets, brake linings, insulation, refrigerants) before PO confirmation.',
          'Mandatory MD/SDoC Attachment: Enforce supplier submission of MD/SDoC matching IMO MEPC.269(68) Appendix 6 and 7 before invoice release.',
          'Deck & Location Mapping: Immediately record the physical installation zone (deck number, frame, machinery ID) once spare parts are fitted onboard.',
          'Removal & Consumption Logs: When hazardous machinery or materials are permanently removed or consumed, archive the historical entry with surveyor notes.',
          'Quarterly Class Reconciliation: Run a delta check between onboard logs and the master IHM Part I register to verify document completeness.',
        ],
      },
      {
        heading: '3. Connecting Procurement to Onboard Hazmat Registers',
        content: `The most significant operational bottleneck technical managers experience is the disconnect between shore-based purchasing and vessel crew. Procurement teams order by part number, while superintendents need substance-level clarity (asbestos, ozone-depleting substances, PCBs, PFOS, or lead-containing alloys).

By utilizing digital IHM platforms like OceanLedger by MARICOMX, purchase order line items are automatically checked against suspected hazmat keyword engines. Suppliers submit declarations through account-free upload tokens, linking documents directly to the vessel's General Arrangement (GA) plan without administrative delays.`,
      },
    ],
    keyTakeaways: [
      'IHM Part I is a dynamic living document that must reflect ongoing repairs, spare parts, and refurbishments.',
      'Relying on annual surveyor walk-throughs creates substantial non-compliance risks under Hong Kong Convention requirements.',
      'Automated PO screening and digital MD/SDoC tracking eliminate up to 80% of administrative follow-up time.',
    ],
  },
  {
    id: 'material-declaration-vs-sdoc-guide',
    slug: 'material-declaration-vs-sdoc-guide',
    title: 'Material Declaration (MD) vs. SDoC: Understanding Maritime Supplier Documentation Without Friction',
    subtitle: 'Demystifying MEPC.269(68) documentation requirements, supplier pain points, and how to eliminate the endless email chase.',
    category: 'Supplier Workflows',
    categoryColor: 'badge-purple',
    readTime: '5 min read',
    date: 'October 2026',
    author: {
      name: 'R. K. Nair',
      role: 'Head of Marine Supply Chain Systems, MARICOMX',
    },
    status: 'Draft / Editorial Review',
    statusNote: 'Pre-Publication Preview · Staged for SEO launch',
    excerpt: 'Many suppliers still confuse MD and SDoC forms or fail to provide mandatory threshold details. Here is a clear guide on what each document requires and how to streamline submissions.',
    keywords: [
      'Material Declaration maritime',
      'Supplier Declaration of Conformity SDoC',
      'IMO MEPC.269(68)',
      'IHM supplier documentation',
      'IHM Part I hazardous materials',
    ],
    sections: [
      {
        heading: '1. What is the Difference Between MD and SDoC?',
        content: `Under IMO Resolution MEPC.269(68) (Guidelines for the Development of the Inventory of Hazardous Materials), suppliers delivering products to vessels must submit two distinct legal instruments:

1. **Material Declaration (MD):** A technical inventory that declares whether any listed hazardous substances (such as asbestos, ozone-depleting substances, cadmium, mercury, or radioactive substances) are present in the supplied item above defined regulatory threshold levels (e.g. 0.1% or 1,000 mg/kg for most substances).
2. **Supplier Declaration of Conformity (SDoC):** A formal warranty signed by an authorized company representative confirming that the product matches the accompanying MD, and identifying the manufacturer or distributor legally responsible.

One document is incomplete without the other. Classification societies will reject IHM updates if an MD lacks its accompanying signed SDoC.`,
      },
      {
        heading: '2. The Problem with the Email Chase',
        content: `Technical managers typically spend 15–25 hours per vessel per month emailing marine equipment vendors, chandlers, and sub-tier distributors asking for MDs and SDoCs. Suppliers frequently:
- Ignore email requests buried in accounting inboxes
- Provide outdated or generic certificates not tied to the specific Purchase Order
- State "product is non-hazardous" without filling the standardized IMO template

MARICOMX solves this by generating secure, one-click submission links sent directly to the supplier contact upon PO issuance. Suppliers do not need to register an account or install software; they simply drag-and-drop their documents, which are verified and filed against the vessel database automatically.`,
      },
      {
        heading: '3. Managing Threshold Limits and Exemptions',
        content: `Not every purchased item requires an MD/SDoC. Tools, consumables, and standard raw materials have differing thresholds under HKC and EU SRR. Maintaining a configurable suspected keyword library allows procurement departments to request declarations selectively—saving hundreds of wasted supplier interactions.`,
      },
    ],
    keyTakeaways: [
      'An MD details the substance composition, while an SDoC provides legal declaration of conformity.',
      'Class societies require both documents to approve IHM Part I changes.',
      'Account-free upload links drastically improve supplier compliance rates and reduce cycle times from weeks to minutes.',
    ],
  },
  {
    id: 'po-screening-keyword-logic-workflow',
    slug: 'po-screening-keyword-logic-workflow',
    title: 'Automating Maritime Purchase Order Screening: How Configurable Keyword Logic Catches Suspected Hazmat',
    subtitle: 'How modern fleet operators screen thousands of monthly PO lines to prevent unflagged hazardous materials from boarding vessels.',
    category: 'Technical Procurement',
    categoryColor: 'badge-orange',
    readTime: '6 min read',
    date: 'October 2026',
    author: {
      name: 'Software & Compliance Team',
      role: 'OceanLedger Engineering, MARICOMX',
    },
    status: 'Draft / Editorial Review',
    statusNote: 'Pre-Publication Preview · Staged for SEO launch',
    excerpt: 'Manual line-item PO reviews are prone to fatigue and human error. Learn how configurable maritime keyword engines flag potential hazardous items accurately before delivery.',
    keywords: [
      'maritime purchase order screening',
      'IHM PO audit',
      'suspected keyword hazmat engine',
      'ship procurement hazardous materials',
      'OceanLedger PO screening',
    ],
    sections: [
      {
        heading: '1. The Volume Challenge in Modern Fleet Procurement',
        content: `A medium-sized shipping company managing 25 vessels generates between 8,000 and 15,000 purchase order line items every month. Everything from main engine cylinder liners and generator bearings to cleaning solvents, valve seat packings, and fire-resistant paints passes through maritime ERPs.

Expecting technical superintendents to manually cross-reference thousands of line items against Annex I and Annex II hazardous material lists is impractical. Inevitably, gaskets containing chrysotile asbestos or insulation containing regulated fluorinated compounds slip through unnoticed.`,
      },
      {
        heading: '2. How Configurable Keyword Matching Operates',
        content: `The OceanLedger PO screening engine imports purchase order data via standard CSV or Excel files, or through direct API integration. Each line item description, part code, and supplier category is evaluated against a curated, customizable dictionary of maritime keywords:

- **Thermal Insulation:** rockwool, mineral wool, glass fiber, lagging, refractory cement.
- **Seals & Gaskets:** jointing sheet, spiral wound, gland packing, teflon, CAF.
- **Coatings & Resins:** anti-fouling, epoxy primer, polyurethane, zinc-rich, polyurethane foam.
- **Electrical & Electronics:** capacitor, battery, mercury switch, PCB, fluorescent tube.

When a suspected item is identified, the platform flags the line item with a risk rating, generates an immediate documentation request, and notifies the relevant fleet superintendent.`,
      },
      {
        heading: '3. Human-in-the-Loop Verification',
        content: `Rather than relying solely on black-box automation, MARICOMX emphasizes transparent human review. Technical superintendents can accept, override, or classify items with full audit notes, ensuring compliance records stand up to rigorous surveyor scrutiny.`,
      },
    ],
    keyTakeaways: [
      'Automated line-item screening prevents hazardous equipment from boarding without documentation.',
      'Configurable maritime dictionaries avoid false positives on benign items.',
      'Clear review trails provide classification societies with verifiable proof of compliance diligence.',
    ],
  },
  {
    id: 'hkc-vs-eu-srr-maritime-compliance',
    slug: 'hkc-vs-eu-srr-maritime-compliance',
    title: 'Hong Kong Convention vs. EU Ship Recycling Regulation: Key Differences for Fleet Operators',
    subtitle: 'A technical side-by-side comparison of regulatory applicability, substance thresholds, and dual-certification strategies.',
    category: 'Regulatory Analysis',
    categoryColor: 'badge-blue',
    readTime: '8 min read',
    date: 'October 2026',
    author: {
      name: 'Legal & Regulatory Advisory',
      role: 'Maritime Law & Environmental Policy Group',
    },
    status: 'Draft / Editorial Review',
    statusNote: 'Pre-Publication Preview · Staged for SEO launch',
    excerpt: 'With the Hong Kong Convention entering into force in June 2025, commercial fleets must navigate differences between IMO standards and strict EU SRR rules. Here is what every operator needs to know.',
    keywords: [
      'Hong Kong Convention IHM',
      'EU SRR vs HKC comparison',
      'MEPC.269(68) guidelines',
      'maritime hazardous material compliance',
      'ship recycling regulation fleet strategy',
    ],
    sections: [
      {
        heading: '1. Background and Entry-into-Force Timelines',
        content: `The global maritime regulatory framework governing hazardous materials onboard ships is anchored by two critical frameworks:

1. **IMO Hong Kong International Convention for the Safe and Environmentally Sound Recycling of Ships (HKC):** Adopted in 2009, HKC officially satisfied its entry-into-force conditions in June 2023 and applies globally to all commercial vessels above 500 GT from **26 June 2025**.
2. **EU Ship Recycling Regulation (Regulation (EU) No 1257/2013 - EU SRR):** In effect for EU-flagged vessels since 2018, and for non-EU flagged ships calling at EU/EEA ports since **31 December 2020**.

While both frameworks share common roots in IMO guidelines, EU SRR imposes stricter requirements that operators trading globally must address.`,
      },
      {
        heading: '2. Comparative Substance Coverage',
        content: `The most significant distinction between HKC and EU SRR lies in the specific hazardous substances required in Part I of the Inventory:

- **Common Annex I Substances:** Both frameworks prohibit or restrict Asbestos, Ozone-Depleting Substances (ODS), Polychlorinated Biphenyls (PCBs), and Anti-fouling compounds containing Organotin (TBT).
- **EU SRR Additional Prohibitions:** EU SRR explicitly includes **Perfluorooctane sulfonic acid (PFOS)** under Annex I prohibitions.
- **EU SRR Additional Inventories:** Under Annex II (items to be listed in IHM when present), EU SRR adds **Brominated Flame Retardants (HBCDD)**, which is not required under baseline HKC guidelines.`,
      },
      {
        heading: '3. Maintaining a Single Unified IHM Register',
        content: `Managing separate documents for HKC and EU SRR is error-prone. Forward-thinking ship managers configure their compliance software to track the more stringent EU SRR criteria by default.

When an IHM report is required for a survey in Singapore or China under HKC, or in Rotterdam or Antwerp under EU SRR, the platform generates the appropriate class-approved export format automatically.`,
      },
    ],
    keyTakeaways: [
      'HKC is in full effect globally as of June 2025; EU SRR continues to govern all vessels calling at European ports.',
      'EU SRR includes PFOS and HBCDD, which require diligent supplier screening beyond standard IMO guidelines.',
      'A unified digital IHM system prevents dual-documentation confusion and ensures instant audit readiness in any port.',
    ],
  },
]
