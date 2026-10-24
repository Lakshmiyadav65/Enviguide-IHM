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

import SocialBanner from '../../components/SocialBanner.jsx'

export default function HomePage() {
  usePage({
    title: 'IHM Management Software for Ships & Fleets | MARICOMX',
    description:
      'Simplify IHM Part I maintenance, purchase order screening, supplier MD/SDoC collection and fleet compliance reporting with MARICOMX. Book a demo.',
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
        <SocialBanner />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
