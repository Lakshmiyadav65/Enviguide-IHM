import { useEffect, useState } from 'react'

// Turns true after the first paint, so CSS transitions from the initial hidden state
// (e.g. .hero-animate, .demo-animate) actually play on load.
export function useEntranceTrigger() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let inner
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [])

  return ready
}
