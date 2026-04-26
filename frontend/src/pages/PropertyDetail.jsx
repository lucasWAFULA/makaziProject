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

  if (isLoading || !property) return <p>{t('loading')}</p>

  const imageUrls = property.image_urls?.length ? property.image_urls : (property.images?.length ? property.images.map((i) => i.image) : [])
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

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem', background: '#f8f9fa' }}>
          {imageUrls.map((url, i) => (
            <img key={i} src={url} alt="" style={{ height: 200, width: 280, objectFit: 'cover', borderRadius: 8 }} />
          ))}
          {imageUrls.length === 0 && <div style={{ height: 200, width: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No image</div>}
        </div>
        <div style={{ padding: '1rem' }}>
          <h1 style={{ marginTop: 0 }}>{property.title_sw}</h1>
          <p style={{ color: '#666' }}>{property.location}</p>
          <p><strong>{t('price_per_night')}:</strong> TZS {Number(property.price_per_night).toLocaleString()}</p>
          <p>{property.description_sw}</p>
          {property.rules_sw && <p><strong>{t('rules')}:</strong> {property.rules_sw}</p>}
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <h3>{t('available_dates')}</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {availability.filter((a) => a.is_available).slice(0, 30).map((a) => (
            <span key={a.id} style={{ padding: '0.25rem 0.5rem', background: '#e7f5ff', borderRadius: 4, fontSize: '0.875rem' }}>{a.date}</span>
          ))}
          {availability.filter((a) => a.is_available).length === 0 && <p>{t('not_available')}</p>}
        </div>
      </div>

      {user && (
        <div className="detail-cta-row">
          <Link to={`/book/${id}`} className="btn btn-primary">{t('book_now')}</Link>
          <Link to={`/taxi?destination=${encodeURIComponent(property.location || property.title_sw || '')}`} className="btn btn-accent">
            {t('book_taxi_now')}
          </Link>
        </div>
      )}
      {!user && <p><Link to="/login">{t('login')}</Link> {t('book_now')}</p>}

      <div className="card detail-review-card">
        <h3>{t('reviews')}</h3>
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
      </div>
    </div>
  )
}
