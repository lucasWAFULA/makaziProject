import { useMemo, useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getProperty, getAvailability } from '../api/properties'
import { getPropertyReviews } from '../api/properties'
import { useAuth } from '../context/AuthContext'
import { TransportWidget } from '../components/TransportWidget'
import { PlusServices } from '../components/PlusServices'
import { PriceDisplay } from '../components/PriceDisplay'
import { useCurrency } from '../context/CurrencyContext'
import { CalendarWidget } from '../components/CalendarWidget'

function clampRating(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric) || !Number.isFinite(numeric)) return 0
  return Math.max(0, Math.min(5, numeric))
}

export function PropertyDetail() {
  const { id: rawId } = useParams()
  const id = useMemo(() => {
    if (!rawId) return null
    // If the URL is /property/123-slug, the ID is 123
    return rawId.split('-')[0]
  }, [rawId])
  const { t } = useTranslation()
  const { user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showTopNav, setShowTopNav] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky nav when scrolled past hero (approx 400px)
      if (window.scrollY > 400) {
        setShowTopNav(true)
      } else {
        setShowTopNav(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
  const baseCurrency = property.base_currency || 'KES'
  const amenities = Array.isArray(property.amenities) ? property.amenities.filter(Boolean) : []
  const visibleAmenities = amenities.length ? amenities.slice(0, 8) : ['WiFi-ready', 'Security', 'Kitchen access', 'Local support']
  const verificationTier = String(property.verification_tier || '').toLowerCase()
  const verificationLabel = verificationTier === 'premium_verified'
    ? t('premium_verified')
    : verificationTier === 'remote_verified'
      ? t('makazi_verified')
      : verificationTier === 'unverified'
        ? t('unverified')
        : ''
  const listingTags = [
    property.price_tier ? `${String(property.price_tier).replace(/\b\w/g, (char) => char.toUpperCase())} stay` : t('verified_stay'),
    ...(Array.isArray(property.experience_tags) ? property.experience_tags.slice(0, 2).map((tag) => String(tag).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())) : []),
  ]
  const whatsappMessage = encodeURIComponent(`Hello MakaziPlus, I am interested in ${property.title_sw} in ${property.location}.`)
  const whatsappLink = `https://wa.me/254725301031?text=${whatsappMessage}`

  // ── Gallery image fallbacks ────────────────────────────────────────────────
  const CATEGORY_FALLBACKS = {
    villa: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=900&q=75',
    apartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=75',
    bnb: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=75',
    hotel: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=75',
    'guest-house': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=75',
    resort: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=75',
    lodge: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=75',
    'serviced-apartment': 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=900&q=75',
    'vacation-home': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=75',
    'beach-house': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=75',
    'safari-camp': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=75',
  }
  const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=75'
  const galleryFallback = (
    CATEGORY_FALLBACKS[property.category_detail?.slug]
    || CATEGORY_FALLBACKS[property.listing_type]
    || DEFAULT_FALLBACK
  )

  return (
    <div className="listing-detail-page">
      {/* Sticky Top Nav Bar */}
      <div className={`property-top-nav ${showTopNav ? 'visible' : ''}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#fff',
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '0.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transform: showTopNav ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
        visibility: showTopNav ? 'visible' : 'hidden'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', fontWeight: '600' }}>
          <a href="#amenities" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Amenities</a>
          <a href="#calendar" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Availability</a>
          <a href="#reviews" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Reviews</a>
          <a href="#location" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Location</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <PriceDisplay amount={price} baseCurrency={baseCurrency} suffix={` / ${t('night', 'night')}`} />
          {user ? (
            <Link to={`/book/${id}`} className="btn btn-accent btn-sm">Reserve</Link>
          ) : (
            <Link to="/login" className="btn btn-accent btn-sm">{t('login')}</Link>
          )}
        </div>
      </div>

      <section className="listing-gallery-shell">
        <div className="listing-gallery-grid">
          <div className="listing-main-image">
            <img src={imageUrls[0] || galleryFallback} alt={property.title_sw || 'Property'} />
          </div>
          <div className="listing-side-images">
            {imageUrls.slice(1, 5).map((url, i) => <img key={url || i} src={url} alt="" />)}
            {imageUrls.length <= 1 && (
              <>
                <img src={galleryFallback} alt="" className="gallery-fallback-tile" />
                <img src={galleryFallback} alt="" className="gallery-fallback-tile" />
              </>
            )}
          </div>
        </div>
        <div className="listing-floating-actions" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsSaved(!isSaved)}
            style={{ background: isSaved ? '#ffed4a' : 'white', color: 'black', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          >
            {isSaved ? `♥ ${t('save_btn')}` : `♡ ${t('save_btn')}`}
          </button>

          <div style={{ position: 'relative' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowShareMenu(!showShareMenu)}
              style={{ background: 'white', color: 'black', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              {t('share_btn')}
            </button>
            {showShareMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', width: 'max-content', zIndex: 20 }}>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: '#1877F2', fontWeight: 'bold' }}>Facebook</a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(property.title_sw)}`} target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: '#1DA1F2', fontWeight: 'bold' }}>X (Twitter)</a>
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(property.title_sw + ' ' + window.location.href)}`} target="_blank" rel="noreferrer" style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: '#25D366', fontWeight: 'bold' }}>WhatsApp</a>
                <button type="button" onClick={() => { navigator.clipboard.writeText(window.location.href); alert(t('link_copied')); setShowShareMenu(false); }} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold' }}>Copy Link</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="listing-detail-layout">
        <main className="listing-detail-main">
          <div className="listing-title-block">
            <div>
              <span className="section-kicker">{verificationLabel ? `${verificationLabel}` : 'MakaziPlus stay'}</span>
              <h1>{property.title_sw}</h1>
              <p>📍 {property.location}</p>
            </div>
            <div className="listing-rating-pill">
              <strong>{avgRating || 'New'}</strong>
              <span>{sortedReviews.length ? `${sortedReviews.length} ${t('reviews')}` : 'No reviews yet'}</span>
            </div>
          </div>

          <div className="listing-tags">
            {verificationLabel && <span>{verificationLabel}</span>}
            <span>{t('secure_payment')}</span>
            <span>{t('whatsapp_support')}</span>
            {listingTags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <section className="card listing-section-card">
            <h2>{t('verification_title')}</h2>
            {verificationTier === 'premium_verified' && (
              <p>{t('verification_premium_desc')}</p>
            )}
            {verificationTier === 'remote_verified' && (
              <p>{t('verification_remote_desc')}</p>
            )}
            {verificationTier === 'unverified' && (
              <p>{t('verification_unverified_desc')}</p>
            )}
            {!verificationTier && <p>{t('verification_unavailable')}</p>}
          </section>

          <section className="card listing-section-card">
            <h2>{t('about_stay')}</h2>
            <p>{property.description_sw || t('default_stay_desc')}</p>
            <div className="property-facts-grid">
              <span>{t('entire_stay')}</span>
              <span>{property.listing_type || t('property')}</span>
              <span>{property.town || property.region || t('east_africa')}</span>
              <span>{t('local_support')}</span>
            </div>
          </section>

          <section id="amenities" className="card listing-section-card">
            <h2>Amenities</h2>
            <div className="amenity-grid">
              {visibleAmenities.map((item) => <span key={item}>✓ {item}</span>)}
            </div>
          </section>

          <TransportWidget property={property} />
          <PlusServices propertyId={id} location={property.town || property.region} />

          <section className="card listing-section-card">
            <h2>Tours &amp; experiences</h2>
            <div className="addon-grid">
              <Link to="/booking/beach-holiday-packages">
                <strong>🌍 Beach &amp; coastal tours</strong>
                <span>Snorkelling, dhow safaris, sunset cruises</span>
              </Link>
              <Link to="/booking/family-vacation-packages">
                <strong>👨‍👩‍👧 Family packages</strong>
                <span>Kid-friendly activities and day trips</span>
              </Link>
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                <strong>💬 Custom experience</strong>
                <span>Tell us what you want — we'll arrange it</span>
              </a>
            </div>
          </section>

          <section id="calendar" className="card listing-section-card">
            <h2>{t('available_dates', 'Select dates')}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Minimum stay: 1 night</p>
            <CalendarWidget availableDates={availableDates} />
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

          <section id="reviews" className="card detail-review-card">
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

          <section id="location" className="card listing-section-card" style={{ marginBottom: '2rem' }}>
            <h2>{t('location', 'Where you\'ll be')}</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{property.location}</p>
            <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <iframe 
                title="Property Location Map"
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=39.0,-7.0,40.0,-6.0&layer=mapnik&marker=${property.latitude || '-6.1659'},${property.longitude || '39.2026'}`} 
                style={{ border: 'none' }}
              />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Exact location provided after booking.</p>
          </section>
        </main>

        <aside className="booking-panel">
          <div className="booking-panel-card">
            <span>{t('price_per_night')}</span>
            <PriceDisplay amount={price} baseCurrency={baseCurrency} className="booking-price-lg" />
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
        <PriceDisplay amount={price} baseCurrency={baseCurrency} suffix="/ night" />
        {user ? <Link to={`/book/${id}`} className="btn btn-accent btn-sm">Reserve</Link> : <Link to="/login" className="btn btn-accent btn-sm">{t('login')}</Link>}
      </div>
    </div>
  )
}
