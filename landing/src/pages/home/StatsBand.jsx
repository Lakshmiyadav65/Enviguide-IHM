import { useCountUp } from '../../hooks/useCountUp.js'
import { useInView } from '../../hooks/useInView.js'

const STATS = [
  { target: 500, suffix: '+', label: 'Vessels Managed' },
  { target: 25, suffix: '+', label: 'Countries' },
  { target: 1, suffix: 'M+', label: 'Line Items Screened' },
  { target: 60, suffix: '%', label: 'Avg. Time Saved on IHM Maintenance' },
]

export default function StatsBand() {
  return (
    <section className="stats-band" id="stats">
      <div className="container">
        <div className="stats-grid">
          {STATS.map((stat) => <Stat key={stat.label} {...stat} />)}
        </div>
      </div>
    </section>
  )
}

function Stat({ target, suffix, label }) {
  const [ref, inView] = useInView({ threshold: 0.5 })
  const value = useCountUp(target, inView)

  return (
    <div className="stat">
      <div className="stat-num" ref={ref}>{value}</div>
      <div className="stat-suffix">{suffix}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}
