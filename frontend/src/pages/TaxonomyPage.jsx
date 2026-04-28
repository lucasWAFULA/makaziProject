import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProperties } from '../api/properties'
import { getPackages } from '../api/packages'
import { getAgents } from '../api/agents'

const stayMap = {
  'budget-rooms': { title: 'Budget Rooms', params: { listing_type: 'hotel', catalog_slug: 'budget-rooms' } },
  'beach-villas': { title: 'Beach Villas', params: { listing_type: 'villa', catalog_slug: 'beach-villas' } },
  apartments: { title: 'Apartments', params: { listing_type: 'apartment' } },
  'luxury-hotels': { title: 'Luxury Hotels', params: { listing_type: 'hotel', catalog_slug: 'luxury-hotels' } },
  'near-airport': { title: 'Near Airport', params: { catalog_slug: 'near-airport' } },
  'near-sgr': { title: 'Near SGR', params: { catalog_slug: 'near-sgr' } },
}

const bookingMap = {
  'airport-pickup-stay': { title: 'Airport Pickup + Stay', params: { package_type: 'airport-pickup-stay' } },
  'beach-holiday-packages': { title: 'Beach Holiday Packages', params: { package_type: 'beach-holiday-packages' } },
  'family-vacation-packages': { title: 'Family Vacation Packages', params: { package_type: 'family-vacation-packages' } },
  'honeymoon-packages': { title: 'Honeymoon Packages', params: { package_type: 'honeymoon-packages' } },
  'weekend-getaways': { title: 'Weekend Getaways', params: { package_type: 'weekend-getaways' } },
  'executive-business-stay': { title: 'Executive Business Stay', params: { package_type: 'executive-business-stay' } },
}

const agentMap = {
  verified: { title: 'Verified Agents', params: { verified: 1 } },
  apartments: { title: 'Apartments for Rent', params: { area: 'apartment' } },
  houses: { title: 'Houses for Sale', params: { area: 'house' } },
  land: { title: 'Land for Sale', params: { area: 'land' } },
  commercial: { title: 'Commercial Space', params: { area: 'commercial' } },
}

const stayChips = [
  { label: 'All stays', value: 'all' },
  { label: 'Budget', value: 'budget' },
  { label: 'Standard', value: 'standard' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Zanzibar', value: 'zanzibar' },
  { label: 'Dar', value: 'dar' },
  { label: 'Beachfront', value: 'beachfront' },
  { label: 'Work-friendly', value: 'work' },
]

const getPrice = (item) => Number(item.price_per_night || item.price || 0)

const getStayText = (item) => [
  item.title_sw,
  item.title,
  item.location,
  item.region,
  item.town,
  item.destination_name,
  item.listing_type,
  item.amenities,
].join(' ').toLowerCase()

const getPriceTier = (price) => {
  if (price <= 80000) return 'Budget'
  if (price <= 180000) return 'Standard'
  if (price <= 350000) return 'Premium'
  return 'Luxury'
}

const getStayTags = (item) => {
  const text = getStayText(item)
  const tags = [getPriceTier(getPrice(item))]
  if (/beach|ocean|sea|nungwi|kendwa|paje|diani|jambiani/.test(text)) tags.push('Beachfront')
  if (/wifi|work|desk|business|masaki|oyster|dar/.test(text)) tags.push('Work-friendly')
  if (/pool/.test(text)) tags.push('Pool')
  if (/parking/.test(text)) tags.push('Parking')
  return tags.slice(0, 3)
}

function StayCard({ item }) {
  const price = getPrice(item)
  return (
    <article className="premium-listing-card">
      <div className="premium-listing-media">
        {item.first_image ? <img src={item.first_image} alt="" loading="lazy" /> : <span className="no-image" />}
      </div>
      <div className="premium-listing-body">
        <strong>{item.title_sw || item.title}</strong>
        <p className="property-card-meta">{item.location || item.town || item.region}</p>
        <div className="listing-tags">
          {getStayTags(item).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="listing-card-footer">
          <b>TZS {price.toLocaleString()}</b>
          <Link to={`/property/${item.id}`} className="btn btn-secondary btn-sm">View details</Link>
        </div>
      </div>
    </article>
  )
}

export function TaxonomyPage() {
  const { type, slug } = useParams()
  const [activeChip, setActiveChip] = useState('all')
  const mapByType = type === 'stays' ? stayMap : type === 'booking' ? bookingMap : type === 'agents' ? agentMap : null
  const fallbackConfig = type === 'booking' ? { title: 'Package Results', params: { package_type: slug } } : null
  const config = mapByType?.[slug] || fallbackConfig

  const { data = [], isLoading } = useQuery({
    queryKey: ['taxonomy', type, slug],
    queryFn: async () => {
      if (!config) return []
      if (type === 'stays') return getProperties(config.params)
      if (type === 'booking') return getPackages(config.params)
      if (type === 'agents') return getAgents(config.params)
      return []
    },
    enabled: !!config,
  })

  const filteredStays = useMemo(() => {
    if (type !== 'stays') return data
    if (activeChip === 'all') return data
    return data.filter((item) => {
      const text = getStayText(item)
      const price = getPrice(item)
      if (activeChip === 'budget') return price <= 80000
      if (activeChip === 'standard') return price > 80000 && price <= 180000
      if (activeChip === 'premium') return price > 180000 && price <= 350000
      if (activeChip === 'luxury') return price > 350000
      if (activeChip === 'zanzibar') return /zanzibar|stone town|nungwi|kendwa|paje|jambiani/.test(text)
      if (activeChip === 'dar') return /dar|masaki|oyster|msasani|mikocheni|kinondoni|kigamboni/.test(text)
      if (activeChip === 'beachfront') return /beach|ocean|sea|nungwi|kendwa|paje|diani|jambiani/.test(text)
      if (activeChip === 'work') return /wifi|work|desk|business|masaki|oyster|dar/.test(text)
      return true
    })
  }, [activeChip, data, type])

  const staySections = useMemo(() => {
    if (type !== 'stays') return []
    const sections = [
      {
        title: 'Beachfront Apartments in Zanzibar',
        description: 'Ocean access, island energy and stays near Nungwi, Paje, Kendwa and Stone Town.',
        items: filteredStays.filter((item) => /zanzibar|nungwi|kendwa|paje|jambiani|stone town|beach|ocean/.test(getStayText(item))),
      },
      {
        title: 'Business-ready Apartments in Dar es Salaam',
        description: 'Convenient stays near Masaki, Oyster Bay, Msasani and city business routes.',
        items: filteredStays.filter((item) => /dar|masaki|oyster|msasani|mikocheni|kinondoni/.test(getStayText(item))),
      },
      {
        title: 'Budget and Mid-range Comfort',
        description: 'Simple, clean, practical stays for short visits and value-focused trips.',
        items: filteredStays.filter((item) => getPrice(item) <= 180000),
      },
      {
        title: 'Premium and Luxury Near the Ocean',
        description: 'Better interiors, service and locations for memorable coastal stays.',
        items: filteredStays.filter((item) => getPrice(item) > 180000 || /villa|luxury|premium|beach|ocean/.test(getStayText(item))),
      },
    ]
    const visibleSections = sections
      .map((section) => ({ ...section, items: section.items.slice(0, 8) }))
      .filter((section) => section.items.length > 0)
    return visibleSections.length ? visibleSections : [{ title: config.title, description: 'Available stays matching this category.', items: filteredStays }]
  }, [config.title, filteredStays, type])

  if (!config) {
    return (
      <section className="card section-card">
        <h2>Category not found</h2>
        <Link to="/" className="btn btn-primary btn-sm">Back home</Link>
      </section>
    )
  }

  return (
    <section className="card section-card">
      <div className="section-heading">
        <h2>{config.title}</h2>
      </div>
      {type === 'stays' && (
        <div className="filter-chip-row" aria-label="Stay filters">
          {stayChips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              className={activeChip === chip.value ? 'is-active' : ''}
              onClick={() => setActiveChip(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      {isLoading ? (
        <p>Loading...</p>
      ) : data.length === 0 || (type === 'stays' && filteredStays.length === 0) ? (
        <p>No results available yet.</p>
      ) : type === 'stays' ? (
        <div className="listing-section-stack">
          {staySections.map((section) => (
            <section key={section.title} className="listing-group">
              <div className="section-heading compact-heading">
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.description}</p>
                </div>
              </div>
              <div className="grid grid-3">
                {section.items.map((item) => <StayCard key={`${section.title}-${item.id}`} item={item} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-3">
          {type === 'booking' && data.map((item) => (
            <article key={item.id} className="review-card">
              <strong>{item.name}</strong>
              <p className="property-card-meta">{item.duration_label}</p>
              <p>{item.includes}</p>
              <p><strong>Price from:</strong> {item.price_from}</p>
              <Link to="/bookings" className="btn btn-primary btn-sm">Book now</Link>
            </article>
          ))}
          {type === 'agents' && data.map((item) => (
            <article key={item.id} className="review-card">
              <strong>{item.agency_name}</strong>
              <p className="property-card-meta">{item.areas_served}</p>
              <p>{item.languages}</p>
              <p>{item.verified_badge ? '✅ Verified' : 'Pending verification'} • ★ {item.rating}</p>
              <a href={`https://wa.me/${(item.user?.phone_number || '').replace(/\D/g, '')}`} className="btn btn-accent btn-sm" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
