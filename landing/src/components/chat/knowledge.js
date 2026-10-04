// Static IHM knowledge base for the chat assistant. A reply is picked from the first entry
// whose keywords appear in the user's message; replies rotate so repeats don't read the same.
// Replies are markdown: **bold**, *italic*, `code`, "\n• " bullets and [label](url) action pills.

export const STARTER_PROMPTS = [
  { icon: '🚢', title: 'What is IHM Part I?', query: 'What is IHM Part I and why is it mandatory?' },
  { icon: '⚡', title: 'Automate MD/SDoC', query: 'How does OceanLedger IHMM automate supplier MD and SDoC collection?' },
  { icon: '📋', title: 'IHM Compliance', query: 'What is IHM Part I compliance under EU SRR and HKC?' },
  { icon: '💰', title: 'Pricing & Plans', query: 'What is the pricing model for OceanLedger IHMM?' },
  { icon: '🚢', title: 'Book a Live Demo', query: 'Can I see a demo of OceanLedger IHMM for my fleet?' },
]

const IHM_KNOWLEDGE = [
  {
    keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'who are you', 'help'],
    chips: ['What is IHM Part I?', 'Automate MD/SDoC', 'Pricing & Plans', 'Book a Demo'],
    replies: [
      "Hello! 👋 I am the **OceanLedger IHMM AI Assistant**.\n\nI can help you with:\n• **IHM Part I compliance** under EU SRR & IMO HKC\n• **Automating supplier MD & SDoC collection**\n• **Class approval reports** (DNV, LR, ABS, BV, ClassNK)\n• **Fleet pricing & live product demos**\n\nHow can I assist your fleet today?",
      'Hi there! Welcome to **OceanLedger IHMM**. 🚢\n\nWe provide end-to-end digital compliance for the Inventory of Hazardous Materials. Ask me any question or pick a topic below to get started!',
      'Hello! Glad to connect. How can I help you with your vessel IHM compliance, supplier chasing, or demo booking today?',
    ],
  },
  {
    keywords: ['how does ihm work', 'what is ihm', 'explain ihm', 'part 1', 'part i', 'inventory of hazardous', 'overview', 'about ihm', 'what is ihmm'],
    chips: ['Automated MD/SDoC', 'EU SRR Deadlines', 'View Pricing', 'Book Demo'],
    replies: [
      '**IHM Part I (Inventory of Hazardous Materials)** is a statutory document required on all operational ships ≥ 500 GT identifying the location and quantity of hazardous materials on board.\n\n**How OceanLedger IHMM simplifies this:**\n• Automatically identifies HazMat in ship equipment & spare parts\n• Reaches out to suppliers to collect Material Declarations (MD) and SDoCs\n• Maintains a live, digital inventory with automated Class-compliant reporting (DNV, LR, ABS, BV).\n\n[Book a Demo](/book-demo)',
      'An active **IHM Part I** tracks hazardous substances (like Asbestos, PCBs, Ozone Depleting Substances, and Heavy Metals) installed during operations and maintenance.\n\nOur platform connects directly with your procurement records, requests declarations from suppliers automatically, and keeps your vessel 100% inspection-ready for Port State Control (PSC).\n\n[Chat on WhatsApp](https://wa.me/919867941103)',
    ],
  },
  {
    keywords: ['pricing', 'price', 'cost', 'plans', 'rate', 'quote', 'subscription', 'per ship', 'fleet discount', 'tier'],
    chips: ['Book a 20-min demo', 'Talk on WhatsApp', 'What is IHM?'],
    replies: [
      'Our pricing is transparent and scaled to your fleet size:\n\n• **Single Vessel / Starter**: Flat annual subscription per vessel with full MD/SDoC tracking\n• **Fleet Plan (5+ vessels)**: Volume discounts, centralized fleet dashboard, and dedicated compliance onboarding\n• **Enterprise**: Custom ERP/Procurement API integration (Amos, ShipNet, Sertica, etc.) & 24/7 priority SLA.\n\n[Schedule a Demo](/book-demo) · [WhatsApp Quote](https://wa.me/919867941103)',
      'OceanLedger IHMM pricing is tailored based on the number of active vessels in your fleet. We offer flexible annual subscriptions with zero setup fees for fleets of 5+ ships.\n\nYou can [Book a Demo](/book-demo) or reach out via WhatsApp at **+91 9867941103** for custom fleet pricing.',
    ],
  },
  {
    keywords: ['demo', 'book', 'schedule', 'trial', 'meeting', 'presentation', 'call', 'walkthrough'],
    chips: ['Book Demo Online', 'Talk on WhatsApp', 'Fleet Pricing', 'MD/SDoC automation'],
    replies: [
      "We'd love to show you OceanLedger IHMM in action! 🚢\n\nDuring a 20-minute live demo, we will walk you through:\n1. Live fleet compliance scoring & HazMat heatmaps\n2. 1-click automated supplier MD/SDoC collection\n3. Exporting Class-approved IHM audit reports.\n\n👉 [Click here to book your demo slot](/book-demo) or message on WhatsApp!",
      'You can easily schedule a personalized walkthrough with our maritime compliance specialists. [Book Demo Online](/book-demo), or message us on WhatsApp at **+91 9867941103** for immediate assistance.',
    ],
  },
  {
    keywords: ['eu srr', 'regulation', 'hong kong', 'hkc', 'imo', 'marpol', 'compliance', 'law', 'mandatory', 'psc', 'port state', 'detention'],
    chips: ['Class approval reports', 'Automate MD/SDoC', 'Book a Demo'],
    replies: [
      'Both **EU SRR (Regulation (EU) No 1257/2013)** and the **IMO Hong Kong Convention (HKC)** mandate an active IHM Part I for ships calling at international ports.\n\n• **Non-compliance risk**: Detentions, fines by Port State Control, and Class certificate suspensions\n• **OceanLedger IHMM Solution**: Automated maintenance of IHM throughout operational lifetime with verified MD/SDoC audit trails.\n\n[Book a Demo](/book-demo)',
      'Under the EU Ship Recycling Regulation and IMO HKC, shipowners are legally required to maintain an up-to-date IHM Part I. OceanLedger IHMM guarantees 100% audit readiness with automated hazard threshold cross-referencing and one-click surveyor reports.',
    ],
  },
  {
    keywords: ['md', 'sdoc', 'supplier', 'material declaration', 'declaration of conformity', 'asbestos', 'hazmat', 'threshold', 'chasing'],
    chips: ['How IHM works', 'Class Society PDF', 'Schedule Demo'],
    replies: [
      '**Material Declarations (MD)** and **Supplier Declarations of Conformity (SDoC)** are required from maritime equipment vendors for any installed materials.\n\nOceanLedger IHMM automates this entire process: we send automated email requests to your suppliers, use AI to validate threshold compliance for Table A & B substances (e.g. Asbestos, PCBs, PFOS, Lead), and automatically log verified items into your ship\'s IHM.\n\n[See Live Demo](/book-demo)',
      'Collecting MDs and SDoCs manually takes hours of back-and-forth emails. With OceanLedger IHMM, suppliers upload documents via a zero-login portal, where our engine verifies compliance against IMO MEPC.379(80) standards automatically.',
    ],
  },
  {
    keywords: ['asbestos', 'pcb', 'hazmat', 'table a', 'table b', 'pfos', 'lead', 'mercury', 'cadmium', 'hazardous material', 'substances'],
    chips: ['Automated MD/SDoC', 'Class approvals', 'Book Demo'],
    replies: [
      'OceanLedger IHMM tracks all hazardous substances listed in **IMO HKC** and **EU SRR**:\n\n• **Table A (Prohibited)**: Asbestos, PCBs, Ozone Depleting Substances (ODS), Anti-fouling organotin compounds.\n• **Table B (Regulated / Thresholds)**: Cadmium, Hexavalent Chromium, Lead, Mercury, PBDEs, PFOS, Radioactivity.\n\nOur system automatically checks supplier declarations against statutory threshold limits and flags any anomalies.\n\n[Book a Demo](/book-demo)',
    ],
  },
  {
    keywords: ['class', 'dnv', 'lloyd', 'lr', 'abs', 'bureau veritas', 'bv', 'classnk', 'nk', 'rina', 'surveyor', 'audit', 'society', 'iacs'],
    chips: ['Automated MD/SDoC', 'Book Demo', 'WhatsApp Support'],
    replies: [
      "OceanLedger IHMM generates audit-ready reports pre-formatted according to guidelines from all major IACS Classification Societies, including **DNV, Lloyd's Register (LR), ABS, Bureau Veritas (BV), and ClassNK**.\n\nYou can export certified IHM Part I PDFs and grant secure read-only access to class surveyors during annual or renewal surveys.\n\n[Book a Demo](/book-demo)",
    ],
  },
  {
    keywords: ['erp', 'integration', 'amos', 'shipnet', 'sertica', 'bassnet', 'veson', 'danaos', 'procurement', 'api', 'software'],
    chips: ['Schedule Demo', 'Fleet Pricing', 'Talk on WhatsApp'],
    replies: [
      'OceanLedger IHMM seamlessly integrates with leading maritime ERP and procurement systems (e.g., **AMOS, ShipNet, Sertica, BASSnet, Veson IMOS, and Danaos**).\n\nWhenever purchase orders or spares are created in your ERP, OceanLedger IHMM automatically triggers supplier MD/SDoC collection workflows.\n\n[Book a Technical Demo](/book-demo)',
    ],
  },
  {
    keywords: ['contact', 'whatsapp', 'phone', 'human', 'expert', 'support', 'email', 'reach', 'help desk', 'call'],
    chips: ['Chat on WhatsApp', 'Schedule Demo', 'Pricing Info'],
    replies: [
      'You can connect directly with our maritime compliance specialists anytime:\n\n📱 **WhatsApp**: [+91 9867941103](https://wa.me/919867941103)\n📅 **Schedule Demo**: [Book a live walkthrough](/book-demo)\n✉️ **Email**: info@ihmm.com\n\nOur team typically responds within minutes during maritime business hours!',
    ],
  },
]

const FALLBACK_CHIPS = ['What is IHM Part I?', 'Automate MD/SDoC', 'Pricing & Plans', 'Book a Demo']

let replyIndex = 0

export function getStaticAiReply(userText) {
  const lower = userText.toLowerCase()

  for (const item of IHM_KNOWLEDGE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      const reply = item.replies[replyIndex++ % item.replies.length]
      return { reply, chips: item.chips || [] }
    }
  }

  const generalReplies = [
    `Regarding "${userText.slice(0, 45)}", **OceanLedger IHMM** provides automated IHM Part I maintenance, supplier MD/SDoC tracking, and Class approval reporting.\n\nFeel free to [schedule a demo](/book-demo) or chat directly with our specialists on [WhatsApp](https://wa.me/919867941103).`,
    `That's a key requirement for vessel compliance. With OceanLedger IHMM, managing hazardous materials across your fleet is 100% automated and audit-ready for Port State Control.\n\n[Book a Demo](/book-demo) · [Chat on WhatsApp](https://wa.me/919867941103)`,
    `Our maritime compliance engine ensures your vessels remain fully compliant with EU SRR (1257/2013) and IMO HKC with zero manual paperwork.\n\n[Book a Demo](/book-demo) · [Chat on WhatsApp](https://wa.me/919867941103)`,
  ]

  return {
    reply: generalReplies[replyIndex++ % generalReplies.length],
    chips: FALLBACK_CHIPS,
  }
}
