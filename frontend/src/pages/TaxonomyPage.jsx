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

export function TaxonomyPage() {
  const { type, slug } = useParams()
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
      {isLoading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No results available yet.</p>
      ) : (
        <div className="grid grid-3">
          {type === 'stays' && data.map((item) => (
            <article key={item.id} className="review-card">
              <strong>{item.title_sw}</strong>
              <p className="property-card-meta">{item.location}</p>
              <p>TZS {Number(item.price_per_night).toLocaleString()}</p>
              <Link to={`/property/${item.id}`} className="btn btn-secondary btn-sm">View details</Link>
            </article>
          ))}
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
