import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getProperties } from '../api/properties'
import { getFeaturedDestinations, getDestinations } from '../api/destinations'
import { getPackages } from '../api/packages'
import { getAgents } from '../api/agents'
import { sendAiChat } from '../api/ai'

function TrustBadgeIcon({ type }) {
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2 4 5v6c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5zm-1.2 14.4-3.6-3.6 1.4-1.4 2.2 2.2 4.6-4.6 1.4 1.4z" />
      </svg>
    )
  }
  if (type === 'credit') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5zM5 9h14V6.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5zm0 3v5.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5V12z" />
      </svg>
    )
  }
  if (type === 'chat') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M4 4.75C4 3.78 4.78 3 5.75 3h12.5C19.22 3 20 3.78 20 4.75v8.5c0 .97-.78 1.75-1.75 1.75h-6.1a.75.75 0 0 0-.5.19l-2.9 2.58c-.95.84-2.45.17-2.45-1.1v-.92c0-.41-.34-.75-.75-.75h-.8C4.78 15 4 14.22 4 13.25z" />
      </svg>
    )
  }
  if (type === 'globe') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m7.9 9h-3.02a16 16 0 0 0-1.3-5A8.03 8.03 0 0 1 19.9 11M12 4.05c.95 1.2 1.8 3.2 2.18 5.95H9.82C10.2 7.25 11.05 5.25 12 4.05M8.42 6a16 16 0 0 0-1.3 5H4.1A8.03 8.03 0 0 1 8.42 6M4.1 13h3.02a16 16 0 0 0 1.3 5A8.03 8.03 0 0 1 4.1 13M12 19.95c-.95-1.2-1.8-3.2-2.18-5.95h4.36c-.38 2.75-1.23 4.75-2.18 5.95M15.58 18a16 16 0 0 0 1.3-5h3.02A8.03 8.03 0 0 1 15.58 18" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m4.3 8.7-4.9 4.9a1 1 0 0 1-1.4 0l-2.3-2.3 1.4-1.4 1.6 1.6 4.2-4.2z" />
    </svg>
  )
}

function AgentAvatarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 12m0 1.8c-3.54 0-6.8 1.82-6.8 4.05A1.15 1.15 0 0 0 6.35 19h11.3a1.15 1.15 0 0 0 1.15-1.15c0-2.23-3.26-4.05-6.8-4.05" />
    </svg>
  )
}

function clampRating(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric) || !Number.isFinite(numeric)) return 4
  return Math.max(1, Math.min(5, numeric))
}

function PackageMetaIcon({ type }) {
  const paths = {
    location: 'M12 2a9.5 9.5 0 0 0-9.5 9.5c0 5.8 7.1 10.5 8.1 11.1a2.8 2.8 0 0 0 2.8 0c1-.6 8.1-5.3 8.1-11.1A9.5 9.5 0 0 0 12 2m0 12.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4',
    accommodation: 'M3 10.5h18V19h-2v-2H5v2H3zm1-5h16a2 2 0 0 1 2 2v1H2v-1a2 2 0 0 1 2-2m2 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3',
    transfer: 'M4 6h11a2 2 0 0 1 2 2v5h-2a2.5 2.5 0 0 0-5 0H8a2.5 2.5 0 0 0-5 0H2V8a2 2 0 0 1 2-2m1.5 9a1 1 0 1 0-1-1 1 1 0 0 0 1 1m7 0a1 1 0 1 0-1-1 1 1 0 0 0 1 1',
    meals: 'M6 3h2v7h2V3h2v7a2 2 0 0 1-2 2v9H8v-9a2 2 0 0 1-2-2zm9 0a4 4 0 0 1 4 4v14h-2v-6h-2V3z',
    wifi: 'M12 18.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m0-4.2a5.7 5.7 0 0 1 4 1.7l1.5-1.5a7.9 7.9 0 0 0-11 0L8 16a5.7 5.7 0 0 1 4-1.7m0-4.6a10.3 10.3 0 0 1 7.3 3L20.8 11a12.5 12.5 0 0 0-17.6 0l1.5 1.7a10.3 10.3 0 0 1 7.3-3',
    workspace: 'M3 5h18v12H3zm2 2v8h14V7zm2 12h10v2H7z',
    secure: 'M12 2 4 5v6c0 5.2 3.4 9.9 8 11 4.6-1.1 8-5.8 8-11V5zm-1.2 14.4-3.6-3.6 1.4-1.4 2.2 2.2 4.6-4.6 1.4 1.4z',
    support: 'M12 2a9 9 0 0 0-9 9v2a3 3 0 0 0 3 3h1v-6H6a6 6 0 0 1 12 0h-1v6h1a3 3 0 0 0 3-3v-2a9 9 0 0 0-9-9',
    verified: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m4.3 8.7-4.9 4.9a1 1 0 0 1-1.4 0l-2.3-2.3 1.4-1.4 1.6 1.6 4.2-4.2z',
    price: 'M12 3 3 8v8l9 5 9-5V8zm-1 4h2v2h2v2h-2v2h-2v-2H9V9h2z',
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d={paths[type] || paths.location} />
    </svg>
  )
}

export function Home() {
  const { t } = useTranslation()
  const [draftFilters, setDraftFilters] = useState({
    country: '',
    region: '',
    destinationName: '',
    listingType: '',
    location: '',
    priceMin: '',
    priceMax: '',
  })
  const [searchFilters, setSearchFilters] = useState({
    country: '',
    region: '',
    destinationName: '',
    listingType: '',
    location: '',
    priceMin: '',
    priceMax: '',
  })
  const [activeTab, setActiveTab] = useState('rent')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiHint, setAiHint] = useState('')
  const [isAiApplying, setIsAiApplying] = useState(false)
  const [packageWindowStart, setPackageWindowStart] = useState(0)
  const [packageImageTick, setPackageImageTick] = useState(0)
  const [isPackageImagePaused, setIsPackageImagePaused] = useState(false)
  const [agentSearch, setAgentSearch] = useState('')
  const [agentFilter, setAgentFilter] = useState('all')
  const [aiClientId] = useState(() => {
    const existing = localStorage.getItem('ai_client_id')
    if (existing) return existing
    const generated = `search-ai-${Math.random().toString(36).slice(2)}-${Date.now()}`
    localStorage.setItem('ai_client_id', generated)
    return generated
  })
  const pageRef = useRef(null)

  const { data: destinations = [], isLoading: isDestinationsLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => getDestinations(),
  })
  const { data: featuredDestinations = [], isLoading: isFeaturedDestinationsLoading } = useQuery({
    queryKey: ['destinations-featured'],
    queryFn: () => getFeaturedDestinations(),
  })
  const { data: packageList = [], isLoading: isPackagesLoading } = useQuery({
    queryKey: ['packages-home'],
    queryFn: () => getPackages(),
  })
  const { data: agentList = [] } = useQuery({
    queryKey: ['agents-home'],
    queryFn: () => getAgents({ verified: '1' }),
  })
  const { data: allListings = [] } = useQuery({
    queryKey: ['properties-home-stats'],
    queryFn: () => getProperties(),
  })

  const { data: list = [], isLoading } = useQuery({
    queryKey: [
      'properties',
      searchFilters.location,
      searchFilters.priceMin,
      searchFilters.priceMax,
      searchFilters.country,
      searchFilters.region,
      searchFilters.destinationName,
      searchFilters.listingType,
    ],
    queryFn: () => getProperties({
      location: searchFilters.location || undefined,
      price_min: searchFilters.priceMin || undefined,
      price_max: searchFilters.priceMax || undefined,
      country: searchFilters.country || undefined,
      region: searchFilters.region || undefined,
      town: searchFilters.destinationName || undefined,
      listing_type: searchFilters.listingType || undefined,
    }),
  })

  const promoted = list.slice(0, 3)
  const latestReviews = list
    .filter((property) => Number(property.review_count || 0) > 0)
    .slice(0, 3)
  const destinationCards = featuredDestinations.slice(0, 12)
  const guideCards = [
    { icon: '🚖', title: 'Moi Airport to Nyali', info: '15 mins, taxi KSh 1,000–1,500' },
    { icon: '⛴️', title: 'Likoni Ferry Tips', info: 'Travel early morning to avoid queues.' },
    { icon: '🚆', title: 'SGR to Diani', info: 'Use Miritini transfer, then taxi to beach areas.' },
  ]
  const trustBadges = [
    { key: 'verified', icon: 'shield', label: t('trust_verified') },
    { key: 'payment', icon: 'credit', label: t('trust_secure') },
    { key: 'support', icon: 'chat', label: t('trust_fast') },
    { key: 'language', icon: 'globe', label: t('trust_swahili') },
    { key: 'agents', icon: 'check', label: t('trust_badge_trusted_agents') },
    { key: 'coverage', icon: 'check', label: t('trust_badge_coastal_coverage') },
  ]
  const fallbackAgents = [
    {
      id: 'fatma',
      agency_name: 'Fatma Ali',
      areas_served: 'Mombasa, Nyali',
      languages: 'Kiswahili,English',
      verified_badge: true,
      rating: 4.8,
      user: { phone_number: '255700000111' },
    },
    {
      id: 'juma',
      agency_name: 'Juma Coastal Homes',
      areas_served: 'Diani, Ukunda',
      languages: 'Kiswahili,English',
      verified_badge: true,
      rating: 4.7,
      user: { phone_number: '255700000111' },
    },
  ]
  const liveAgents = (agentList.length ? agentList : fallbackAgents).filter((agent) => agent.is_active !== false)
  const activeListingsCount = allListings.filter((item) => item.is_active !== false).length
  const verifiedAgentsCount = liveAgents.filter((agent) => agent.verified_badge).length
  const averageResponseMinutes = liveAgents.length
    ? Math.max(5, Math.round(liveAgents.reduce((sum, agent) => sum + (12 - Math.min(Number(agent.rating || 4), 5)), 0) / liveAgents.length))
    : 8
  const availableAgentsCount = liveAgents.filter((agent) => Number(agent.rating || 0) >= 4.5 || agent.verified_badge).length
  const agentFilters = ['all', 'available', 'Mombasa', 'Diani', 'Watamu', 'Zanzibar', 'BnB', 'Apartments']
  const filteredAgents = liveAgents.filter((agent) => {
    const haystack = [
      agent.agency_name,
      agent.areas_served,
      agent.languages,
      agent.user?.username,
    ].join(' ').toLowerCase()
    const matchesSearch = !agentSearch || haystack.includes(agentSearch.toLowerCase())
    const matchesFilter = agentFilter === 'all'
      || (agentFilter === 'available' && (Number(agent.rating || 0) >= 4.5 || agent.verified_badge))
      || haystack.includes(agentFilter.toLowerCase())
    return matchesSearch && matchesFilter
  })
  const featuredAgents = filteredAgents.slice(0, 2)
  const resolveAgentListings = (agent) => {
    const areas = (agent.areas_served || '').split(',').map((area) => area.trim().toLowerCase()).filter(Boolean)
    const matches = allListings.filter((property) => areas.some((area) => (
      `${property.location || ''} ${property.region || ''} ${property.town || ''}`.toLowerCase().includes(area)
    )))
    if (matches.length) return matches.length
    return Math.max(6, Math.round(Number(agent.rating || 4.4) * 4))
  }
  const buildAgentWhatsappLink = (agent) => {
    const phone = (agent.user?.phone_number || '255700000111').replace(/[^\d]/g, '')
    const name = agent.agency_name || agent.user?.username || t('verified_agents_section')
    const message = encodeURIComponent(`${t('agent_whatsapp_hello')} ${name}, ${t('agent_whatsapp_body')}`)
    return `https://wa.me/${phone}?text=${message}`
  }
  const tabs = [
    { id: 'rent', label: `🏠 ${t('quick_rent')}` },
    { id: 'hotel', label: `🏨 ${t('quick_hotel')}` },
    { id: 'taxi', label: `🚖 ${t('quick_taxi')}` },
    { id: 'package', label: `🌴 ${t('quick_package')}` },
    { id: 'agent', label: `🏢 ${t('quick_agent')}` },
  ]
  const listingTypeOptions = [
    { value: '', label: t('all_property_types') },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'bnb', label: 'BnB' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'villa', label: 'Villa' },
  ]
  const countries = [...new Set(destinations.map((item) => item.country))].sort()
  const regions = [
    ...new Set(
      destinations
        .filter((item) => !draftFilters.country || item.country === draftFilters.country)
        .map((item) => item.region),
    ),
  ].sort()
  const towns = destinations.filter(
    (item) => (!draftFilters.country || item.country === draftFilters.country)
      && (!draftFilters.region || item.region === draftFilters.region),
  )
  const quickSearchTowns = ['Nyali', 'Diani', 'Zanzibar', 'Watamu', 'Dar']
  const visiblePackageCount = 3
  const packageItems = packageList.slice()
  const canSlidePackages = packageItems.length > visiblePackageCount
  const boundedStart = Math.min(packageWindowStart, Math.max(0, packageItems.length - visiblePackageCount))
  const visiblePackages = canSlidePackages
    ? packageItems.slice(boundedStart, boundedStart + visiblePackageCount)
    : packageItems.slice(0, visiblePackageCount)

  const packageTypeVisuals = {
    'airport-pickup-stay': {
      tag: t('pkg_badge_coastal_escape'),
      location: 'Diani Beach, Kenya',
      images: [
        'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1200&q=75',
        'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=75',
        'https://images.unsplash.com/photo-1526481280695-3c4699d74c65?auto=format&fit=crop&w=1200&q=75',
      ],
    },
    'zanzibar-ferry-stay': {
      tag: t('pkg_badge_island_experience'),
      location: 'Zanzibar, Tanzania',
      images: [
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=75',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=75',
        'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=75',
      ],
    },
    'executive-business-stay': {
      tag: t('pkg_badge_business'),
      location: 'Nairobi, Kenya',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=75',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=75',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=75',
      ],
    },
  }

  const getPackageVisual = (pkg) => packageTypeVisuals[pkg.package_type] || {
    tag: t('pkg_badge_curated'),
    location: 'Kenya & Tanzania',
    images: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=75',
      'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1200&q=75',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=75',
    ],
  }

  const getPackageImagePool = (pkg, visual) => {
    const backendImage = [
      pkg?.image,
      pkg?.cover_image,
      pkg?.hero_image,
      pkg?.photo_url,
      pkg?.media_url,
      pkg?.first_image,
    ].find((value) => typeof value === 'string' && value.trim())
    const visualImages = Array.isArray(visual.images) && visual.images.length > 0
      ? visual.images
      : ['https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=75']
    return backendImage ? [backendImage, ...visualImages] : visualImages
  }

  const getVisualImageState = (pkg, visual, packageKey) => {
    const images = getPackageImagePool(pkg, visual)
    const baseOffset = String(packageKey || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    const index = (packageImageTick + baseOffset) % images.length
    return {
      images,
      index,
      currentImage: images[index],
    }
  }

  const parseIncludeParts = (text) => String(text || '')
    .split('•')
    .map((part) => part.trim())
    .filter(Boolean)

  const packageDetailRows = (pkg) => {
    const includes = parseIncludeParts(pkg.includes)
    if (pkg.package_type === 'executive-business-stay') {
      return [
        { icon: 'transfer', label: t('pkg_row_airport_pickup'), value: includes[0] || 'VIP Meet & Greet' },
        { icon: 'wifi', label: t('pkg_row_connectivity'), value: includes.find((item) => /wi-?fi|internet/i.test(item)) || 'Wi-Fi' },
        { icon: 'workspace', label: t('pkg_row_workspace'), value: includes.find((item) => /desk|workspace|office/i.test(item)) || 'Desk Setup' },
      ]
    }
    return [
      { icon: 'accommodation', label: t('pkg_row_accommodation'), value: includes[0] || `${pkg.duration_label || 'Stay'}` },
      { icon: 'transfer', label: t('pkg_row_transfers'), value: includes.find((item) => /transfer|pickup|ferry|airport/i.test(item)) || (pkg.transport_included ? t('package_transport') : t('no')) },
      { icon: 'meals', label: t('pkg_row_meals'), value: includes.find((item) => /meal|breakfast|lunch|dinner/i.test(item)) || (pkg.meals_included ? t('yes') : t('no')) },
    ]
  }

  const handlePackageNext = () => {
    if (!canSlidePackages) return
    const maxStart = Math.max(0, packageItems.length - visiblePackageCount)
    setPackageWindowStart((current) => (current >= maxStart ? 0 : current + 1))
  }

  const handlePackagePrev = () => {
    if (!canSlidePackages) return
    const maxStart = Math.max(0, packageItems.length - visiblePackageCount)
    setPackageWindowStart((current) => (current <= 0 ? maxStart : current - 1))
  }

  useEffect(() => {
    if (isPackagesLoading || isPackageImagePaused) return undefined
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setPackageImageTick((current) => current + 1)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [isPackagesLoading, isPackageImagePaused])

  const resolveExperienceRating = (property) => {
    const directRating = property.average_rating ?? property.avg_rating ?? property.rating
    if (directRating != null) return clampRating(directRating)
    if (Number(property.review_count || 0) > 0) return 4.5
    return 4
  }
  const spotlightRatings = latestReviews.map((property) => resolveExperienceRating(property))
  const spotlightTotal = spotlightRatings.length
  const spotlightAverage = spotlightTotal
    ? spotlightRatings.reduce((sum, item) => sum + item, 0) / spotlightTotal
    : 0
  const spotlightRoundedCounts = [1, 2, 3, 4, 5].reduce((acc, level) => ({ ...acc, [level]: 0 }), {})
  spotlightRatings.forEach((value) => {
    const rounded = Math.round(value)
    spotlightRoundedCounts[rounded] = (spotlightRoundedCounts[rounded] || 0) + 1
  })
  const spotlightTopShare = spotlightTotal
    ? Math.round(((spotlightRoundedCounts[5] || 0) / spotlightTotal) * 100)
    : 0

  const applySearchFilters = (nextFilters) => {
    setSearchFilters({
      country: nextFilters.country || '',
      region: nextFilters.region || '',
      destinationName: nextFilters.destinationName || '',
      listingType: nextFilters.listingType || '',
      location: nextFilters.location || '',
      priceMin: nextFilters.priceMin || '',
      priceMax: nextFilters.priceMax || '',
    })
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    applySearchFilters(draftFilters)
  }

  const handleQuickSearch = (town) => {
    const nextFilters = {
      ...draftFilters,
      destinationName: town,
      location: town,
    }
    setDraftFilters(nextFilters)
    applySearchFilters(nextFilters)
  }

  const handleAiAssist = async () => {
    const prompt = aiPrompt.trim()
    if (!prompt || isAiApplying) return
    setIsAiApplying(true)
    setAiHint('')
    try {
      const payload = await sendAiChat({ client_id: aiClientId, message: prompt })
      const structured = payload?.assistant_message?.structured_response || {}
      const filters = structured.filters || {}
      const nextFilters = {
        ...draftFilters,
        location: filters.location || draftFilters.location,
        listingType: filters.listing_type || draftFilters.listingType,
        priceMax: filters.max_price != null ? String(filters.max_price) : draftFilters.priceMax,
      }
      setDraftFilters(nextFilters)
      applySearchFilters(nextFilters)
      setAiHint(structured.message || t('ai_search_applied'))
    } catch {
      setAiHint(t('ai_search_error'))
    } finally {
      setIsAiApplying(false)
    }
  }

  useEffect(() => {
    const root = pageRef.current
    if (!root) return

    const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealItems = root.querySelectorAll('.reveal-item')
    if (motionReduced) {
      revealItems.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    revealItems.forEach((el) => {
      el.classList.remove('is-visible')
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [
    list.length,
    promoted.length,
    latestReviews.length,
    destinationCards.length,
    packageItems.length,
    isLoading,
    isPackagesLoading,
    isDestinationsLoading,
    isFeaturedDestinationsLoading,
  ])

  return (
    <div ref={pageRef}>
      <header className="hero hero-coastal hero-animate">
        <div className="hero-content">
          <h1 className="hero-title">{t('hero_headline')}</h1>
          <p className="hero-tagline">{t('hero_subline')}</p>
          <div className="hero-actions">
            <a href="#listings" className="btn btn-primary">{t('cta_find_stays')}</a>
            <a href="#packages" className="btn btn-accent">{t('cta_book_package')}</a>
          </div>
        </div>
      </header>

      <section className="search-hero-shell" aria-label={t('search_hero_title')}>
        <div className="quick-tabs">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`quick-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card search-card" id="listings">
          <div className="search-heading">
            <h2>{t('search_hero_title')}</h2>
            <p>{t('search_hero_subtitle')}</p>
          </div>

          <div className="search-ai-row">
            <input
              type="text"
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder={t('ai_search_placeholder')}
            />
            <button type="button" className="btn btn-secondary" onClick={handleAiAssist} disabled={isAiApplying}>
              {isAiApplying ? t('loading') : t('ai_search_apply')}
            </button>
          </div>
          {aiHint ? <p className="search-ai-hint">{aiHint}</p> : null}

          <form onSubmit={handleSearchSubmit}>
            <div className="grid search-grid search-grid-top">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('country_label')}</label>
                <select
                  value={draftFilters.country}
                  onChange={(e) => {
                    setDraftFilters((prev) => ({
                      ...prev,
                      country: e.target.value,
                      region: '',
                      destinationName: '',
                    }))
                  }}
                >
                  <option value="">{t('all_countries')}</option>
                  {countries.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('region_label')}</label>
                <select
                  value={draftFilters.region}
                  onChange={(e) => {
                    setDraftFilters((prev) => ({
                      ...prev,
                      region: e.target.value,
                      destinationName: '',
                    }))
                  }}
                >
                  <option value="">{t('all_regions')}</option>
                  {regions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('destination_label')}</label>
                <select
                  value={draftFilters.destinationName}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, destinationName: e.target.value }))}
                >
                  <option value="">{t('all_destinations')}</option>
                  {towns.map((item) => (
                    <option key={item.destination_id} value={item.destination_name}>
                      {item.destination_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('property_type')}</label>
                <select
                  value={draftFilters.listingType}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, listingType: e.target.value }))}
                >
                  {listingTypeOptions.map((item) => (
                    <option key={item.value || 'all'} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid search-grid search-grid-bottom">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('location')}</label>
                <input
                  type="text"
                  value={draftFilters.location}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder={t('location')}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('price_min')}</label>
                <input
                  type="number"
                  value={draftFilters.priceMin}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMin: e.target.value }))}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>{t('price_max')}</label>
                <input
                  type="number"
                  value={draftFilters.priceMax}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMax: e.target.value }))}
                  placeholder=""
                  min="0"
                />
              </div>
              <div className="search-submit-wrap">
                <button type="submit" className="btn btn-accent search-submit-btn">{t('search_now')}</button>
              </div>
            </div>

            <div className="search-popular-row">
              <strong>{t('popular_searches_label')}</strong>
              {quickSearchTowns.map((town) => (
                <button key={town} type="button" className="search-chip" onClick={() => handleQuickSearch(town)}>
                  {town}
                </button>
              ))}
            </div>
          </form>

          <div className="search-trust-row">
            <span>✓ {t('trust_verified')}</span>
            <span>✓ {t('trust_secure')}</span>
            <span>✓ {t('trust_local')}</span>
          </div>
          {activeTab === 'taxi' && <p className="hint-text">{t('taxi_intro')}</p>}
          {activeTab === 'package' && <p className="hint-text">{t('featured_packages')}</p>}
        </div>
      </section>

      <section className="card section-card" id="destinations">
        <div className="section-heading">
          <h2>{t('popular_destinations')}</h2>
        </div>
        {isFeaturedDestinationsLoading || isDestinationsLoading ? (
          <div className="destination-list">
            {Array.from({ length: 8 }).map((_, idx) => (
              <span key={`dest-skeleton-${idx}`} className="destination-pill skeleton skeleton-pill" />
            ))}
          </div>
        ) : (
          <div className="destination-list">
            {destinationCards.map((destination, idx) => (
              <Link
                key={destination.destination_id}
                to={`/destinations/${destination.destination_slug}`}
                className="destination-pill reveal-item"
                style={{ '--stagger': idx }}
              >
                {destination.destination_name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {isLoading ? (
        <section className="card section-card" id="featured-stays">
          <div className="section-heading">
            <h2>{t('featured_stays')}</h2>
          </div>
          <div className="grid grid-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <article key={`stay-skeleton-${idx}`} className="card property-card skeleton-card">
                <div className="property-card-image skeleton" />
                <div className="property-card-body">
                  <div className="skeleton skeleton-text-lg" />
                  <div className="skeleton skeleton-text-sm" />
                  <div className="skeleton skeleton-text-md" />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : list.length === 0 ? (
        <p>{t('no_results')}</p>
      ) : (
        <section className="card section-card" id="featured-stays">
          <div className="section-heading">
            <h2>{t('featured_stays')}</h2>
          </div>
          {!isLoading && promoted.length > 0 && (
            <div className="grid grid-3" style={{ marginBottom: '1.5rem' }}>
              {promoted.map((p, idx) => (
                <article key={`promoted-${p.id}`} className="promo-card reveal-item" style={{ '--stagger': idx }}>
                  <span className="promo-badge">{t('sponsored')}</span>
                  <Link to={`/property/${p.id}`} className="property-card-image-link">
                    <div className="property-card-image">
                      {p.first_image ? <img src={p.first_image} alt="" /> : <span className="no-image" />}
                    </div>
                  </Link>
                  <div className="property-card-body">
                    <strong>{p.title_sw}</strong>
                    <p className="property-card-meta">{p.location}</p>
                    <p className="property-card-price">TZS {Number(p.price_per_night).toLocaleString()}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="grid grid-3">
            {list.map((p, idx) => (
              <article key={p.id} className="card property-card reveal-item" style={{ '--stagger': idx }}>
                <Link to={`/property/${p.id}`} className="property-card-image-link">
                  <div className="property-card-image">
                    {p.first_image ? <img src={p.first_image} alt="" /> : <span className="no-image" />}
                  </div>
                </Link>
                <div className="property-card-body">
                  <strong>{p.title_sw}</strong>
                  <p className="property-card-meta">{p.location}</p>
                  <p className="property-card-price">{t('price_per_night')}: TZS {Number(p.price_per_night).toLocaleString()}</p>
                  <div className="property-card-actions">
                    <Link to={`/property/${p.id}`} className="btn btn-secondary btn-sm">{t('view_details')}</Link>
                    <Link to={`/book/${p.id}`} className="btn btn-primary btn-sm">{t('book_now')}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="card section-card" id="packages">
        <div className="section-heading package-premium-head">
          <div>
            <span className="package-curated-pill">✨ {t('pkg_curated_for_you')}</span>
            <h2>{t('featured_packages')}</h2>
            <p>{t('pkg_subtitle')}</p>
          </div>
          <div className="package-carousel-controls">
            <button type="button" aria-label={t('pkg_prev')} onClick={handlePackagePrev} disabled={!canSlidePackages}>‹</button>
            <button type="button" aria-label={t('pkg_next')} onClick={handlePackageNext} disabled={!canSlidePackages}>›</button>
          </div>
        </div>
        <div className="grid grid-3 package-premium-grid">
          {(isPackagesLoading ? Array.from({ length: 3 }).map((_, idx) => ({ id: `pkg-skeleton-${idx}` })) : visiblePackages).map((item, idx) => {
            if (!item.name) {
              return (
                <article key={item.id} className="package-premium-card package-premium-skeleton reveal-item" style={{ '--stagger': idx }}>
                  <div className="package-premium-media skeleton" />
                  <div className="package-premium-body">
                    <div className="skeleton skeleton-text-lg" />
                    <div className="skeleton skeleton-text-sm" />
                    <div className="skeleton skeleton-text-md" />
                  </div>
                </article>
              )
            }

            const visual = getPackageVisual(item)
            const details = packageDetailRows(item)
            const packageKey = item.package_type || item.slug || item.name
            const imageState = getVisualImageState(item, visual, packageKey)
            return (
              <article key={item.id} className="package-premium-card reveal-item" style={{ '--stagger': idx }}>
                <div
                  className="package-premium-media"
                  onMouseEnter={() => setIsPackageImagePaused(true)}
                  onMouseLeave={() => setIsPackageImagePaused(false)}
                  onFocus={() => setIsPackageImagePaused(true)}
                  onBlur={() => setIsPackageImagePaused(false)}
                >
                  <img
                    key={imageState.currentImage}
                    src={imageState.currentImage}
                    alt={`${item.name} - ${visual.location}`}
                    className="package-hero-image"
                    loading="lazy"
                  />
                  <span className="package-premium-tag">{visual.tag}</span>
                  <button type="button" className="package-fav-btn" aria-label={t('pkg_save_favorite')}>♡</button>
                  <div className="package-image-dots" aria-hidden="true">
                    {imageState.images.map((dotImage, dotIndex) => (
                      <span
                        key={`${item.id}-${dotImage}`}
                        className={dotIndex === imageState.index ? 'is-active' : ''}
                      />
                    ))}
                  </div>
                </div>
                <div className="package-premium-body">
                  <div className="package-premium-title-row">
                    <strong>{item.name}</strong>
                    <span>{item.duration_label || '-'}</span>
                  </div>
                  <p className="package-premium-location">
                    <PackageMetaIcon type="location" />
                    {visual.location}
                  </p>
                  <div className="package-detail-list">
                    {details.map((detail) => (
                      <div key={`${item.id}-${detail.label}`} className="package-detail-row">
                        <span><PackageMetaIcon type={detail.icon} /> {detail.label}</span>
                        <em>{detail.value}</em>
                      </div>
                    ))}
                  </div>
                  <div className="package-premium-footer">
                    <div>
                      <small>{t('package_price_from')}</small>
                      <strong>{String(item.price_from || '')}</strong>
                      <p>{t('pkg_per_person')}</p>
                    </div>
                    <Link to={`/booking/${item.package_type}`} className="btn btn-primary btn-sm package-book-btn">
                      {t('book_now')}
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        {!isPackagesLoading && visiblePackages.length === 0 ? (
          <p className="hint-text">{t('no_results')}</p>
        ) : null}
        <div className="package-trust-strip">
          <span><PackageMetaIcon type="secure" /> {t('pkg_trust_secure')}</span>
          <span><PackageMetaIcon type="support" /> {t('pkg_trust_support')}</span>
          <span><PackageMetaIcon type="verified" /> {t('pkg_trust_verified')}</span>
          <span><PackageMetaIcon type="price" /> {t('pkg_trust_price')}</span>
        </div>
      </section>

      <section className="card section-card" id="guides">
        <div className="section-heading">
          <h2>{t('travel_guides')}</h2>
        </div>
        <div className="grid grid-3">
          {guideCards.map((guide, idx) => (
            <article className="service-card reveal-item" style={{ '--stagger': idx }} key={guide.title}>
              <h3>{guide.icon} {guide.title}</h3>
              <p>{guide.info}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-card" id="contact">
        <div className="section-heading">
          <h2>{t('review_spotlight')}</h2>
        </div>
        {latestReviews.length === 0 ? (
          <p>{t('no_results')}</p>
        ) : (
          <>
            <article className="review-card experience-analytics-card">
              <div className="experience-analytics-head">
                <strong>{t('experience_analytics_title')}</strong>
                <span>{spotlightAverage.toFixed(1)} / 5</span>
              </div>
              <div className="experience-metric-row">
                <div>
                  <small>{t('experience_avg_label')}</small>
                  <strong>{spotlightAverage.toFixed(1)}</strong>
                </div>
                <div>
                  <small>{t('experience_total_label')}</small>
                  <strong>{spotlightTotal}</strong>
                </div>
                <div>
                  <small>{t('experience_top_label')}</small>
                  <strong>{spotlightTopShare}%</strong>
                </div>
              </div>
              <div className="experience-chart">
                {[5, 4, 3, 2, 1].map((level) => {
                  const count = spotlightRoundedCounts[level] || 0
                  const width = spotlightTotal ? Math.max(10, Math.round((count / spotlightTotal) * 100)) : 0
                  return (
                    <div key={`spotlight-row-${level}`} className="experience-bar-row">
                      <span>{level}</span>
                      <div className="experience-bar-track">
                        <span style={{ '--bar-fill': `${width}%` }} />
                      </div>
                      <em>{count}</em>
                    </div>
                  )
                })}
              </div>
            </article>
            <div className="grid grid-3">
              {latestReviews.map((property, idx) => (
                <article className="review-card reveal-item" style={{ '--stagger': idx }} key={`review-${property.id}`}>
                  <strong>{property.title_sw}</strong>
                  <p className="property-card-meta">{property.location}</p>
                  <div className="customer-experience-block">
                    <span className="customer-experience-label">{t('customer_experience')}</span>
                    <div className="customer-experience-scale" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={`${property.id}-level-${level}`}
                          className={resolveExperienceRating(property) >= level ? 'is-active' : ''}
                        >
                          {level}
                        </span>
                      ))}
                    </div>
                    <div className="customer-experience-stars" aria-label={`${resolveExperienceRating(property).toFixed(1)} out of 5`}>
                      {'★★★★★'.slice(0, Math.round(resolveExperienceRating(property)))}
                      {'☆☆☆☆☆'.slice(0, 5 - Math.round(resolveExperienceRating(property)))}
                      <strong>{resolveExperienceRating(property).toFixed(1)}/5</strong>
                    </div>
                  </div>
                  <p>{t('reviews')}: {property.review_count || 0}</p>
                  <Link to={`/property/${property.id}`} className="btn btn-secondary btn-sm">{t('view_details')}</Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="card section-card final-cta-card agent-marketplace-card">
        <div className="agent-marketplace-head">
          <div>
            <span className="trust-kicker">{t('trust_cta_kicker')}</span>
            <h2>{t('agent_marketplace_title')}</h2>
            <p className="trust-cta-subtext">
              {t('agent_marketplace_subtitle')}
            </p>
          </div>
          <div className="agent-live-stats">
            <span><strong>{verifiedAgentsCount}</strong>{t('agent_stat_verified')}</span>
            <span><strong>{activeListingsCount}</strong>{t('agent_stat_listings')}</span>
            <span><strong>{availableAgentsCount}</strong>{t('agent_stat_available')}</span>
            <span><strong>{averageResponseMinutes}{t('minute_abbr')}</strong>{t('agent_stat_response')}</span>
          </div>
        </div>

        <div className="agent-marketplace-tools">
          <input
            value={agentSearch}
            onChange={(event) => setAgentSearch(event.target.value)}
            placeholder={t('agent_search_placeholder')}
          />
          <div className="agent-filter-chips">
            {agentFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={agentFilter === filter ? 'is-active' : ''}
                onClick={() => setAgentFilter(filter)}
              >
                {filter === 'all' ? t('agent_filter_all') : filter === 'available' ? t('agent_filter_available') : filter}
              </button>
            ))}
          </div>
        </div>

        <div className="agent-marketplace-grid">
          <div className="agent-benefit-list">
            {trustBadges.slice(0, 4).map((item) => (
              <span key={item.key} className="trust-badge-item">
                <span className="trust-badge-icon"><TrustBadgeIcon type={item.icon} /></span>
                {item.label}
              </span>
            ))}
          </div>

          <div className="agent-card-list">
            {featuredAgents.map((agent) => (
              <article key={agent.id} className="trust-agent-card agent-live-card">
                <span className="trust-agent-avatar"><AgentAvatarIcon /></span>
                <div className="trust-agent-content">
                  <div className="agent-card-title-row">
                    <strong>{agent.agency_name || agent.user?.username}</strong>
                    {agent.verified_badge && (
                      <span className="trust-agent-verified" aria-label={t('verified_agents_section')}>
                        <TrustBadgeIcon type="shield" />
                      </span>
                    )}
                  </div>
                  <p>{t('trust_agent_role')} · {agent.areas_served || t('agent_default_region')}</p>
                  <p className="trust-agent-meta">
                    <span className="trust-agent-status-dot" />
                    {Number(agent.rating || 0).toFixed(1)} ★ · {resolveAgentListings(agent)} {t('agent_listings_label')} · {t('agent_replies_in')} {Math.max(5, Math.round(14 - Math.min(Number(agent.rating || 4), 5)))} {t('minutes_short')}
                  </p>
                  <div className="agent-card-actions">
                    <a className="btn btn-whatsapp btn-sm" href={buildAgentWhatsappLink(agent)} target="_blank" rel="noreferrer">
                      {t('quick_whatsapp')}
                    </a>
                    <Link to="/" className="btn btn-secondary btn-sm">{t('agent_view_listings')}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="agent-owner-cta">
          <span>{t('agent_owner_cta')}</span>
          <Link to="/register" className="btn btn-secondary btn-sm">{t('agent_register_cta')}</Link>
          <Link to="/property/new" className="btn btn-accent btn-sm">{t('add_property')}</Link>
        </div>
      </section>
    </div>
  )
}
