import { useInView } from '../hooks/useInView.js'

// Renders `as` (a div by default) that fades in when scrolled into view (.reveal → .reveal.visible).
// `variant` sets data-reveal="left | right | zoom | up-left | up-right" for the directional styles.
export default function Reveal({ as: Tag = 'div', className, variant, children, ...props }) {
  const [ref, inView] = useInView({ threshold: 0.05, rootMargin: '0px 0px 80px 0px' })
  const classes = [className, 'reveal', inView && 'visible'].filter(Boolean).join(' ')

  return (
    <Tag ref={ref} className={classes} data-reveal={variant} {...props}>
      {children}
    </Tag>
  )
}
