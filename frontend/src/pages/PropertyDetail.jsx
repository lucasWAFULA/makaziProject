import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getProperty, getAvailability } from '../api/properties'
import { getPropertyReviews } from '../api/properties'
import { useAuth } from '../context/AuthContext'

function clampRating(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric) || !Number.isFinite(numeric)) return 0
  return Math.max(0, Math.min(5, numeric))
}

export function PropertyDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  })
  const { data: availability = [] } = useQuery({
    queryKey: ['availability', id],
    queryFn: () => getAvailability(id),
    enabled: !!id,
  })
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getPropertyReviews(id),
    enabled: !!id,
  })

  const imageUrls = useMemo(() => {
    if (!property) return []
    return Array.isArray(property.image_urls)
      ? property.image_urls
      : (Array.isArray(property.images) ? property.images.map((i) => i.image).filter(Boolean) : [])
  }, [property])
  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [reviews],
  )
  const avgRating = sortedReviews.length
    ? (sortedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / sortedReviews.length).toFixed(1)
    : null
  const roundedCounts = [1, 2, 3, 4, 5].reduce((acc, level) => ({ ...acc, [level]: 0 }), {})
  sortedReviews.forEach((review) => {
    const rounded = Math.round(clampRating(review.rating))
    if (rounded >= 1 && rounded <= 5) roundedCounts[rounded] = (roundedCounts[rounded] || 0) + 1
  })
  const topShare = sortedReviews.length
    ? Math.round(((roundedCounts[5] || 0) / sortedReviews.length) * 100)
    : 0
  const availableDates = availability.filter((a) => a.is_available)

  if (isLoading || !property) return <p>{t('loading')}</p>

  const price = Number(property.price_per_night || 0)
  const totalEstimate = price * 3
  const amenities = Array.isArray(property.amenities) ? property.amenities.filter(Boolean) : []
  const visibleAmenities = amenities.length ? amenities.slice(0, 8) : ['WiFi-ready', 'Security', 'Kitchen access', 'Local support']
  const listingTags = [
    property.price_tier ? `${String(property.price_tier).replace(/\b\w/g, (char) => char.toUpperCase())} stay` : 'Verified stay',
    ...(Array.isArray(property.experience_tags) ? property.experience_tags.slice(0, 2).map((tag) => String(tag).replace(/_/g, ' ')) : []),
  ]
  const whatsappMessage = encodeURIComponent(`Hello MakaziPlus.co, I am interested in ${property.title_sw} in ${property.location}.`)
  const whatsappLink = `https://wa.me/255700000111?text=${whatsappMessage}`

  return (
    <div className="listing-detail-page">
      <section className="listing-gallery-shell">
        <div className="listing-gallery-grid">
          <div className="listing-main-image">
            {imageUrls[0] ? <img src={imageUrls[0]} alt="" /> : <span>No image</span>}
          </div>
          <div className="listing-side-images">
            {imageUrls.slice(1, 5).map((url, i) => <img key={url || i} src={url} alt="" />)}
            {imageUrls.length <= 1 && <span className="listing-image-placeholder">More photos coming soon</span>}
          </div>
        </div>
        <div className="listing-floating-actions">
          <button type="button">♡ Save</button>
          <button type="button">Share</button>
        </div>
      </section>

      <section className="listing-detail-layout">
        <main className="listing-detail-main">
          <div className="listing-title-block">
            <div>
              <span className="section-kicker">Verified MakaziPlus stay</span>
              <h1>{property.title_sw}</h1>
              <p>📍 {property.location}</p>
            </div>
            <div className="listing-rating-pill">
              <strong>{avgRating || 'New'}</strong>
              <span>{sortedReviews.length ? `${sortedReviews.length} ${t('reviews')}` : 'No reviews yet'}</span>
            </div>
          </div>

          <div className="listing-tags">
            <span>Verified listing</span>
            <span>Secure payment</span>
            <span>WhatsApp support</span>
            {listingTags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <section className="card listing-section-card">
            <h2>About this stay</h2>
            <p>{property.description_sw || 'A MakaziPlus stay selected for comfort, location and local support.'}</p>
            <div className="property-facts-grid">
              <span>Entire stay</span>
              <span>{property.listing_type || 'Property'}</span>
              <span>{property.town || property.region || 'East Africa'}</span>
              <span>Local support</span>
            </div>
          </section>

          <section className="card listing-section-card">
            <h2>Amenities</h2>
            <div className="amenity-grid">
              {visibleAmenities.map((item) => <span key={item}>✓ {item}</span>)}
            </div>
          </section>

          <section className="card listing-section-card">
            <h2>Enhance your stay</h2>
            <div className="addon-grid">
              <Link to={`/taxi?destination=${encodeURIComponent(property.location || property.title_sw || '')}`}>
                <strong>🚕 Airport pickup</strong>
                <span>Book transfer to this stay</span>
              </Link>
              <Link to="/booking/beach-holiday-packages">
                <strong>🌍 Tours & experiences</strong>
                <span>Add local packages and activities</span>
              </Link>
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                <strong>💬 WhatsApp agent</strong>
                <span>Ask questions before booking</span>
              </a>
            </div>
          </section>

          <section className="card listing-section-card">
            <h2>{t('available_dates')}</h2>
            <div className="availability-pill-row">
              {availableDates.slice(0, 30).map((a) => (
                <span key={a.id}>{a.date}</span>
              ))}
              {availableDates.length === 0 && <p>{t('not_available')}</p>}
            </div>
          </section>

          <section className="card listing-section-card">
            <h2>Policies and trust</h2>
            <div className="trust-grid">
              <span>✓ No hidden fees shown by MakaziPlus</span>
              <span>✓ Verified listing checks</span>
              <span>✓ Customer support available</span>
              <span>✓ Contact agent before payment</span>
            </div>
            {property.rules_sw && <p className="listing-rules"><strong>{t('rules')}:</strong> {property.rules_sw}</p>}
          </section>

          <section className="card detail-review-card">
            <h2>{t('reviews')}</h2>
            {sortedReviews.length === 0 ? <p>{t('no_reviews_yet')}</p> : (
              <>
                <div className="review-summary">
                  <strong>{avgRating} / 5</strong>
                  <span>{sortedReviews.length} {t('reviews')}</span>
                </div>
                <article className="experience-analytics-card">
                  <div className="experience-analytics-head">
                    <strong>{t('experience_analytics_title')}</strong>
                    <span>{avgRating} / 5</span>
                  </div>
                  <div className="experience-metric-row">
                    <div>
                      <small>{t('experience_avg_label')}</small>
                      <strong>{avgRating}</strong>
                    </div>
                    <div>
                      <small>{t('experience_total_label')}</small>
                      <strong>{sortedReviews.length}</strong>
                    </div>
                    <div>
                      <small>{t('experience_top_label')}</small>
                      <strong>{topShare}%</strong>
                    </div>
                  </div>
                  <div className="experience-chart">
                    {[5, 4, 3, 2, 1].map((level) => {
                      const count = roundedCounts[level] || 0
                      const width = sortedReviews.length ? Math.max(10, Math.round((count / sortedReviews.length) * 100)) : 0
                      return (
                        <div key={`detail-row-${level}`} className="experience-bar-row">
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
                <ul className="review-list">
                  {sortedReviews.map((r) => (
                    <li key={r.id} className="review-item">
                      <div className="review-head">
                        <div className="review-rating-row">
                          <span className="review-stars" aria-hidden="true">
                            {'★★★★★'.slice(0, Math.round(clampRating(r.rating)))}
                            {'☆☆☆☆☆'.slice(0, 5 - Math.round(clampRating(r.rating)))}
                          </span>
                          <strong className="review-score-chip">{clampRating(r.rating).toFixed(1)} / 5</strong>
                        </div>
                        {r.created_at && <span>{new Date(r.created_at).toLocaleDateString()}</span>}
                      </div>
                      <p>{r.comment_sw || t('no_comment')}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </main>

        <aside className="booking-panel">
          <div className="booking-panel-card">
            <span>{t('price_per_night')}</span>
            <strong>TZS {price.toLocaleString()}</strong>
            <p>TZS {totalEstimate.toLocaleString()} total estimate for 3 nights</p>
            <div className="booking-mini-grid">
              <span>Check-in</span>
              <span>Check-out</span>
              <em>Choose dates on next step</em>
            </div>
            {user ? (
              <Link to={`/book/${id}`} className="btn btn-accent booking-reserve-btn">Reserve</Link>
            ) : (
              <Link to="/login" className="btn btn-accent booking-reserve-btn">{t('login')} to reserve</Link>
            )}
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-secondary booking-whatsapp-btn">
              Chat with agent
            </a>
            <div className="booking-panel-trust">
              <span>✓ Verified listing</span>
              <span>✓ No hidden fees</span>
              <span>✓ Local MakaziPlus support</span>
            </div>
          </div>
        </aside>
      </section>

      <div className="mobile-booking-bar">
        <span>TZS {price.toLocaleString()} / night</span>
        {user ? <Link to={`/book/${id}`} className="btn btn-accent btn-sm">Reserve</Link> : <Link to="/login" className="btn btn-accent btn-sm">{t('login')}</Link>}
      </div>
    </div>
  )
}
