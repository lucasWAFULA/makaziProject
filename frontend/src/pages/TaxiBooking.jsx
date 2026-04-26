import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { createTaxiBooking, getMyTaxiBookings, getTransportPartners, getTransportRoutes } from '../api/taxi'

const vehicleOptions = [
  { value: 'sedan', labelKey: 'taxi_vehicle_sedan', multiplier: 1, metaKey: 'taxi_vehicle_sedan_meta' },
  { value: 'suv', labelKey: 'taxi_vehicle_suv', multiplier: 1.25, metaKey: 'taxi_vehicle_suv_meta' },
  { value: 'van', labelKey: 'taxi_vehicle_van', multiplier: 1.45, metaKey: 'taxi_vehicle_van_meta' },
  { value: 'luxury', labelKey: 'taxi_vehicle_luxury', multiplier: 1.85, metaKey: 'taxi_vehicle_luxury_meta' },
  { value: 'airport_shuttle', labelKey: 'taxi_vehicle_airport_shuttle', multiplier: 1.15, metaKey: 'taxi_vehicle_airport_shuttle_meta' },
]

const fallbackRoutes = [
  {
    pickup: 'Mombasa SGR Terminus',
    destination: 'Diani',
    time: '2-3 hrs',
    currency: 'KES',
    min: 6000,
    max: 10000,
  },
  {
    pickup: 'Moi International Airport',
    destination: 'Nyali',
    time: '20-35 mins',
    currency: 'KES',
    min: 1200,
    max: 2500,
  },
  {
    pickup: 'Mombasa CBD',
    destination: 'Watamu',
    time: '2-2.5 hrs',
    currency: 'KES',
    min: 8000,
    max: 14000,
  },
  {
    pickup: 'Zanzibar Airport',
    destination: 'Nungwi',
    time: '1.5-2 hrs',
    currency: 'USD',
    min: 35,
    max: 70,
  },
]

const formatMoney = (value, currency = 'KES') => {
  if (!value) return `${currency} 0`
  return `${currency} ${Number(value).toLocaleString()}`
}

const normalizeText = (value) => (value || '').trim().toLowerCase()

const serviceTypeKey = (serviceType) => {
  const key = serviceType || 'private_transfer'
  return `taxi_service_${key}`
}

const buildWhatsAppLink = (phone, form, t) => {
  const cleanPhone = (phone || '').replace(/[^\d]/g, '')
  const message = encodeURIComponent(
    `${t('taxi_partner_message')} ${form.pickup || t('pickup_point')} ${t('taxi_partner_message_to')} ${form.destination || t('destination')}.`
  )
  return `https://wa.me/${cleanPhone || '254700000000'}?text=${message}`
}

export function TaxiBooking() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const destinationPrefill = searchParams.get('destination') || ''

  const [form, setForm] = useState({
    pickup: '',
    destination: destinationPrefill,
    travelDate: '',
    pickupTime: '',
    passengers: 1,
    phone: user?.phone_number || '',
    vehicleType: 'sedan',
    luggage: 0,
    returnTrip: false,
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedBooking, setSavedBooking] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')
  const [pickupCoords, setPickupCoords] = useState(null)

  const { data: myTaxiBookings = [] } = useQuery({
    queryKey: ['taxi-my-bookings'],
    queryFn: getMyTaxiBookings,
    enabled: !!user,
  })

  const { data: transportRoutes = [] } = useQuery({
    queryKey: ['transport-routes-featured'],
    queryFn: () => getTransportRoutes({ featured: 'true' }),
  })

  const { data: transportPartners = [] } = useQuery({
    queryKey: ['transport-partners-featured'],
    queryFn: () => getTransportPartners({ featured: 'true' }),
  })

  const routePresets = useMemo(() => {
    const backendRoutes = transportRoutes.slice(0, 8).map((route) => ({
      pickup: route.origin,
      destination: route.destination,
      time: route.estimated_time,
      currency: route.currency,
      min: Number(route.price_min || 0),
      max: Number(route.price_max || 0),
      category: route.route_category,
    }))
    return backendRoutes.length ? backendRoutes : fallbackRoutes
  }, [transportRoutes])

  const locationSuggestions = useMemo(() => {
    const values = new Set()
    routePresets.forEach((route) => {
      values.add(route.pickup)
      values.add(route.destination)
    })
    ;[
      'Moi International Airport',
      'Mombasa SGR Terminus',
      'Diani Beach Road',
      'Nyali',
      'Watamu',
      'Malindi',
      'Zanzibar Airport',
      'Stone Town',
      'Nungwi',
      'Paje',
    ].forEach((item) => values.add(item))
    return Array.from(values).filter(Boolean)
  }, [routePresets])

  const matchedRoute = useMemo(() => {
    const pickup = normalizeText(form.pickup)
    const destination = normalizeText(form.destination)
    if (!pickup || !destination) return null

    return routePresets.find((route) => {
      const origin = normalizeText(route.pickup)
      const dropoff = normalizeText(route.destination)
      return (
        (pickup.includes(origin) || origin.includes(pickup)) &&
        (destination.includes(dropoff) || dropoff.includes(destination))
      )
    })
  }, [form.destination, form.pickup, routePresets])

  const estimate = useMemo(() => {
    if (!form.pickup || !form.destination) return null
    const vehicle = vehicleOptions.find((item) => item.value === form.vehicleType) || vehicleOptions[0]
    const baseMin = matchedRoute?.min || 2500
    const baseMax = matchedRoute?.max || 5500
    const luggageFee = Number(form.luggage || 0) * 150
    const passengerFee = Math.max(Number(form.passengers || 1) - 3, 0) * 350
    const min = Math.round(baseMin * vehicle.multiplier + luggageFee + passengerFee)
    const max = Math.round(baseMax * vehicle.multiplier + luggageFee + passengerFee)
    return {
      min,
      max,
      average: Math.round((min + max) / 2),
      currency: matchedRoute?.currency || 'KES',
      time: matchedRoute?.time || t('taxi_confirm_with_driver'),
      distance: matchedRoute ? t('taxi_known_route') : t('taxi_route_pending'),
    }
  }, [form.destination, form.luggage, form.passengers, form.pickup, form.vehicleType, matchedRoute, t])

  const summary = useMemo(() => {
    if (!submitted) return null
    return `${form.pickup} → ${form.destination} • ${form.travelDate || '-'} ${form.pickupTime || ''}`
  }, [submitted, form])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onCheckboxChange = (event) => {
    const { name, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: checked }))
  }

  const applyRoutePreset = (route) => {
    setForm((prev) => ({
      ...prev,
      pickup: route.pickup,
      destination: route.destination,
      vehicleType: route.category?.toLowerCase().includes('airport') ? 'airport_shuttle' : prev.vehicleType,
    }))
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t('taxi_geolocation_unavailable'))
      return
    }

    setLocationStatus(t('taxi_detecting_location'))
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setPickupCoords({ latitude, longitude })
        setForm((prev) => ({
          ...prev,
          pickup: `Current location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        }))
        setLocationStatus(t('taxi_location_detected'))
      },
      () => {
        setLocationStatus(t('taxi_location_failed'))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = (event) => {
    event.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)
    const notes = [
      form.notes,
      form.luggage ? `${t('taxi_luggage_count')}: ${form.luggage}` : '',
      estimate ? `${t('taxi_trip_estimate')}: ${formatMoney(estimate.min, estimate.currency)} - ${formatMoney(estimate.max, estimate.currency)}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    createTaxiBooking({
      pickup: form.pickup,
      destination: form.destination,
      travel_date: form.travelDate,
      pickup_time: form.pickupTime,
      passengers: Number(form.passengers || 1),
      phone_number: form.phone,
      notes,
      vehicle_type: form.vehicleType,
      return_trip: form.returnTrip,
      estimated_price: estimate?.average || 0,
    })
      .then((payload) => {
        setSavedBooking(payload)
        setSubmitted(true)
      })
      .catch((error) => {
        setSubmitted(false)
        const detail = error?.response?.data?.detail
        setSubmitError(detail || t('error'))
      })
      .finally(() => setIsSubmitting(false))
  }

  const uberLink = useMemo(() => {
    if (!pickupCoords) return 'https://m.uber.com/'
    const params = new URLSearchParams({
      action: 'setPickup',
      'pickup[latitude]': pickupCoords.latitude,
      'pickup[longitude]': pickupCoords.longitude,
      'dropoff[nickname]': form.destination || t('destination'),
    })
    return `https://m.uber.com/ul/?${params.toString()}`
  }, [form.destination, pickupCoords, t])

  return (
    <div className="grid taxi-page taxi-page-premium">
      <section className="card taxi-hero-card taxi-hero-premium">
        <div>
          <span className="taxi-kicker">{t('taxi_mobility_kicker')}</span>
          <h1>{t('taxi_booking')}</h1>
          <p>{t('taxi_intro')}</p>
        </div>
        <div className="taxi-badges">
          <span>{t('taxi_badge_fast')}</span>
          <span>{t('taxi_badge_safe')}</span>
          <span>{t('taxi_badge_anytime')}</span>
        </div>
      </section>

      <section className="card taxi-form-card taxi-booking-shell">
        <div className="taxi-form-heading">
          <div>
            <span className="taxi-kicker">{t('taxi_private_transfer')}</span>
            <h2>{t('book_taxi_now')}</h2>
            <p>{t('taxi_form_subtitle')}</p>
          </div>
          <button type="button" className="btn taxi-location-btn" onClick={useCurrentLocation}>
            {t('taxi_use_current_location')}
          </button>
        </div>
        {locationStatus && <p className="taxi-location-status">{locationStatus}</p>}

        <form onSubmit={onSubmit}>
          <datalist id="taxi-location-suggestions">
            {locationSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>

          <div className="taxi-route-panel">
            <div className="form-group taxi-field">
              <label>{t('pickup_point')}</label>
              <input
                name="pickup"
                value={form.pickup}
                onChange={onChange}
                list="taxi-location-suggestions"
                placeholder={t('taxi_pickup_placeholder')}
                required
              />
            </div>
            <div className="form-group taxi-field">
              <label>{t('destination')}</label>
              <input
                name="destination"
                value={form.destination}
                onChange={onChange}
                list="taxi-location-suggestions"
                placeholder={t('taxi_destination_placeholder')}
                required
              />
            </div>
          </div>

          <div className="taxi-quick-routes">
            <strong>{t('taxi_popular_routes')}</strong>
            <div>
              {routePresets.slice(0, 4).map((route) => (
                <button key={`${route.pickup}-${route.destination}`} type="button" onClick={() => applyRoutePreset(route)}>
                  {route.pickup} → {route.destination}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-2 taxi-details-grid">
            <div className="form-group taxi-field">
              <label>{t('travel_date')}</label>
              <input type="date" name="travelDate" value={form.travelDate} onChange={onChange} required />
            </div>
            <div className="form-group taxi-field">
              <label>{t('pickup_time')}</label>
              <input type="time" name="pickupTime" value={form.pickupTime} onChange={onChange} required />
            </div>
            <div className="form-group taxi-field">
              <label>{t('taxi_passengers')}</label>
              <input
                type="number"
                min="1"
                max="20"
                name="passengers"
                value={form.passengers}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group taxi-field">
              <label>{t('phone_number')}</label>
              <input name="phone" value={form.phone} onChange={onChange} required />
            </div>
            <div className="form-group taxi-field">
              <label>{t('taxi_vehicle_type')}</label>
              <select name="vehicleType" value={form.vehicleType} onChange={onChange}>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.value} value={vehicle.value}>
                    {t(vehicle.labelKey)} - {t(vehicle.metaKey)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group taxi-field">
              <label>{t('taxi_luggage_count')}</label>
              <input type="number" min="0" max="20" name="luggage" value={form.luggage} onChange={onChange} />
            </div>
          </div>

          <div className="taxi-estimate-grid">
            <article className="taxi-estimate-card">
              <span>{t('taxi_trip_estimate')}</span>
              <strong>
                {estimate
                  ? `${formatMoney(estimate.min, estimate.currency)} - ${formatMoney(estimate.max, estimate.currency)}`
                  : t('taxi_enter_locations')}
              </strong>
              <p>{estimate ? `${estimate.distance} • ${estimate.time}` : t('taxi_estimate_hint')}</p>
            </article>
            {vehicleOptions.slice(0, 3).map((vehicle) => {
              const base = estimate || { min: 0, max: 0, currency: 'KES' }
              return (
                <article key={vehicle.value} className={form.vehicleType === vehicle.value ? 'taxi-vehicle-card is-active' : 'taxi-vehicle-card'}>
                  <button type="button" onClick={() => setForm((prev) => ({ ...prev, vehicleType: vehicle.value }))}>
                    <span>{t(vehicle.labelKey)}</span>
                    <strong>
                      {estimate
                        ? `${formatMoney(Math.round(base.min * vehicle.multiplier), base.currency)}`
                        : t(vehicle.metaKey)}
                    </strong>
                  </button>
                </article>
              )
            })}
          </div>

          <label className="taxi-return-row">
            <input type="checkbox" name="returnTrip" checked={form.returnTrip} onChange={onCheckboxChange} />
            <span>{t('taxi_return_trip')}</span>
          </label>

          <div className="form-group taxi-field">
            <label>{t('special_notes')}</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows={4}
              placeholder={t('taxi_notes_placeholder')}
            />
          </div>

          <div className="taxi-trust-row">
            <span>{t('taxi_trust_professional')}</span>
            <span>{t('taxi_trust_fixed')}</span>
            <span>{t('taxi_trust_airport')}</span>
            <span>{t('taxi_trust_service')}</span>
          </div>

          <button type="submit" className="btn taxi-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? t('loading') : t('taxi_find_my_taxi')}
          </button>
        </form>
      </section>

      <section className="card taxi-ai-card">
        <div>
          <span className="taxi-kicker">{t('ai_assistant_name')}</span>
          <h2>{t('taxi_ai_title')}</h2>
          <p>{t('taxi_ai_copy')}</p>
        </div>
        <a className="btn btn-secondary" href="#chat">
          {t('ai_chat_now')}
        </a>
      </section>

      <section className="card taxi-partners-card">
        <div className="taxi-form-heading">
          <div>
            <span className="taxi-kicker">{t('taxi_compare_kicker')}</span>
            <h2>{t('taxi_compare_title')}</h2>
            <p>{t('taxi_compare_copy')}</p>
          </div>
        </div>
        <div className="taxi-partner-grid">
          {(transportPartners.length ? transportPartners : [
            { id: 'uber', name: 'Uber', service_type: 'ride_app', description: t('taxi_partner_uber_desc'), booking_url: 'https://m.uber.com/' },
            { id: 'bolt', name: 'Bolt', service_type: 'ride_app', description: t('taxi_partner_bolt_desc'), booking_url: 'https://bolt.eu/en-ke/' },
            { id: 'private', name: t('taxi_partner_private_name'), service_type: 'private_transfer', description: t('taxi_partner_private_desc'), whatsapp_number: '+254700000000' },
          ]).map((partner) => {
            const isUber = normalizeText(partner.name).includes('uber')
            const href = partner.whatsapp_number
              ? buildWhatsAppLink(partner.whatsapp_number, form, t)
              : isUber
                ? uberLink
                : partner.booking_url || '#'

            return (
              <article key={partner.id || partner.name} className="taxi-partner-card">
                <div className="taxi-partner-logo">
                  {partner.logo_url ? <img src={partner.logo_url} alt={partner.name} /> : partner.name.slice(0, 2)}
                </div>
                <div>
                  <strong>{partner.name}</strong>
                  <span>{t(serviceTypeKey(partner.service_type))}</span>
                  <p>{partner.description}</p>
                </div>
                <a href={href} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                  {partner.whatsapp_number ? t('quick_whatsapp') : t('taxi_open_provider')}
                </a>
              </article>
            )
          })}
        </div>
        <p className="taxi-legal">
          {t('taxi_external_note')}
        </p>
      </section>

      {submitError && (
        <section className="notification taxi-error">
          {submitError}
        </section>
      )}

      {submitted && (
        <section className="notification notification-success">
          <strong>{t('taxi_request_sent')}</strong>
          <div>{summary}</div>
          {savedBooking?.id && <div>{t('reference')}: #{savedBooking.id}</div>}
        </section>
      )}

      {user && myTaxiBookings.length > 0 && (
        <section className="card taxi-form-card">
          <h2>{t('my_taxi_requests')}</h2>
          <div className="grid">
            {myTaxiBookings.slice(0, 5).map((booking) => (
              <article key={booking.id} className="review-card">
                <strong>{booking.pickup} → {booking.destination}</strong>
                <p className="property-card-meta">
                  {booking.travel_date} {booking.pickup_time} • {t('taxi_passengers')}: {booking.passengers}
                </p>
                <p className="property-card-meta">{t('status')}: {booking.status}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
