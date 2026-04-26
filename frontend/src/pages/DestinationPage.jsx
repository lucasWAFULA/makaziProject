import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDestinationBySlug } from '../api/destinations'
import { getProperties } from '../api/properties'

export function DestinationPage() {
  const { slug } = useParams()
  const { data: destination, isLoading: destinationLoading } = useQuery({
    queryKey: ['destination', slug],
    queryFn: () => getDestinationBySlug(slug),
    enabled: !!slug,
  })

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['destination-properties', slug],
    queryFn: () => getProperties({
      country: destination?.country,
      region: destination?.region,
      town: destination?.destination_name,
    }),
    enabled: !!destination,
  })

  if (destinationLoading || !destination) {
    return <p>Loading destination...</p>
  }

  return (
    <section className="card section-card">
      <div className="section-heading">
        <h2>{destination.destination_name}</h2>
        <span className="section-tag">{destination.country}</span>
      </div>
      <p className="property-card-meta">
        {destination.region} • {destination.destination_type} • {destination.tourism_category}
      </p>
      {propertiesLoading ? (
        <p>Loading stays...</p>
      ) : properties.length === 0 ? (
        <p>No active stays yet for this destination.</p>
      ) : (
        <div className="grid grid-3">
          {properties.map((item) => (
            <article key={item.id} className="review-card">
              <strong>{item.title_sw}</strong>
              <p className="property-card-meta">{item.location}</p>
              <p>TZS {Number(item.price_per_night).toLocaleString()}</p>
              <div className="property-card-actions">
                <Link to={`/property/${item.id}`} className="btn btn-secondary btn-sm">View details</Link>
                <Link to={`/book/${item.id}`} className="btn btn-primary btn-sm">Book now</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
