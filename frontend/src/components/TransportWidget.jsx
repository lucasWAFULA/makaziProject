import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const API_BASE = import.meta.env.VITE_API_URL || 'https://karibumakazi-api-dpifguofja-ew.a.run.app/api'

/**
 * Country-to-ISO mapping for common East African cities/regions
 * Used when property.country is not set but region/location hints at it.
 */
const LOCATION_COUNTRY_HINTS = {
  nairobi: 'KE', mombasa: 'KE', diani: 'KE', malindi: 'KE', kisumu: 'KE', nakuru: 'KE',
  'dar es salaam': 'TZ', zanzibar: 'TZ', arusha: 'TZ', mwanza: 'TZ', dodoma: 'TZ',
  kampala: 'UG', entebbe: 'UG', jinja: 'UG',
  kigali: 'RW', naivasha: 'KE', lamu: 'KE',
}

function detectCountry(property) {
  if (property?.country) return property.country.toUpperCase().slice(0, 2)
  const loc = `${property?.location || ''} ${property?.region || ''} ${property?.town || ''}`.toLowerCase()
  for (const [hint, code] of Object.entries(LOCATION_COUNTRY_HINTS)) {
    if (loc.includes(hint)) return code
  }
  return ''
}

function trackClick(partnerSlug, property) {
  try {
    fetch(`${API_BASE}/monetization/referral-click/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partner_slug: partnerSlug,
        property_id: property?.id,
        property_location: property?.location || '',
        country: detectCountry(property),
      }),
    }).catch(() => {}) // fire-and-forget
  } catch (_) {}
}

function PartnerButton({ partner, property, variant = 'pill' }) {
  const handleClick = () => {
    trackClick(partner.slug, property)
    window.open(partner.deep_link || partner.referral_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      className={`transport-partner-btn transport-partner-btn--${variant}`}
      style={{ '--partner-color': partner.color }}
      onClick={handleClick}
      aria-label={`${partner.name} — ${partner.tagline}`}
    >
      <span className="transport-partner-icon">{partner.icon}</span>
      <span className="transport-partner-info">
        <strong>{partner.name}</strong>
        {partner.tagline && <small>{partner.tagline}</small>}
      </span>
      <span className="transport-partner-arrow">→</span>
    </button>
  )
}

/**
 * TransportWidget — contextual ride/transfer options for a property.
 * Fetches live partners from the monetization API filtered by country.
 * Falls back to a minimal static set on error.
 */
export function TransportWidget({ property }) {
  const { t } = useTranslation()
  const [partners, setPartners] = useState(null)
  const [loading, setLoading] = useState(true)

  const country = detectCountry(property)
  const lat = property?.latitude || ''
  const lng = property?.longitude || ''
  const name = encodeURIComponent(property?.title_sw || property?.location || '')
  const address = encodeURIComponent(property?.location || '')

  useEffect(() => {
    if (!property) return
    const params = new URLSearchParams()
    if (country) params.set('country', country)
    if (lat) params.set('lat', lat)
    if (lng) params.set('lng', lng)
    if (name) params.set('name', name)
    if (address) params.set('address', address)

    fetch(`${API_BASE}/monetization/transport-partners/?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPartners(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        // Fallback static partners when API unavailable
        setPartners([
          {
            slug: 'uber', name: 'Uber', icon: '🚕', color: '#000',
            tagline: 'Reliable rides',
            deep_link: lat && lng
              ? `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${name}`
              : 'https://m.uber.com/ul/',
          },
          {
            slug: 'bolt', name: 'Bolt', icon: '⚡', color: '#34d186',
            tagline: 'Affordable rides',
            deep_link: 'https://bolt.eu/',
          },
          {
            slug: 'airport-whatsapp', name: 'Airport Pickup', icon: '✈️', color: '#0F5F5F',
            tagline: 'Pre-book via WhatsApp',
            deep_link: `https://wa.me/254725301031?text=Hello+MakaziPlus%2C+I+need+an+airport+transfer+to+${address}`,
          },
        ])
        setLoading(false)
      })
  }, [property?.id])

  if (!property || (!loading && !partners?.length)) return null

  // Split by type for visual grouping
  const rideHail = (partners || []).filter((p) => !['airport', 'local', 'shuttle', 'luxury'].includes(p.partner_type))
  const airportAndLocal = (partners || []).filter((p) => ['airport', 'local', 'shuttle', 'luxury'].includes(p.partner_type))

  return (
    <section className="card listing-section-card transport-widget" aria-labelledby="transport-widget-title">
      <div className="transport-widget-header">
        <h2 id="transport-widget-title">🗺️ Getting Around</h2>
        <p className="transport-widget-sub">
          Arrange transport to or from {property.town || property.location || 'this stay'}
        </p>
      </div>

      {loading ? (
        <div className="transport-skeleton-row">
          {[1, 2, 3].map((i) => (
            <span key={i} className="skeleton transport-skeleton-pill" />
          ))}
        </div>
      ) : (
        <>
          {rideHail.length > 0 && (
            <div className="transport-group">
              <span className="transport-group-label">Ride hailing</span>
              <div className="transport-partner-grid">
                {rideHail.map((p) => (
                  <PartnerButton key={p.slug} partner={p} property={property} />
                ))}
              </div>
            </div>
          )}

          {airportAndLocal.length > 0 && (
            <div className="transport-group">
              <span className="transport-group-label">Airport & local transfers</span>
              <div className="transport-partner-grid">
                {airportAndLocal.map((p) => (
                  <PartnerButton key={p.slug} partner={p} property={property} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <p className="transport-disclaimer">
        ℹ️ MakaziPlus may earn a referral fee from these providers at no extra cost to you.
      </p>
    </section>
  )
}
