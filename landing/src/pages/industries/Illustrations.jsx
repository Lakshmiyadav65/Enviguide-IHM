// Animated vessel diagrams for the Industries page (animations live in styles/industries.css).

const HULL = 'M30,150 L30,118 Q30,110 40,110 L420,110 Q432,110 434,120 L430,152 Q426,168 405,170 L55,170 Q34,168 30,150 Z'

function Waves() {
  return (
    <>
      <path className="wave wave-a" d="M0,190 q15,-8 30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0" />
      <path className="wave wave-b" d="M0,202 q15,-6 30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0" />
    </>
  )
}

export function BulkCarrierIllustration() {
  return (
    <svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">
      <path className="hull" d={HULL} />
      <line className="deck-line" x1="30" y1="110" x2="434" y2="110" />
      <g>
        <rect className="bc-hatch" x="70" y="86" width="80" height="24" rx="2" fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5" />
        <rect className="bc-hatch bc-hatch2" x="190" y="86" width="80" height="24" rx="2" fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5" />
        <rect className="bc-hatch" x="310" y="86" width="80" height="24" rx="2" fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5" />
      </g>
      <rect className="bc-material" x="222" y="62" width="16" height="16" rx="2" fill="var(--ink-soft)" />
      <rect x="392" y="82" width="30" height="28" fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <Waves />
      <text x="230" y="35" textAnchor="middle" className="fig-label">Cargo Hold Hazmat Mapping</text>
    </svg>
  )
}

export function TankerIllustration() {
  return (
    <svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">
      <path className="hull" d={HULL} />
      <line className="deck-line" x1="30" y1="110" x2="434" y2="110" />
      <g fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5">
        <path d="M85,100 a25,20 0 0 1 50,0 z" />
        <path d="M195,100 a25,20 0 0 1 50,0 z" />
        <path d="M305,100 a25,20 0 0 1 50,0 z" />
      </g>
      <circle className="tk-pump" cx="150" cy="103" r="3.5" fill="var(--ink-soft)" />
      <circle className="tk-pump" cx="220" cy="103" r="3.5" fill="var(--ink-soft)" style={{ animationDelay: '.4s' }} />
      <circle className="tk-pump" cx="290" cy="103" r="3.5" fill="var(--ink-soft)" style={{ animationDelay: '.8s' }} />
      <rect x="392" y="62" width="18" height="48" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
      <rect className="tk-gauge" x="393.5" y="63.5" width="15" height="45" fill="var(--ink-soft)" opacity=".55" />
      <Waves />
      <text x="230" y="35" textAnchor="middle" className="fig-label">Cargo Tank Level Monitoring</text>
    </svg>
  )
}

export function ContainerShipIllustration() {
  return (
    <svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">
      <path className="hull" d={HULL} />
      <line className="deck-line" x1="30" y1="110" x2="434" y2="110" />
      <g stroke="var(--line-strong)" strokeWidth="1.2">
        <rect x="150" y="86" width="34" height="24" fill="var(--box)" />
        <rect x="186" y="86" width="34" height="24" fill="var(--box2)" />
        <rect x="222" y="86" width="34" height="24" fill="var(--box)" />
        <rect x="150" y="62" width="34" height="24" fill="var(--box2)" />
        <rect x="186" y="62" width="34" height="24" fill="var(--box)" />
        <rect x="260" y="86" width="34" height="24" fill="var(--box)" />
        <rect x="296" y="86" width="34" height="24" fill="var(--box2)" />
        <rect x="260" y="62" width="34" height="24" fill="var(--box)" />
      </g>
      <path d="M60,40 L60,110 M40,42 L100,42 M95,42 L95,58" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
      <line className="cs-hook" x1="95" y1="58" x2="95" y2="72" stroke="var(--line-strong)" strokeWidth="1.5" />
      <rect className="cs-box" x="78" y="72" width="34" height="24" fill="var(--ink-soft)" opacity=".85" />
      <Waves />
      <text x="230" y="35" textAnchor="middle" className="fig-label">Container Load-out Tracking</text>
    </svg>
  )
}

export function OffshoreIllustration() {
  return (
    <svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg">
      <path className="hull" d="M30,150 L30,120 Q30,112 42,111 L420,108 Q432,108 434,120 L430,152 Q426,168 405,170 L55,170 Q34,168 30,150 Z" />
      <line className="deck-line" x1="30" y1="112" x2="434" y2="110" />
      <rect x="70" y="90" width="120" height="20" fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <rect x="200" y="94" width="60" height="16" fill="var(--box2)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <path d="M110,90 L130,58 L150,90" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
      <circle cx="230" cy="62" r="24" fill="none" stroke="var(--line-strong)" strokeWidth="1.5" />
      <circle cx="230" cy="62" r="14" fill="none" stroke="var(--line)" strokeWidth="1" />
      <line className="ov-sweep" x1="230" y1="62" x2="230" y2="40" stroke="var(--ink-soft)" strokeWidth="2" />
      <circle className="ov-ping" cx="230" cy="62" r="3" fill="var(--ink-soft)" />
      <rect x="392" y="80" width="30" height="30" fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <Waves />
      <text x="230" y="35" textAnchor="middle" className="fig-label">Dynamic Positioning Monitoring</text>
    </svg>
  )
}

// Two rows of cabin windows that light up in sequence (the lower row has a gap at x=224).
const UPPER_WINDOWS = Array.from({ length: 11 }, (_, i) => ({ x: 104 + i * 20, delay: i * 0.2 }))
const LOWER_WINDOWS = [104, 124, 144, 164, 184, 204, 244, 264, 284, 304].map((x, i) => ({ x, delay: 0.3 + i * 0.2 }))

export function PassengerShipIllustration() {
  return (
    <svg viewBox="0 0 460 235" xmlns="http://www.w3.org/2000/svg">
      <path className="hull" d={HULL} />
      <line className="deck-line" x1="30" y1="110" x2="434" y2="110" />
      <rect x="90" y="52" width="260" height="58" fill="var(--box)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <g fill="var(--ink-soft)">
        {UPPER_WINDOWS.map(({ x, delay }) => (
          <rect key={`u${x}`} className="ps-window" x={x} y="62" width="12" height="10" style={{ animationDelay: `${delay.toFixed(1)}s` }} />
        ))}
        {LOWER_WINDOWS.map(({ x, delay }) => (
          <rect key={`l${x}`} className="ps-window" x={x} y="86" width="12" height="10" style={{ animationDelay: `${delay.toFixed(1)}s` }} />
        ))}
      </g>
      <rect x="360" y="34" width="14" height="24" fill="var(--box2)" stroke="var(--line-strong)" strokeWidth="1.5" />
      {[0, 1.2, 2.4].map((delay) => (
        <circle key={delay} className="ps-smoke" cx="367" cy="30" r="4" fill="var(--line)" style={{ animationDelay: `${delay}s` }} />
      ))}
      <Waves />
      <text x="230" y="228" textAnchor="middle" className="fig-label">Interior Finish &amp; Occupancy Zones</text>
    </svg>
  )
}
