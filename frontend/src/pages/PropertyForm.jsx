import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProperty, createProperty, updateProperty } from '../api/properties'
import { getDestinations } from '../api/destinations'
import { useAuth } from '../context/AuthContext'

const listingTypeOptions = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'bnb', label: 'BnB' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'villa', label: 'Villa' },
]

export function PropertyForm() {
  const { id } = useParams()
  const isEdit = id && id !== 'new'
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [form, setForm] = useState({
    title_sw: '',
    description_sw: '',
    location: '',
    destination: '',
    listing_type: 'house',
    catalog_slug: '',
    amenities_text: '',
    price_per_night: '',
    rules_sw: '',
    latitude: '',
    longitude: '',
    landmark: '',
    contact_name: '',
    contact_phone: '',
    ownership_details: '',
    walkthrough_video_url: '',
    is_active: true,
  })
  const [error, setError] = useState('')

  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
    enabled: isEdit,
  })

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => getDestinations(),
  })

  useEffect(() => {
    if (property) {
      setForm({
        title_sw: property.title_sw || '',
        description_sw: property.description_sw || '',
        location: property.location || '',
        destination: property.destination ?? '',
        listing_type: property.listing_type || 'house',
        catalog_slug: property.catalog_slug || '',
        amenities_text: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
        price_per_night: property.price_per_night ?? '',
        rules_sw: property.rules_sw || '',
        latitude: property.latitude ?? '',
        longitude: property.longitude ?? '',
        landmark: property.landmark || '',
        contact_name: property.contact_name || '',
        contact_phone: property.contact_phone || '',
        ownership_details: property.ownership_details || '',
        walkthrough_video_url: property.walkthrough_video_url || '',
        is_active: property.is_active ?? true,
      })
    }
  }, [property])

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-properties', 'properties'])
      navigate('/owner-dashboard')
    },
    onError: (err) => setError(err.response?.data?.detail || err.message || t('error')),
  })

  const updateMutation = useMutation({
    mutationFn: (data) => updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['property', id, 'properties'])
      navigate('/owner-dashboard')
    },
    onError: (err) => setError(err.response?.data?.detail || err.message || t('error')),
  })

  if (user && user.role !== 'host' && !user.is_staff) {
    navigate('/')
    return null
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const amenities = String(form.amenities_text || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const payload = {
      title_sw: form.title_sw,
      description_sw: form.description_sw,
      location: form.location,
      destination: form.destination ? Number(form.destination) : null,
      listing_type: form.listing_type,
      catalog_slug: form.catalog_slug,
      amenities,
      price_per_night: form.price_per_night ? Number(form.price_per_night) : 0,
      rules_sw: form.rules_sw,
      latitude: form.latitude === '' ? null : Number(form.latitude),
      longitude: form.longitude === '' ? null : Number(form.longitude),
      landmark: form.landmark,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      ownership_details: form.ownership_details,
      walkthrough_video_url: form.walkthrough_video_url,
      is_active: form.is_active,
    }
    if (isEdit) updateMutation.mutate(payload)
    else createMutation.mutate(payload)
  }

  const loading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{isEdit ? t('edit_property') : t('add_property')}</h1>
      {!isEdit && (
        <p style={{ marginTop: 0, color: 'var(--color-text-muted)' }}>
          New listings are reviewed before they appear publicly.
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: '0.75rem' }}>Basics</h3>
        <div className="form-group">
          <label>{t('title')} (Kiswahili)</label>
          <input type="text" value={form.title_sw} onChange={(e) => update('title_sw', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('description')}</label>
          <textarea value={form.description_sw} onChange={(e) => update('description_sw', e.target.value)} rows={3} />
        </div>
        <div className="form-group">
          <label>{t('location')}</label>
          <input type="text" value={form.location} onChange={(e) => update('location', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Stay type</label>
          <select value={form.listing_type} onChange={(e) => update('listing_type', e.target.value)}>
            {listingTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Destination</label>
          <select value={form.destination} onChange={(e) => update('destination', e.target.value)}>
            <option value="">Select destination</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.destination_name} ({d.country})</option>
            ))}
          </select>
          <small style={{ color: 'var(--color-text-muted)' }}>Used for discovery and correct region filters.</small>
        </div>
        <div className="form-group">
          <label>Experience catalog (optional)</label>
          <input type="text" value={form.catalog_slug} onChange={(e) => update('catalog_slug', e.target.value)} placeholder="e.g. beach-villas, near-airport" />
        </div>
        <div className="form-group">
          <label>Amenities</label>
          <input
            type="text"
            value={form.amenities_text}
            onChange={(e) => update('amenities_text', e.target.value)}
            placeholder="WiFi, Pool, Parking, Kitchen..."
          />
          <small style={{ color: 'var(--color-text-muted)' }}>Separate with commas.</small>
        </div>

        <h3 style={{ margin: '1.5rem 0 0.75rem' }}>Pricing & rules</h3>
        <div className="form-group">
          <label>{t('price_per_night')} (TZS)</label>
          <input type="number" value={form.price_per_night} onChange={(e) => update('price_per_night', e.target.value)} required min="0" />
        </div>
        <div className="form-group">
          <label>{t('rules')}</label>
          <textarea value={form.rules_sw} onChange={(e) => update('rules_sw', e.target.value)} rows={2} />
        </div>

        <h3 style={{ margin: '1.5rem 0 0.75rem' }}>Map pin</h3>
        <div className="form-group">
          <label>Landmark / nearby place</label>
          <input type="text" value={form.landmark} onChange={(e) => update('landmark', e.target.value)} placeholder="e.g. Near Kendwa Rocks, Nyali Centre..." />
        </div>
        <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label>Latitude</label>
            <input type="number" step="0.000001" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} placeholder="-6.165917" />
          </div>
          <div>
            <label>Longitude</label>
            <input type="number" step="0.000001" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} placeholder="39.202641" />
          </div>
        </div>

        <h3 style={{ margin: '1.5rem 0 0.75rem' }}>Verification details</h3>
        <div className="form-group">
          <label>Walkthrough video link</label>
          <input
            type="url"
            value={form.walkthrough_video_url}
            onChange={(e) => update('walkthrough_video_url', e.target.value)}
            placeholder="YouTube, Google Drive, Dropbox, etc."
          />
          <small style={{ color: 'var(--color-text-muted)' }}>
            Continuous walkthrough helps us verify faster.
          </small>
        </div>
        <div className="form-group">
          <label>Contact person</label>
          <input type="text" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder="Name" />
        </div>
        <div className="form-group">
          <label>Contact phone</label>
          <input type="tel" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} placeholder="e.g. 2557xxxxxxx" />
        </div>
        <div className="form-group">
          <label>Ownership / management details</label>
          <textarea value={form.ownership_details} onChange={(e) => update('ownership_details', e.target.value)} rows={3} placeholder="Explain how you manage this property (owner, manager, agent) and any proof you can provide." />
        </div>

        {isEdit && (
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />
            <label htmlFor="active" style={{ marginBottom: 0 }}>Active</label>
          </div>
        )}
        {error && <p style={{ color: '#dc3545' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? t('loading') : t('save')}</button>
        <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={() => navigate(-1)}>{t('cancel')}</button>
      </form>
    </div>
  )
}
