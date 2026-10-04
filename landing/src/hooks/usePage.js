import { useEffect, useLayoutEffect } from 'react'

// Sets the tab title + meta description, and optionally a class on <html> so
// page-specific CSS (e.g. html.page-book-demo) only applies while the page is mounted.
export function usePage({ title, description, htmlClass }) {
  useEffect(() => {
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])

  useLayoutEffect(() => {
    if (!htmlClass) return
    const root = document.documentElement
    root.classList.add(htmlClass)
    return () => root.classList.remove(htmlClass)
  }, [htmlClass])
}
