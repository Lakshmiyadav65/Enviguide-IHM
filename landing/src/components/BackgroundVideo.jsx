import { useEffect, useRef } from 'react'

const GESTURES = ['touchstart', 'touchend', 'scroll', 'click']

// Muted, looping background video. Some mobile browsers refuse autoplay until the first
// touch/scroll/click, so playback is retried then. With `pauseOffscreen` it also pauses
// while scrolled out of view and resumes when the tab becomes visible again.
export default function BackgroundVideo({ sources, className, id, pauseOffscreen = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const video = ref.current
    video.muted = true
    video.defaultMuted = true
    const tryPlay = () => {
      video.play()?.catch(() => {})
    }

    tryPlay()
    video.addEventListener('loadedmetadata', tryPlay, { once: true })
    video.addEventListener('canplay', tryPlay, { once: true })

    const onFirstGesture = () => {
      tryPlay()
      GESTURES.forEach((type) => window.removeEventListener(type, onFirstGesture))
    }
    GESTURES.forEach((type) => window.addEventListener(type, onFirstGesture, { passive: true }))

    let observer
    let onVisibilityChange
    if (pauseOffscreen) {
      let onScreen = true
      observer = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting
        if (onScreen) tryPlay()
        else video.pause()
      }, { threshold: 0.05 })
      observer.observe(video)

      onVisibilityChange = () => {
        if (!document.hidden && onScreen) tryPlay()
      }
      document.addEventListener('visibilitychange', onVisibilityChange)
    }

    return () => {
      video.removeEventListener('loadedmetadata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
      GESTURES.forEach((type) => window.removeEventListener(type, onFirstGesture))
      observer?.disconnect()
      if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [pauseOffscreen])

  return (
    <video
      ref={ref}
      id={id}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      webkit-playsinline=""
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
    >
      {sources.map(({ src, type }) => (
        <source key={src} src={src} type={type} />
      ))}
    </video>
  )
}
