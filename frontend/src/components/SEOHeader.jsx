import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function SEOHeader({ title, description, image }) {
  const location = useLocation()

  useEffect(() => {
    // 1. Update Document Title
    if (title) {
      document.title = `${title} | MakaziPlus`
    }

    // 2. Update Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]')
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.content = description
    }

    // 3. Update Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    // Clean URL without query params for canonical
    const cleanUrl = `https://www.makazi-plus.com${location.pathname}`
    canonical.href = cleanUrl

    // 4. Update OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]')
    if (!ogUrl) {
      ogUrl = document.createElement('meta')
      ogUrl.setAttribute('property', 'og:url')
      document.head.appendChild(ogUrl)
    }
    ogUrl.content = cleanUrl

    // Cleanup function is not strictly needed for SPA unless unmounting removes it,
    // but typically we just overwrite the existing tags on each route change.
  }, [location.pathname, title, description, image])

  return null
}
