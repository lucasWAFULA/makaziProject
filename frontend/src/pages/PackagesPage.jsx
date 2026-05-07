import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPackages } from '../api/packages'

const fallbackPackages = [
  {
    id: 'airport-pickup-stay',
    name: 'Airport Pickup + Stay',
    package_type: 'airport-pickup-stay',
    duration_label: '2-3 nights',
    includes: 'Stay • Airport transfer • Local support',
    price_from: 'From TZS 180,000',
  },
  {
    id: 'beach-holiday-packages',
    name: 'Beach Holiday Package',
    package_type: 'beach-holiday-packages',
    duration_label: '3-5 nights',
    includes: 'Beach stay • Taxi transfer • Tour options',
    price_from: 'From TZS 320,000',
  },
  {
    id: 'executive-business-stay',
    name: 'Executive Business Stay',
    package_type: 'executive-business-stay',
    duration_label: 'Flexible',
    includes: 'Apartment • Airport pickup • WiFi/workspace support',
    price_from: 'From TZS 250,000',
  },
]

export function PackagesPage() {
  const { data: packageData = [], isLoading } = useQuery({
    queryKey: ['packages-page'],
    queryFn: () => getPackages(),
  })
  const packages = packageData.length ? packageData : fallbackPackages

  return (
    <div className="page-stack">
      <section className="page-hero-card packages-page-hero">
        <span className="section-kicker">Stay + Taxi + Tours</span>
        <h1>Plan your full trip with MakaziPlus</h1>
        <p>Bundle accommodation, airport pickup, local transfers, and curated experiences across Kenya and Tanzania.</p>
        <div className="hero-actions">
          <Link to="/stays" className="btn btn-accent">Find stays</Link>
          <Link to="/taxi" className="btn btn-secondary">Book taxi</Link>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading package-premium-head">
          <div>
            <span className="section-kicker">Curated Packages</span>
            <h2>{isLoading ? 'Loading packages...' : 'Choose a trip bundle'}</h2>
            <p>Simple combinations designed for airport arrivals, beach holidays, families, honeymooners, weekends, and business trips.</p>
          </div>
        </div>
        <div className="grid grid-3 package-premium-grid">
          {packages.map((item) => (
            <article key={item.id || item.package_type || item.name} className="package-premium-card">
              <div className="package-premium-media">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=75" alt="" loading="lazy" />
                <span className="package-premium-tag">MakaziPlus bundle</span>
              </div>
              <div className="package-premium-body">
                <div className="package-premium-title-row">
                  <strong>{item.name}</strong>
                  <span>{item.duration_label || 'Flexible'}</span>
                </div>
                <p className="property-card-meta">{item.includes}</p>
                <div className="package-premium-footer">
                  <div>
                    <small>Price from</small>
                    <strong>{String(item.price_from || 'Ask agent')}</strong>
                    <p>Stay, transfers and support</p>
                  </div>
                  <Link to={`/booking/${item.package_type || item.id}`} className="btn btn-primary btn-sm package-book-btn">View package</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
