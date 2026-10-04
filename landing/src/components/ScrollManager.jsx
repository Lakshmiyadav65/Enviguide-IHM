import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToId } from '../lib/scroll.js'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'mousedown']
const HOLD_LIMIT = 10000 // ms

// After landing on a new page at #section, images above the section are often still loading
// and push it down. Keep re-aligning until the layout settles or the user takes over.
function holdScrollTarget(id) {
  const observer = new ResizeObserver(() => scrollToId(id, 'instant'))
  const stop = () => {
    observer.disconnect()
    clearTimeout(timer)
    USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stop))
  }
  const timer = setTimeout(stop, HOLD_LIMIT)
  observer.observe(document.body)
  USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }))
  return stop
}

// Every navigation starts at the top of the page, or at the #section in the URL.
export default function ScrollManager() {
  const { pathname, search, hash, key } = useLocation()
  const last = useRef({ key: null, pathname: null, prevPathname: null })

  useEffect(() => {
    // StrictMode re-runs this effect for the same navigation (same key); compare with the one before it.
    const prevPathname = last.current.key === key ? last.current.prevPathname : last.current.pathname
    last.current = { key, pathname, prevPathname }
    const samePage = prevPathname === pathname

    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      if (samePage) {
        scrollToId(id, 'smooth')
      } else {
        scrollToId(id, 'instant')
        return holdScrollTarget(id)
      }
    } else if (!samePage) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else if (!search) {
      // Re-clicking a link to the current page (e.g. the logo) goes back to the top.
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // Same page with a query string (e.g. /industries?type=tankers): the page scrolls itself.
  }, [pathname, search, hash, key])

  return null
}
