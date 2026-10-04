import { useEffect, useState } from 'react'
import { usePage } from '../hooks/usePage.js'
import '../styles/login.css'

const PLATFORM_URL = 'https://ihm-enviguide.vercel.app/'
// The EnviGuide platform's own Vite dev server (Enviguide-IHM/frontend), used when running locally.
const LOCAL_PLATFORM_URL = 'http://localhost:5173/'
const LOADER_TIMEOUT = 2500 // hide the spinner even if the frame never reports "load"

const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

// Stop iOS from zooming into the embedded login form's inputs; restored on leaving the page.
function useNoZoomViewport() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]')
    if (!meta) return
    const original = meta.getAttribute('content')
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    return () => meta.setAttribute('content', original)
  }, [])
}

export default function LoginPage() {
  usePage({
    title: 'OceanLedger IHMM — Login Portal',
    description: 'OceanLedger IHMM compliance platform and audit portal.',
    htmlClass: 'page-login',
  })
  useNoZoomViewport()

  const [src, setSrc] = useState(isLocalHost ? LOCAL_PLATFORM_URL : PLATFORM_URL)
  const [loaded, setLoaded] = useState(false)

  // Locally, fall back to the deployed platform when its dev server isn't running.
  useEffect(() => {
    if (!isLocalHost) return
    let cancelled = false
    fetch(LOCAL_PLATFORM_URL, { mode: 'no-cors' }).catch(() => {
      if (!cancelled) setSrc(PLATFORM_URL)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), LOADER_TIMEOUT)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="frame-container">
      <div className={`loading-overlay${loaded ? ' is-hidden' : ''}`}>
        <div className="spinner"></div>
        <div className="brand-title">EnviGuide IHM Platform</div>
      </div>
      <iframe
        id="ihm-frame"
        title="EnviGuide IHM Platform"
        src={src}
        allow="clipboard-write; camera; microphone"
        onLoad={() => setLoaded(true)}
      ></iframe>
    </div>
  )
}
