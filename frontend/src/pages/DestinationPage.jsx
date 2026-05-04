import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDestinationBySlug } from '../api/destinations'
import { getProperties } from '../api/properties'

const destinationGuides = {
  zanzibar: {
    eyebrow: 'Island stays',
    title: 'Stay in Zanzibar',
    subtitle: 'Beachfront, culture, kite-surfing and island experiences.',
    areas: [
      { title: 'Stone Town', label: 'Culture + history', copy: 'Walk to old Arabic-Swahili architecture, carved doors, markets and waterfront sunsets.' },
      { title: 'Nungwi & Kendwa', label: 'Beach + nightlife', copy: 'Clear turquoise water, swimmable beaches and premium resort energy for couples and tourists.' },
      { title: 'Paje', label: 'Young + active', copy: 'Kite surfing, cafes and digital nomad stays with more budget-friendly options.' },
      { title: 'Jambiani', label: 'Quiet + authentic', copy: 'Peaceful village feel, relaxed long stays and less crowded beaches.' },
    ],
    highlights: ['Beachfront apartments', 'Kite-surfing beaches', 'Cultural Stone Town stays', 'Luxury ocean-view villas'],
  },
  'dar-es-salaam': {
    eyebrow: 'Coastal city stays',
    title: 'Stay in Dar es Salaam',
    subtitle: 'Business-ready apartments, premium coastal zones and affordable long stays.',
    areas: [
      { title: 'Masaki & Oyster Bay', label: 'Premium zone', copy: 'Restaurants, embassies, nightlife and ocean access for business travelers and expats.' },
      { title: 'Msasani Peninsula', label: 'Residential + leisure', copy: 'A strong balance of city access, beach access and comfortable mid to high-end living.' },
      { title: 'Mikocheni / Kinondoni', label: 'Affordable urban', copy: 'Practical city stays for long visits, work trips and budget-conscious travelers.' },
      { title: 'Kigamboni', label: 'Quiet coastal escape', copy: 'Beachside living away from city noise, with growing development and calm surroundings.' },
    ],
    highlights: ['Business-ready apartments', 'Near restaurants and embassies', 'Affordable long-stay apartments', 'Quiet coastal escapes'],
  },
}

const normalizeSlug = (value) => String(value || '').toLowerCase().replace(/_/g, '-')

function resolveGuide(slug, destination) {
  const key = normalizeSlug(slug)
  const name = normalizeSlug(destination?.destination_name)
  if (key.includes('zanzibar') || name.includes('zanzibar')) return destinationGuides.zanzibar
  if (key.includes('dar') || name.includes('dar')) return destinationGuides['dar-es-salaam']
  return null
}

const toTitle = (value) => String(value || '')
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ')

export function DestinationPage() {
  const { slug } = useParams()
  const preliminaryGuide = resolveGuide(slug)
  const fallbackDestination = preliminaryGuide ? {
    destination_name: preliminaryGuide.title.replace('Stay in ', ''),
    country: preliminaryGuide === destinationGuides.zanzibar ? 'Tanzania' : 'Tanzania',
    region: toTitle(slug),
    destination_type: 'Coastal destination',
    tourism_category: 'Stays and experiences',
  } : null

  const { data: destination, isLoading: destinationLoading } = useQuery({
    queryKey: ['destination', slug],
    queryFn: () => getDestinationBySlug(slug),
    enabled: !!slug,
  })
  const activeDestination = destination || fallbackDestination

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['destination-properties', slug],
    queryFn: () => getProperties({
      country: activeDestination?.country,
      region: activeDestination?.region,
      town: activeDestination?.destination_name,
    }),
    enabled: !!activeDestination,
  })

  if (destinationLoading && !activeDestination) {
    return <p>Loading destination...</p>
  }

  if (!activeDestination) {
    return (
      <section className="card section-card">
        <h2>Destination not found</h2>
        <Link to="/" className="btn btn-primary btn-sm">Back home</Link>
      </section>
    )
  }

  const guide = activeDestination.guide || resolveGuide(slug, activeDestination)

  return (
    <div className="destination-page-stack">
      <section className="card section-card destination-hero-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{guide?.eyebrow || 'Destination stays'}</span>
            <h2>{guide?.title || activeDestination.destination_name}</h2>
            <p>{guide?.subtitle || `${activeDestination.region} stays, local access and bookable listings.`}</p>
          </div>
          <span className="section-tag">{activeDestination.country}</span>
        </div>
        <p className="property-card-meta">
          {activeDestination.region} • {activeDestination.destination_type} • {activeDestination.tourism_category}
        </p>
        {guide && (
          <>
            <div className="destination-area-grid">
              {guide.areas.map((area) => (
                <article key={area.title} className="destination-area-card">
                  <span>{area.label}</span>
                  <strong>{area.title}</strong>
                  <p>{area.copy}</p>
                </article>
              ))}
            </div>
            <div className="destination-highlight-row">
              {guide.highlights.map((item) => <span key={item}>{item}</span>)}
            </div>
          </>
        )}
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Available Stays</span>
            <h2>Bookable properties in {activeDestination.destination_name}</h2>
          </div>
        </div>
        {propertiesLoading ? (
          <p>Loading stays...</p>
        ) : properties.length === 0 ? (
          <p>No active stays yet for this destination.</p>
        ) : (
          <div className="grid grid-3">
            {properties.map((item) => (
              <article key={item.id} className="premium-listing-card">
                <div className="premium-listing-media">
                  {item.first_image ? <img src={item.first_image} alt="" loading="lazy" /> : <span className="no-image" />}
                </div>
                <div className="premium-listing-body">
                  <strong>{item.title_sw}</strong>
                  <p className="property-card-meta">{item.location}</p>
                  <div className="listing-tags">
                    <span>WiFi-ready</span>
                    <span>{item.listing_type || 'Stay'}</span>
                  </div>
                  <div className="listing-card-footer">
                    <b>TZS {Number(item.price_per_night).toLocaleString()}</b>
                    <Link to={`/property/${item.id}`} className="btn btn-secondary btn-sm">View details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
