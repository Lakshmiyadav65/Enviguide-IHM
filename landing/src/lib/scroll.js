// Scrolls so the element sits just below the sticky nav.
export function scrollToId(id, behavior = 'smooth') {
  const target = document.getElementById(id)
  if (!target) return false
  const nav = document.getElementById('main-nav')
  const offset = nav ? nav.offsetHeight + 16 : 80
  const top = target.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior })
  return true
}
