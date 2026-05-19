import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProperties } from '../api/properties'

const priceChips = [
  { label: 'All prices', value: '' },
  { label: 'Budget', value: 'budget' },
  { label: 'Standard', value: 'standard' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' },
]

const experienceChips = [
  { label: 'All experiences', value: '' },
  { label: 'Beachfront', value: 'beachfront' },
  { label: 'City convenience', value: 'city_convenience' },
  { label: 'Family friendly', value: 'family_friendly' },
  { label: 'Work-friendly', value: 'work_friendly' },
  { label: 'Luxury', value: 'luxury' },
]

const typeChips = [
  { label: 'All stays', value: '' },
  { label: 'Apartments', value: 'apartment' },
  { label: 'Villas', value: 'villa' },
  { label: 'BnBs', value: 'bnb' },
  { label: 'Hotels', value: 'hotel' },
  { label: 'Homes', value: 'house' },
]

function formatTag(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getVerificationBadge(item) {
  const tier = String(item?.verification_tier || '').toLowerCase()
  if (tier === 'premium_verified') return 'Premium Verified'
  if (tier === 'remote_verified') return 'Makazi Verified'
  if (tier === 'unverified') return 'Unverified'
  return ''
}

function StayCard({ item }) {
  const verificationBadge = getVerificationBadge(item)
  const tags = Array.isArray(item.experience_tags) && item.experience_tags.length
    ? item.experience_tags.slice(0, 3).map(formatTag)
    : [item.price_tier ? formatTag(item.price_tier) : 'Verified stay', item.listing_type ? formatTag(item.listing_type) : 'MakaziPlus']

  return (
    <article className="premium-listing-card">
      <div className="premium-listing-media">
        {item.first_image ? <img src={item.first_image} alt="" loading="lazy" /> : <span className="no-image" />}
      </div>
      <div className="premium-listing-body">
        <strong>{item.title_sw || item.title}</strong>
        <p className="property-card-meta">{item.location || item.town || item.region}</p>
        <div className="listing-tags">
          {verificationBadge && <span>{verificationBadge}</span>}
          {tags.map((tag) => <span key={`${item.id}-${tag}`}>{tag}</span>)}
        </div>
        <div className="listing-card-footer">
          <b>TZS {Number(item.price_per_night || 0).toLocaleString()}</b>
          <Link to={`/property/${item.id}${item.slug ? '-' + item.slug : ''}`} className="btn btn-secondary btn-sm">View details</Link>
        </div>
      </div>
    </article>
  )
}

export function StaysPage() {
  const [filters, setFilters] = useState({
    location: '',
    priceTier: '',
    experience: '',
    listingType: '',
  })

  const queryParams = useMemo(() => ({
    location: filters.location || undefined,
    price_tier: filters.priceTier || undefined,
    experience: filters.experience || undefined,
    listing_type: filters.listingType || undefined,
  }), [filters])

  const { data: stays = [], isLoading } = useQuery({
    queryKey: ['stays-page', queryParams],
    queryFn: () => getProperties(queryParams),
  })

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="page-stack">
      <section className="page-hero-card stays-page-hero">
        <span className="section-kicker">MakaziPlus Stays</span>
        <h1>Find your stay in East Africa</h1>
        <p>Search by location, budget, lifestyle, and stay type. Built for apartments, villas, BnBs, hotels, and coastal travel.</p>
        <div className="page-search-row">
          <input
            value={filters.location}
            onChange={(event) => updateFilter('location', event.target.value)}
            placeholder="Where are you going? Zanzibar, Dar, Diani..."
          />
          <button type="button" className="btn btn-accent">Search</button>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Browse Faster</span>
            <h2>Filter by what matters</h2>
          </div>
        </div>
        <div className="filter-panel-grid">
          <div>
            <strong>Price</strong>
            <div className="filter-chip-row">
              {priceChips.map((chip) => (
                <button key={chip.value || 'all-price'} type="button" className={filters.priceTier === chip.value ? 'is-active' : ''} onClick={() => updateFilter('priceTier', chip.value)}>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <strong>Experience</strong>
            <div className="filter-chip-row">
              {experienceChips.map((chip) => (
                <button key={chip.value || 'all-experience'} type="button" className={filters.experience === chip.value ? 'is-active' : ''} onClick={() => updateFilter('experience', chip.value)}>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <strong>Stay type</strong>
            <div className="filter-chip-row">
              {typeChips.map((chip) => (
                <button key={chip.value || 'all-type'} type="button" className={filters.listingType === chip.value ? 'is-active' : ''} onClick={() => updateFilter('listingType', chip.value)}>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Available Stays</span>
            <h2>{isLoading ? 'Loading stays...' : `${stays.length} stays found`}</h2>
          </div>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : stays.length === 0 ? (
          <p>No stays found. Try a different location or filter.</p>
        ) : (
          <div className="grid grid-3">
            {stays.map((item) => <StayCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </div>
  )
}
