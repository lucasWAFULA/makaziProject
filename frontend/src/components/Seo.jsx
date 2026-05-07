import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://www.makazi-plus.com'
const SITE_NAME = 'MakaziPlus'
const DEFAULT_DESCRIPTION = 'Find verified stays, trusted agents, taxi transfers, and travel packages across Kenya and Tanzania with MakaziPlus.'
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`

const routeMeta = {
  '/': {
    title: 'MakaziPlus | Verified Stays, Taxi and Travel Packages',
    description: 'Book verified apartments, villas, BnBs, hotels, taxi transfers, and holiday packages across Kenya and Tanzania.',
  },
  '/stays': {
    title: 'Stays in Kenya and Tanzania | MakaziPlus',
    description: 'Search verified apartments, villas, BnBs, hotels, and coastal stays in Diani, Mombasa, Zanzibar, Dar es Salaam, and Watamu.',
  },
  '/agents': {
    title: 'Verified Property Agents | MakaziPlus',
    description: 'Connect with trusted local property agents for verified stays, apartments, BnBs, and coastal rentals.',
  },
  '/packages': {
    title: 'Holiday Packages and Trip Bundles | MakaziPlus',
    description: 'Plan beach holidays, airport pickup packages, family trips, honeymoon stays, and business travel bundles.',
  },
  '/taxi': {
    title: 'Taxi Transfers in Kenya and Tanzania | MakaziPlus',
    description: 'Book airport transfers, SGR taxis, private coastal transfers, and trusted local rides for your stay.',
  },
  '/login': {
    title: 'Log In | MakaziPlus',
    description: 'Log in to manage your MakaziPlus bookings, stays, and travel requests.',
    noindex: true,
  },
  '/register': {
    title: 'Register | MakaziPlus',
    description: 'Create a MakaziPlus account to book stays, list properties, or connect with travelers.',
  },
  '/bookings': {
    title: 'My Bookings | MakaziPlus',
    description: 'View and manage your MakaziPlus bookings.',
    noindex: true,
  },
  '/dashboard': {
    title: 'Host Dashboard | MakaziPlus',
    description: 'Manage your MakaziPlus property listings and bookings.',
    noindex: true,
  },
  '/property/new': {
    title: 'List Your Property | MakaziPlus',
    description: 'Add your apartment, BnB, hotel, villa, or house to MakaziPlus.',
    noindex: true,
  },
}

const destinationMeta = {
  zanzibar: {
    title: 'Zanzibar Stays and Holiday Packages | MakaziPlus',
    description: 'Find verified Zanzibar stays in Stone Town, Nungwi, Kendwa, Paje, Jambiani, and other island destinations.',
  },
  'dar-es-salaam': {
    title: 'Dar es Salaam Apartments and Stays | MakaziPlus',
    description: 'Book verified apartments and coastal city stays in Masaki, Oyster Bay, Msasani, Mikocheni, Kigamboni, and Dar es Salaam.',
  },
  diani: {
    title: 'Diani Beach Stays and Villas | MakaziPlus',
    description: 'Find Diani beach villas, BnBs, apartments, family stays, and taxi transfers on Kenya’s South Coast.',
  },
  mombasa: {
    title: 'Mombasa Stays, Agents and Taxi Transfers | MakaziPlus',
    description: 'Search verified stays in Nyali, Bamburi, Shanzu, Old Town, Mtwapa, and Mombasa coastal neighborhoods.',
  },
}

const taxonomyTitles = {
  stays: 'Stays',
  booking: 'Travel Packages',
  agents: 'Property Agents',
}

function toTitleCase(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}

function getMeta(pathname) {
  if (routeMeta[pathname]) return routeMeta[pathname]

  if (pathname.startsWith('/destinations/')) {
    const slug = pathname.split('/').pop()
    return destinationMeta[slug] || {
      title: `${toTitleCase(slug)} Stays and Travel Guide | MakaziPlus`,
      description: `Find verified stays, local support, and travel options for ${toTitleCase(slug)} with MakaziPlus.`,
    }
  }

  if (pathname.startsWith('/property/')) {
    return {
      title: 'Verified Stay Details | MakaziPlus',
      description: 'View photos, amenities, availability, reviews, and booking details for this verified MakaziPlus stay.',
    }
  }

  if (pathname.startsWith('/book/') || pathname.startsWith('/pay/') || pathname.includes('/edit')) {
    return {
      title: 'Booking | MakaziPlus',
      description: 'Complete or manage your MakaziPlus booking.',
      noindex: true,
    }
  }

  const [, type, slug] = pathname.split('/')
  if (type && slug) {
    const label = taxonomyTitles[type] || toTitleCase(type)
    const topic = toTitleCase(slug)
    return {
      title: `${topic} ${label} | MakaziPlus`,
      description: `Explore ${topic.toLowerCase()} ${label.toLowerCase()} across Kenya and Tanzania with MakaziPlus.`,
    }
  }

  return {
    title: `${SITE_NAME} | Nyumba. Safari. Mazingira Bora.`,
    description: DEFAULT_DESCRIPTION,
  }
}

function buildStructuredData(canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TravelAgency',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: DEFAULT_IMAGE,
        areaServed: ['Kenya', 'Tanzania'],
        knowsAbout: ['vacation rentals', 'apartments', 'hotels', 'taxi transfers', 'holiday packages'],
        sameAs: [
          'https://www.makazi-plus.com',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/stays?location={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: document.title,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
    ],
  }
}

export function Seo() {
  const location = useLocation()
  const pathname = location.pathname.replace(/\/$/, '') || '/'
  const meta = useMemo(() => getMeta(pathname), [pathname])

  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${pathname}`
    const robots = meta.noindex ? 'noindex,nofollow' : 'index,follow'

    document.title = meta.title
    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl })

    let script = document.getElementById('makaziplus-schema')
    if (!script) {
      script = document.createElement('script')
      script.id = 'makaziplus-schema'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(buildStructuredData(canonicalUrl))
  }, [meta, pathname])

  return null
}
