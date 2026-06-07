import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PriceDisplay } from '../components/PriceDisplay'
import { useAuth } from '../context/AuthContext'
import { getUserDisplayName, isOwnerDashboardUser } from '../utils/authProfile'
import { useQuery } from '@tanstack/react-query'
import { getProperties, getPropertyCategories } from '../api/properties'
import { getFeaturedDestinations, getDestinations } from '../api/destinations'
import { getPackages } from '../api/packages'
import { getAgents } from '../api/agents'
import { sendAiChat } from '../api/ai'
import { FaqSection } from '../components/FaqSection'

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
  const { user, loading: authLoading } = useAuth()
  const [draftFilters, setDraftFilters] = useState({
    country: '',
    region: '',
    destinationName: '',
    category: '',
    location: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    guests: '',
  })
  const [searchFilters, setSearchFilters] = useState({
    country: '',
    region: '',
    destinationName: '',
    category: '',
    location: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    guests: '',
  })
  const [activeTab, setActiveTab] = useState('rent')
  const [activeRegStep, setActiveRegStep] = useState(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiHint, setAiHint] = useState('')
  const [isAiApplying, setIsAiApplying] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
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
  const { data: categories = [] } = useQuery({
    queryKey: ['property-categories'],
    queryFn: getPropertyCategories,
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
      searchFilters.category,
      searchFilters.bedrooms,
      searchFilters.guests,
    ],
    queryFn: () => getProperties({
      location: searchFilters.location || undefined,
      price_min: searchFilters.priceMin || undefined,
      price_max: searchFilters.priceMax || undefined,
      country: searchFilters.country || undefined,
      region: searchFilters.region || undefined,
      town: searchFilters.destinationName || undefined,
      category: searchFilters.category || undefined,
      bedrooms: searchFilters.bedrooms || undefined,
      guests: searchFilters.guests || undefined,
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
      user: { phone_number: '254725301031' },
    },
    {
      id: 'juma',
      agency_name: 'Juma Coastal Homes',
      areas_served: 'Diani, Ukunda',
      languages: 'Kiswahili,English',
      verified_badge: true,
      rating: 4.7,
      user: { phone_number: '254725301031' },
    },
  ]
  const liveAgents = (agentList.length ? agentList : fallbackAgents).filter((agent) => agent.is_active !== false)
  const verifiedAgentsCount = liveAgents.filter((agent) => agent.verified_badge).length
  const coverageAreas = [...new Set(liveAgents.flatMap((agent) => (
    String(agent.areas_served || '')
      .split(',')
      .map((area) => area.trim())
      .filter(Boolean)
  )))]
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
    const phone = (agent.user?.phone_number || '254725301031').replace(/[^\d]/g, '')
    const name = agent.agency_name || agent.user?.username || t('verified_agents_section')
    const message = encodeURIComponent(`${t('agent_whatsapp_hello')} ${name}, ${t('agent_whatsapp_body')}`)
    return `https://wa.me/${phone}?text=${message}`
  }
  const resolveAgentBadges = (agent) => {
    const areas = (agent.areas_served || '').split(',').map((area) => area.trim()).filter(Boolean)
    return [
      ...areas.slice(0, 2),
      agent.verified_badge ? t('verified_agents_section') : '',
      Number(agent.rating || 0) >= 4.5 ? t('agent_filter_available') : '',
    ].filter(Boolean).slice(0, 4)
  }
  const tabs = [
    { id: 'rent', label: `🏠 ${t('quick_rent')}` },
    { id: 'hotel', label: `🏨 ${t('quick_hotel')}` },
    { id: 'taxi', label: `🚖 ${t('quick_taxi')}` },
    { id: 'package', label: `🌴 ${t('quick_package')}` },
    { id: 'agent', label: `🏢 ${t('quick_agent')}` },
  ]
  const categoryOptions = [
    { value: '', label: t('all_property_types') },
    ...categories.map((c) => ({ value: c.slug, label: `${c.icon} ${c.name}` })),
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
  const experienceTiles = [
    { key: 'beachfront', label: t('lifestyle_beachfront_label'), icon: '🌊', hint: t('lifestyle_beachfront_hint'), filters: { location: 'Zanzibar', listingType: 'villa' } },
    { key: 'city', label: t('lifestyle_city_label'), icon: '🏙️', hint: t('lifestyle_city_hint'), filters: { location: 'Dar', listingType: 'apartment' } },
    { key: 'family', label: t('lifestyle_family_label'), icon: '🏡', hint: t('lifestyle_family_hint'), filters: { location: 'Mombasa', listingType: 'house' } },
    { key: 'work', label: t('lifestyle_work_label'), icon: '💻', hint: t('lifestyle_work_hint'), filters: { location: 'Dar', listingType: 'apartment' } },
    { key: 'luxury', label: t('lifestyle_luxury_label'), icon: '💎', hint: t('lifestyle_luxury_hint'), filters: { location: 'Diani', listingType: 'villa' } },
    { key: 'budget', label: t('lifestyle_budget_label'), icon: '💰', hint: t('lifestyle_budget_hint'), filters: { location: 'Zanzibar', listingType: 'bnb', priceMax: '80000' } },
  ]
  const destinationStories = [
    {
      title: 'Zanzibar',
      to: '/destinations/zanzibar',
      image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=900&q=75',
      summary: 'Beach nightlife, culture, kite surfing and luxury ocean-view stays.',
      tags: ['Nungwi', 'Paje', 'Stone Town'],
    },
    {
      title: 'Dar es Salaam',
      to: '/destinations/dar-es-salaam',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=75',
      summary: 'Business-ready apartments, premium coastal living and long-stay value.',
      tags: ['Masaki', 'Oyster Bay', 'Kigamboni'],
    },
    {
      title: 'Diani',
      to: '/destinations/diani',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75',
      summary: 'Beachfront villas, family holidays and relaxed South Coast escapes.',
      tags: ['Beach Villas', 'Family', 'Luxury'],
    },
    {
      title: 'Mombasa',
      to: '/destinations/mombasa',
      image: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=900&q=75',
      summary: 'City access, airport transfers, historic coast and flexible stays.',
      tags: ['Nyali', 'Airport', 'City'],
    },
  ]
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

  // ── Property image resolver with curated Unsplash fallbacks ──────────────────
  const CATEGORY_FALLBACKS = {
    villa: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=900&q=75',
    apartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=75',
    bnb: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=75',
    hotel: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=75',
    'guest-house': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=75',
    resort: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=75',
    lodge: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=75',
    hostel: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=75',
    'serviced-apartment': 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&q=75',
    'vacation-home': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=75',
    'beach-house': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=75',
    'safari-camp': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=75',
    cottage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=75',
    cabin: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=75',
    'camping-site': 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?auto=format&fit=crop&w=900&q=75',
    'shared-stay': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=75',
    penthouse: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=900&q=75',
    'farm-stay': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=75',
  }
  const LISTING_TYPE_FALLBACKS = {
    villa: CATEGORY_FALLBACKS.villa,
    apartment: CATEGORY_FALLBACKS.apartment,
    bnb: CATEGORY_FALLBACKS.bnb,
    hotel: CATEGORY_FALLBACKS.hotel,
    house: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=75',
  }
  const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=75'

  const resolvePropertyImage = (p) => {
    if (p.first_image) return p.first_image
    const catSlug = p.category_detail?.slug || ''
    return (
      CATEGORY_FALLBACKS[catSlug]
      || LISTING_TYPE_FALLBACKS[p.listing_type]
      || DEFAULT_FALLBACK
    )
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
      category: nextFilters.category || '',
      location: nextFilters.location || '',
      priceMin: nextFilters.priceMin || '',
      priceMax: nextFilters.priceMax || '',
      bedrooms: nextFilters.bedrooms || '',
      guests: nextFilters.guests || '',
    })
    
    // Scroll to results so it feels interactive when an experience tile or quick search is clicked
    setTimeout(() => {
      const el = document.getElementById('featured-stays')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
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

  const handleExperienceSelect = (tile) => {
    const nextFilters = {
      ...draftFilters,
      location: tile.filters.location || '',
      category: tile.filters.category || '',
      priceMax: tile.filters.priceMax || '',
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

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
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
      {user && !authLoading ? (
        <div className="home-welcome-strip" role="status">
          <p className="home-welcome-line">
            {t('home_welcome_return', { name: getUserDisplayName(user) })}
          </p>
          <p className="home-welcome-sub">
            {isOwnerDashboardUser(user)
              ? t('home_welcome_owner_hint')
              : t('home_welcome_customer_hint')}
          </p>
          {isOwnerDashboardUser(user) ? (
            <Link to="/owner-dashboard" className="btn btn-secondary btn-sm home-welcome-cta">
              {t('owner_dashboard')}
            </Link>
          ) : (
            <Link to="/stays" className="btn btn-primary btn-sm home-welcome-cta">
              {t('cta_find_stays')}
            </Link>
          )}
        </div>
      ) : null}
      <header className="hero hero-coastal hero-animate">
        <div className="hero-content">
          <span className="hero-kicker">{t('hero_kicker')}</span>
          <h1 className="hero-title">{t('hero_headline')}</h1>
          <p className="hero-tagline">{t('hero_subline')}</p>
          <div className="hero-search-strip" aria-label="Popular destination shortcuts">
            <span>{t('hero_quick_search_label')}</span>
            {quickSearchTowns.map((town) => (
              <a key={town} href="#listings" onClick={() => handleQuickSearch(town)}>{town}</a>
            ))}
          </div>
          <div className="hero-actions">
            <a href="#listings" className="btn btn-primary">{t('cta_find_stays')}</a>
            <Link to="/food" className="btn btn-accent">{t('cta_order_food')}</Link>
            <Link to="/business" className="btn btn-secondary">{t('cta_business_services')}</Link>
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

          {(activeTab === 'rent' || activeTab === 'hotel') && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline" 
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                  {isAdvancedOpen ? t('hide_filters') : t('advanced_filters')}
                </button>
              </div>

              {isAdvancedOpen && (
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
                        value={draftFilters.category}
                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, category: e.target.value }))}
                      >
                        {categoryOptions.map((item) => (
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
                      <label>🛏️ {t('bedrooms_label')}</label>
                      <select
                        value={draftFilters.bedrooms}
                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, bedrooms: e.target.value }))}
                      >
                        <option value="">{t('any_option')}</option>
                        {[1,2,3,4,5].map((n) => (
                          <option key={n} value={n}>{n}+</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>👥 {t('guests_label')}</label>
                      <select
                        value={draftFilters.guests}
                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, guests: e.target.value }))}
                      >
                        <option value="">{t('any_option')}</option>
                        {[1,2,3,4,5,6,8,10,12].map((n) => (
                          <option key={n} value={n}>{n}+</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>{t('price_min')}</label>
                      <input
                        type="number"
                        value={draftFilters.priceMin}
                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMin: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>{t('price_max')}</label>
                      <input
                        type="number"
                        value={draftFilters.priceMax}
                        onChange={(e) => setDraftFilters((prev) => ({ ...prev, priceMax: e.target.value }))}
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                </form>
              )}
              
              <div className="search-popular-row">
                <strong>{t('popular_searches_label')}</strong>
                {quickSearchTowns.map((town) => (
                  <button key={town} type="button" className="search-chip" onClick={() => handleQuickSearch(town)}>
                    {town}
                  </button>
                ))}
              </div>

              <div className="search-submit-wrap" style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button type="button" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleSearchSubmit}>
                  {t('search_now')}
                </button>
              </div>

              <div className="search-trust-row" style={{ marginTop: '1rem' }}>
                <span>✓ {t('trust_verified')}</span>
                <span>✓ {t('trust_secure')}</span>
                <span>✓ {t('trust_local')}</span>
              </div>
            </>
          )}

          {activeTab === 'taxi' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{t('taxi_intro')}</h3>
              <Link to="/taxi" className="btn btn-primary">{t('book_taxi_now')}</Link>
            </div>
          )}

          {activeTab === 'package' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{t('pkg_subtitle')}</h3>
              <a href="#packages" className="btn btn-primary">{t('all_packages')}</a>
            </div>
          )}

          {activeTab === 'agent' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>{t('agent_marketplace_subtitle')}</h3>
              <a href="#agents" className="btn btn-primary">{t('agent_view_listings')}</a>
            </div>
          )}

        </div>
      </section>

      {/* ── OUR SERVICES ECOSYSTEM ── */}
      <section className="card section-card services-ecosystem">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t('svc_kicker')}</span>
            <h2>{t('svc_title')}</h2>
            <p>Serving Kenya, Tanzania, Uganda, Rwanda, Burundi, South Sudan, Ethiopia &amp; DR Congo</p>
          </div>
        </div>
        <div className="services-ecosystem-grid">
          <article className="service-eco-card reveal-item" style={{ '--stagger': 0 }}>
            <div className="service-eco-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>🏠</div>
            <div className="service-eco-body">
              <strong>{t('svc_homes_title')}</strong>
              <p>{t('svc_homes_desc')}</p>
              <ul className="service-eco-list">
                <li>🇰🇪 Mombasa, Diani, Nairobi</li>
                <li>🇹🇿 Zanzibar, Dar es Salaam</li>
                <li>🇺🇬 Kampala, Entebbe</li>
                <li>🇷🇼 Kigali &amp; more destinations</li>
              </ul>
              <Link to="/stays" className="btn btn-primary btn-sm">{t('cta_find_stays')}</Link>
            </div>
          </article>
          <article className="service-eco-card reveal-item" style={{ '--stagger': 1 }}>
            <div className="service-eco-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>🍔</div>
            <div className="service-eco-body">
              <strong>{t('svc_food_title')}</strong>
              <p>Order from local restaurants across East Africa. Delivered to your stay, home, or office.</p>
              <ul className="service-eco-list">
                <li>🇰🇪 Swahili Pilau, Nyama Choma</li>
                <li>🇹🇿 Zanzibar Spice, Urojo Soup</li>
                <li>🇺🇬 Rolex, Matoke, Luwombo</li>
                <li>🇷🇼 Brochettes, Isombe &amp; more</li>
              </ul>
              <Link to="/food" className="btn btn-accent btn-sm">{t('cta_order_food')}</Link>
            </div>
          </article>
          <article className="service-eco-card reveal-item" style={{ '--stagger': 2 }}>
            <div className="service-eco-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1e3a5f)' }}>📄</div>
            <div className="service-eco-body">
              <strong>{t('svc_biz_title')}</strong>
              <p>Business registration, tax compliance, and property licensing across all East African countries.</p>
              <ul className="service-eco-list">
                <li>🇰🇪 KRA, BRS Kenya</li>
                <li>🇹🇿 TRA, BRELA Tanzania</li>
                <li>🇺🇬 URA, URSB Uganda</li>
                <li>🇷🇼 RRA, RDB Rwanda &amp; more</li>
              </ul>
              <Link to="/business" className="btn btn-secondary btn-sm">{t('cta_business_services')}</Link>
            </div>
          </article>
        </div>
      </section>

      {/* ── HOW REGISTRATION WORKS (Interactive Steps) ── */}
      <section className="card section-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', border: 'none', overflow: 'hidden', position: 'relative' }}>
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'10\'/%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div className="section-heading" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-kicker" style={{ color: '#f59e0b' }}>Business Services</span>
            <h2 style={{ color: '#fff' }}>How Registration Works</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Get your business registered across East Africa in 5 easy steps. Click any step to begin.</p>
          </div>

          {/* Steps Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              {
                step: 1, icon: '👤', label: 'Sign Up Free',
                desc: 'Create your Makazi Plus account — free, takes 2 minutes.',
                color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)',
                to: '/register', cta: 'Sign Up Now →',
              },
              {
                step: 2, icon: '📋', label: 'Select Service',
                desc: 'Browse services by country: Kenya, Tanzania, Uganda, Rwanda & more.',
                color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1e3a5f)',
                to: '/business#services', cta: 'Browse Services →',
              },
              {
                step: 3, icon: '📤', label: 'Upload Documents',
                desc: 'Securely upload your ID and business documents via your dashboard.',
                color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
                to: '/provider-dashboard', cta: 'Open Dashboard →',
              },
              {
                step: 4, icon: '💳', label: 'Make Payment',
                desc: 'Pay via M-Pesa, MTN MoMo, Airtel Money, or bank transfer.',
                color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                to: '/business#services', cta: 'View Pricing →',
              },
              {
                step: 5, icon: '✅', label: 'Get Certificate',
                desc: 'Receive your official certificate digitally in 3–7 business days.',
                color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
                to: '/provider-dashboard', cta: 'Track Progress →',
              },
            ].map((item, idx) => (
              <Link
                key={item.step}
                to={item.to}
                className="reveal-item"
                style={{
                  '--stagger': idx,
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${item.color}40`,
                  borderRadius: '16px',
                  padding: '1.5rem 1.25rem',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${item.color}20`
                  e.currentTarget.style.borderColor = item.color
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 12px 32px ${item.color}30`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = `${item.color}40`
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Step badge */}
                <span style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '1.25rem',
                  background: item.gradient,
                  color: '#fff',
                  borderRadius: '20px',
                  padding: '0.15rem 0.6rem',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  letterSpacing: '0.05em',
                }}>
                  STEP {item.step}
                </span>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: item.gradient, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.6rem', marginBottom: '1rem',
                  boxShadow: `0 6px 16px ${item.color}40`,
                }}>
                  {item.icon}
                </div>
                <strong style={{ color: '#fff', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>
                  {item.label}
                </strong>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
                <span style={{ color: item.color, fontSize: '0.85rem', fontWeight: '700' }}>
                  {item.cta}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link to="/register" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
              Get Started Free →
            </Link>
            <Link to="/business" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
              Explore All Business Services
            </Link>
          </div>
        </div>
      </section>

      <section className="card section-card experience-section">
        <div className="section-heading lifestyle-heading">
          <div>
            <span className="section-kicker">{t('lifestyle_kicker')}</span>
            <h2>{t('lifestyle_title')}</h2>
            <p>{t('lifestyle_subtitle')}</p>
          </div>
          <Link to="/stays" className="btn btn-secondary btn-sm">{t('lifestyle_browse_cta')}</Link>
        </div>
        <div className="experience-ribbon" role="list">
          {experienceTiles.map((tile, idx) => (
            <button
              key={tile.key}
              type="button"
              className="experience-chip reveal-item"
              style={{ '--stagger': idx }}
              onClick={() => handleExperienceSelect(tile)}
              role="listitem"
              aria-label={tile.label}
            >
              <span className="experience-chip-icon">{tile.icon}</span>
              <span className="experience-chip-text">
                <strong>{tile.label}</strong>
                <small>{tile.hint}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="card section-card destination-story-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t('destinations_story_kicker')}</span>
            <h2>{t('destinations_story_title')}</h2>
            <p>{t('destinations_story_subtitle')}</p>
          </div>
        </div>
        <div className="destination-story-grid">
          {destinationStories.map((destination, idx) => (
            <Link
              key={destination.title}
              to={destination.to}
              className="destination-story-card reveal-item"
              style={{ '--stagger': idx }}
            >
              <img src={destination.image} alt="" loading="lazy" />
              <div>
                <strong>{destination.title}</strong>
                <p>{destination.summary}</p>
                <span>
                  {destination.tags.map((tag) => <em key={tag}>{tag}</em>)}
                </span>
              </div>
            </Link>
          ))}
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
            <Link to="/stays" className="btn btn-secondary btn-sm">{t('view_all_stays')}</Link>
          </div>
          <div className="grid grid-3 featured-stays-grid">
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
            <Link to="/stays" className="btn btn-secondary btn-sm">{t('view_all_stays')}</Link>
          </div>
          {!isLoading && promoted.length > 0 && (
            <div className="grid grid-3 featured-stays-grid" style={{ marginBottom: '1.5rem' }}>
              {promoted.map((p, idx) => (
                <article key={`promoted-${p.id}`} className="promo-card reveal-item" style={{ '--stagger': idx }}>
                  <span className="promo-badge">{t('sponsored')}</span>
                  <Link to={`/property/${p.id}${p.slug ? '-' + p.slug : ''}`} className="property-card-image-link">
                    <div className="property-card-image">
                      <img src={resolvePropertyImage(p)} alt={p.title_sw || 'Property'} loading="lazy" />
                    </div>
                  </Link>
                  <div className="property-card-body">
                    <strong>{p.title_sw}</strong>
                    <p className="property-card-meta">{p.location}</p>
                    <PriceDisplay amount={p.price_per_night} baseCurrency={p.base_currency} className="property-card-price" />
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="grid grid-3 featured-stays-grid">
            {list.map((p, idx) => (
              <article key={p.id} className="card property-card reveal-item" style={{ '--stagger': idx }}>
                <Link to={`/property/${p.id}${p.slug ? '-' + p.slug : ''}`} className="property-card-image-link">
                  <div className="property-card-image">
                    <img src={resolvePropertyImage(p)} alt={p.title_sw || 'Property'} loading="lazy" />
                  </div>
                </Link>
                <div className="property-card-body">
                  <strong>{p.title_sw}</strong>
                  <p className="property-card-meta">{p.location}</p>
                  <PriceDisplay amount={p.price_per_night} baseCurrency={p.base_currency} className="property-card-price" />
                  <div className="property-card-actions">
                    <Link to={`/property/${p.id}${p.slug ? '-' + p.slug : ''}`} className="btn btn-secondary btn-sm">{t('view_details')}</Link>
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
            <Link to="/packages" className="btn btn-secondary btn-sm">{t('all_packages')}</Link>
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

      <section className="card section-card">
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
                  <Link to={`/property/${property.id}${property.slug ? '-' + property.slug : ''}`} className="btn btn-secondary btn-sm">{t('view_details')}</Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="card section-card final-cta-card agent-marketplace-card" id="agents">
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
            <span><strong>{coverageAreas.length || 'Pwani'}</strong>{t('agent_stat_coverage')}</span>
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
            <p className="agent-verification-note">{t('agent_verification_note')}</p>
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
                  <div className="agent-badge-row">
                    {resolveAgentBadges(agent).map((badge) => <span key={`${agent.id}-${badge}`}>{badge}</span>)}
                  </div>
                  <p className="trust-agent-meta">
                    <span className="trust-agent-status-dot" />
                    {Number(agent.rating || 0).toFixed(1)} ★ · {resolveAgentListings(agent)} {t('agent_listings_label')} · {t('agent_replies_in')} ~{Math.max(5, Math.round(14 - Math.min(Number(agent.rating || 4), 5)))} {t('minutes_short')}
                  </p>
                  <div className="agent-card-actions">
                    <a className="btn btn-whatsapp btn-sm" href={buildAgentWhatsappLink(agent)} target="_blank" rel="noreferrer">
                      {t('quick_whatsapp')}
                    </a>
                    <Link to="/stays" className="btn btn-secondary btn-sm">{t('agent_view_listings')}</Link>
                  </div>
                </div>
              </article>
            ))}
            {featuredAgents.length < 3 && (
              <article className="trust-agent-card agent-live-card agent-join-card">
                <span className="trust-agent-avatar"><AgentAvatarIcon /></span>
                <div className="trust-agent-content">
                  <strong>{t('agent_join_card_title')}</strong>
                  <p>{t('agent_join_card_body')}</p>
                  <div className="agent-card-actions">
                    <Link to="/register" className="btn btn-accent btn-sm">{t('agent_register_cta')}</Link>
                    <Link to="/property/new" className="btn btn-secondary btn-sm">{t('add_property')}</Link>
                  </div>
                </div>
              </article>
            )}
          </div>
        </div>

        <div className="agent-owner-cta">
          <span>{t('agent_owner_cta')}</span>
          <Link to="/agents" className="btn btn-secondary btn-sm">{t('menu_agents')}</Link>
          <Link to="/register" className="btn btn-secondary btn-sm">{t('agent_register_cta')}</Link>
          <Link to="/property/new" className="btn btn-accent btn-sm">{t('add_property')}</Link>
        </div>
      </section>

      {/* ── HOW REGISTRATION WORKS (Interactive) ── */}
      <section className="card section-card" style={{ overflow: 'visible' }}>
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="section-kicker">Get Started Easily</span>
          <h2>How Registration Works</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>5 simple steps to register and access all Makazi services — click each step to learn more</p>
        </div>

        {/* Step cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            {
              id: 'signup',
              step: 1,
              icon: '👤',
              label: 'Sign Up',
              desc: 'Create your free Makazi Plus account in under 2 minutes.',
              cta: { label: 'Sign Up Free →', to: '/register', className: 'btn btn-primary btn-sm' },
            },
            {
              id: 'login',
              step: 2,
              icon: '🔐',
              label: 'Log In',
              desc: 'Log in to your account to access your personalised dashboard.',
              cta: { label: 'Log In →', to: '/login', className: 'btn btn-secondary btn-sm' },
            },
            {
              id: 'select',
              step: 3,
              icon: '📋',
              label: 'Select a Service',
              desc: 'Choose from Stays, Food Delivery, or Business Services across East Africa.',
              cta: { label: 'Browse Services →', href: '#listings', className: 'btn btn-secondary btn-sm' },
            },
            {
              id: 'book',
              step: 4,
              icon: '💳',
              label: 'Book & Pay',
              desc: 'Complete your booking or order with secure mobile money or card payment.',
              cta: { label: 'Find Stays →', to: '/stays', className: 'btn btn-secondary btn-sm' },
            },
            {
              id: 'track',
              step: 5,
              icon: '✅',
              label: 'Track & Enjoy',
              desc: 'Monitor your booking, order, or registration status from your dashboard.',
              cta: { label: 'Go to Dashboard →', to: '/owner-dashboard', className: 'btn btn-accent btn-sm' },
            },
          ].map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveRegStep(activeRegStep === step.id ? null : step.id)}
              style={{
                background: activeRegStep === step.id
                  ? 'linear-gradient(135deg, var(--color-primary), #1e3a5f)'
                  : 'var(--color-card)',
                border: `2px solid ${activeRegStep === step.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: '16px',
                padding: '1.5rem 1rem 1.25rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: activeRegStep === step.id ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: activeRegStep === step.id
                  ? '0 10px 30px rgba(15, 139, 141, 0.35)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
                color: activeRegStep === step.id ? '#fff' : 'var(--color-heading)',
                position: 'relative',
              }}
              aria-expanded={activeRegStep === step.id}
            >
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: activeRegStep === step.id ? '#f59e0b' : 'var(--color-primary)',
                color: '#fff',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: '700',
                border: '2px solid var(--color-card)',
              }}>
                {step.step}
              </span>
              <div style={{ fontSize: '2rem', marginBottom: '0.6rem', marginTop: '0.25rem' }}>{step.icon}</div>
              <strong style={{ fontSize: '0.9rem', display: 'block', lineHeight: 1.3 }}>{step.label}</strong>
            </button>
          ))}
        </div>

        {/* Expanded detail panel */}
        {activeRegStep && (() => {
          const steps = [
            { id: 'signup', step: 1, icon: '👤', label: 'Sign Up', desc: 'Create your free Makazi Plus account in under 2 minutes.', cta: { label: 'Sign Up Free →', to: '/register', className: 'btn btn-primary btn-sm' } },
            { id: 'login', step: 2, icon: '🔐', label: 'Log In', desc: 'Log in to your account to access your personalised dashboard.', cta: { label: 'Log In →', to: '/login', className: 'btn btn-secondary btn-sm' } },
            { id: 'select', step: 3, icon: '📋', label: 'Select a Service', desc: 'Choose from Stays, Food Delivery, or Business Services across East Africa.', cta: { label: 'Browse Services →', href: '#listings', className: 'btn btn-secondary btn-sm' } },
            { id: 'book', step: 4, icon: '💳', label: 'Book & Pay', desc: 'Complete your booking or order with secure mobile money or card payment.', cta: { label: 'Find Stays →', to: '/stays', className: 'btn btn-secondary btn-sm' } },
            { id: 'track', step: 5, icon: '✅', label: 'Track & Enjoy', desc: 'Monitor your booking, order, or registration status from your dashboard.', cta: { label: 'Go to Dashboard →', to: '/owner-dashboard', className: 'btn btn-accent btn-sm' } },
          ]
          const found = steps.find((s) => s.id === activeRegStep)
          if (!found) return null
          return (
            <div style={{
              background: 'linear-gradient(135deg, rgba(15,139,141,0.09), rgba(30,58,95,0.07))',
              border: '1px solid var(--color-primary)',
              borderRadius: '16px',
              padding: '1.75rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '3rem' }}>{found.icon}</span>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  Step {found.step}: {found.label}
                </strong>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{found.desc}</p>
              </div>
              {found.cta.to ? (
                <Link to={found.cta.to} className={found.cta.className} style={{ whiteSpace: 'nowrap' }}>
                  {found.cta.label}
                </Link>
              ) : (
                <a href={found.cta.href} className={found.cta.className} style={{ whiteSpace: 'nowrap' }}>
                  {found.cta.label}
                </a>
              )}
            </div>
          )
        })()}

        {/* Inline step shortcuts for non-expanded view */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link to="/register" className="btn btn-primary btn-sm">👤 Sign Up</Link>
          <Link to="/login" className="btn btn-secondary btn-sm">🔐 Log In</Link>
          <Link to="/food" className="btn btn-accent btn-sm">🍔 Order Food</Link>
          <Link to="/business" className="btn btn-secondary btn-sm">📄 Business Services</Link>
          <Link to="/stays" className="btn btn-secondary btn-sm">🏠 Find Stays</Link>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

    </div>
  )
}
