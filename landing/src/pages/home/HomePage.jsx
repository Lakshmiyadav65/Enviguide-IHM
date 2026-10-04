import Nav from '../../components/Nav.jsx'
import Footer from '../../components/Footer.jsx'
import ChatWidget from '../../components/chat/ChatWidget.jsx'
import { usePage } from '../../hooks/usePage.js'
import Hero from './Hero.jsx'
import FeatureTabs from './FeatureTabs.jsx'
import FeatureRows from './FeatureRows.jsx'
import FeatureGrid from './FeatureGrid.jsx'
import StatsBand from './StatsBand.jsx'
import HowItWorks from './HowItWorks.jsx'
import Testimonials from './Testimonials.jsx'
import Faq from './Faq.jsx'
import CtaBand from './CtaBand.jsx'

export default function HomePage() {
  usePage({
    title: 'OceanLedger IHMM: Keep Your Fleet Audit-Ready',
    description:
      'Digitize IHM Part I maintenance across your whole fleet. Auto-screen purchase orders for hazardous materials, collect MD/SDoC from suppliers, and generate class-ready compliance reports in minutes.',
  })

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <FeatureTabs />
        <FeatureRows />
        <FeatureGrid />
        <StatsBand />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
