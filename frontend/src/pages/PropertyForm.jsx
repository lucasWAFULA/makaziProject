import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProperty, createProperty, updateProperty,
  getPropertyCategories, getPropertyFeatures,
} from '../api/properties'
import { getDestinations } from '../api/destinations'
import { useAuth } from '../context/AuthContext'

const PRICE_TIERS = [
  { value: '', label: 'Auto-detect from price' },
  { value: 'budget', label: '💰 Budget' },
  { value: 'standard', label: '⭐ Standard' },
  { value: 'premium', label: '🌟 Premium' },
  { value: 'luxury', label: '💎 Luxury' },
  { value: 'ultra_luxury', label: '👑 Ultra Luxury' },
]

const STAY_STYLES = [
  { value: '', label: 'Not specified' },
  { value: 'solo', label: '🧍 Solo Stay' },
  { value: 'couple', label: '💑 Couple Stay' },
  { value: 'family', label: '👨‍👩‍👧 Family Stay' },
  { value: 'group', label: '👥 Group Stay' },
  { value: 'corporate', label: '💼 Corporate Stay' },
  { value: 'backpacker', label: '🎒 Backpacker Stay' },
]

const FEATURE_GROUP_LABELS = {
  location: '📍 Location',
  property: '🏠 Property',
  experience: '✨ Experience',
  service: '🛎️ Service',
}

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
    // Taxonomy
    category: '',
    property_type: '',
    features: [],
    // Config
    bedrooms: '',
    beds: '',
    bathrooms: '',
    max_guests: '',
    floor_count: '',
    room_size_sqm: '',
    // Classification
    price_tier: '',
    stay_style: '',
    // Pricing
    price_per_night: '',
    rules_sw: '',
    // Legacy
    listing_type: 'apartment',
    catalog_slug: '',
    amenities_text: '',
    // Location
    latitude: '',
    longitude: '',
    landmark: '',
    // Verification
    contact_name: '',
    contact_phone: '',
    ownership_details: '',
    walkthrough_video_url: '',
    is_active: true,
  })
  const [error, setError] = useState('')

  // ── Data fetching ────────────────────────────────────────────────────────
  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
    enabled: isEdit,
  })

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => getDestinations(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['property-categories'],
    queryFn: getPropertyCategories,
  })

  const { data: allFeatures = [] } = useQuery({
    queryKey: ['property-features'],
    queryFn: () => getPropertyFeatures(),
  })

  // Types for the selected category
  const selectedCategory = categories.find((c) => String(c.id) === String(form.category))
  const typeOptions = selectedCategory?.types ?? []

  // Features grouped by feature_group
  const featuresByGroup = allFeatures.reduce((acc, feat) => {
    if (!acc[feat.feature_group]) acc[feat.feature_group] = []
    acc[feat.feature_group].push(feat)
    return acc
  }, {})

  // ── Populate form when editing ────────────────────────────────────────────
  useEffect(() => {
    if (property) {
      setForm({
        title_sw: property.title_sw || '',
        description_sw: property.description_sw || '',
        location: property.location || '',
        destination: property.destination ?? '',
        category: property.category ?? '',
        property_type: property.property_type ?? '',
        features: (property.features ?? []).map((f) => (typeof f === 'object' ? f.id : f)),
        bedrooms: property.bedrooms ?? '',
        beds: property.beds ?? '',
        bathrooms: property.bathrooms ?? '',
        max_guests: property.max_guests ?? '',
        floor_count: property.floor_count ?? '',
        room_size_sqm: property.room_size_sqm ?? '',
        price_tier: property.price_tier || '',
        stay_style: property.stay_style || '',
        price_per_night: property.price_per_night ?? '',
        rules_sw: property.rules_sw || '',
        listing_type: property.listing_type || 'apartment',
        catalog_slug: property.catalog_slug || '',
        amenities_text: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
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

  // ── Mutations ─────────────────────────────────────────────────────────────
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

  function toggleFeature(featureId) {
    setForm((prev) => {
      const id = Number(featureId)
      const has = prev.features.includes(id)
      return {
        ...prev,
        features: has ? prev.features.filter((f) => f !== id) : [...prev.features, id],
      }
    })
  }

  function handleCategoryChange(categoryId) {
    setForm((prev) => ({ ...prev, category: categoryId, property_type: '' }))
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
      // Taxonomy
      category: form.category ? Number(form.category) : null,
      property_type: form.property_type ? Number(form.property_type) : null,
      features: form.features.map(Number),
      // Config
      bedrooms: form.bedrooms !== '' ? Number(form.bedrooms) : null,
      beds: form.beds !== '' ? Number(form.beds) : null,
      bathrooms: form.bathrooms !== '' ? Number(form.bathrooms) : null,
      max_guests: form.max_guests !== '' ? Number(form.max_guests) : null,
      floor_count: form.floor_count !== '' ? Number(form.floor_count) : null,
      room_size_sqm: form.room_size_sqm !== '' ? Number(form.room_size_sqm) : null,
      // Classification
      price_tier: form.price_tier || '',
      stay_style: form.stay_style || '',
      // Pricing
      listing_type: form.listing_type,
      catalog_slug: form.catalog_slug,
      amenities,
      price_per_night: form.price_per_night ? Number(form.price_per_night) : 0,
      rules_sw: form.rules_sw,
      // Location
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

  const sectionStyle = { margin: '1.75rem 0 0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.4rem' }
  const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }
  const gridThree = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }

  return (
    <div className="card" style={{ maxWidth: 620, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{isEdit ? t('edit_property') : t('add_property')}</h1>
      {!isEdit && (
        <p style={{ marginTop: 0, color: 'var(--color-text-muted)' }}>
          New listings are reviewed before they appear publicly.
        </p>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── BASICS ── */}
        <h3 style={sectionStyle}>Basics</h3>
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
          <label>Destination</label>
          <select value={form.destination} onChange={(e) => update('destination', e.target.value)}>
            <option value="">Select destination</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.destination_name} ({d.country})</option>
            ))}
          </select>
          <small style={{ color: 'var(--color-text-muted)' }}>Used for discovery and correct region filters.</small>
        </div>

        {/* ── TAXONOMY ── */}
        <h3 style={sectionStyle}>🏷️ Stay Classification</h3>
        <div style={gridTwo}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Stay Type</label>
            <select
              value={form.property_type}
              onChange={(e) => update('property_type', e.target.value)}
              disabled={!form.category}
            >
              <option value="">{form.category ? 'Select type' : '← Pick category first'}</option>
              {typeOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ ...gridTwo, marginTop: '0.75rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Stay Style</label>
            <select value={form.stay_style} onChange={(e) => update('stay_style', e.target.value)}>
              {STAY_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Price Tier</label>
            <select value={form.price_tier} onChange={(e) => update('price_tier', e.target.value)}>
              {PRICE_TIERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── CONFIGURATION ── */}
        <h3 style={sectionStyle}>🛏️ Configuration</h3>
        <div style={gridThree}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Bedrooms</label>
            <input type="number" min="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} placeholder="0" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Beds</label>
            <input type="number" min="0" value={form.beds} onChange={(e) => update('beds', e.target.value)} placeholder="1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Bathrooms</label>
            <input type="number" min="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} placeholder="1" />
          </div>
        </div>
        <div style={{ ...gridThree, marginTop: '0.75rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Max Guests</label>
            <input type="number" min="1" value={form.max_guests} onChange={(e) => update('max_guests', e.target.value)} placeholder="2" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Floors</label>
            <input type="number" min="1" value={form.floor_count} onChange={(e) => update('floor_count', e.target.value)} placeholder="1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Size (m²)</label>
            <input type="number" min="0" step="0.1" value={form.room_size_sqm} onChange={(e) => update('room_size_sqm', e.target.value)} placeholder="45" />
          </div>
        </div>

        {/* ── FEATURES ── */}
        <h3 style={sectionStyle}>✨ Features & Amenities</h3>
        <small style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.75rem' }}>
          Select all that apply — these power search and AI recommendations.
        </small>
        {Object.entries(featuresByGroup).map(([group, feats]) => (
          <div key={group} style={{ marginBottom: '1rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {FEATURE_GROUP_LABELS[group] || group}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {feats.map((feat) => {
                const active = form.features.includes(feat.id)
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => toggleFeature(feat.id)}
                    style={{
                      padding: '0.3rem 0.7rem',
                      borderRadius: '999px',
                      border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: active ? 'var(--color-primary)' : 'transparent',
                      color: active ? '#fff' : 'var(--color-text)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: active ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    {feat.icon} {feat.name}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* ── PRICING ── */}
        <h3 style={sectionStyle}>💰 Pricing & Rules</h3>
        <div className="form-group">
          <label>{t('price_per_night')} (TZS / night)</label>
          <input type="number" value={form.price_per_night} onChange={(e) => update('price_per_night', e.target.value)} required min="0" />
        </div>
        <div className="form-group">
          <label>{t('rules')}</label>
          <textarea value={form.rules_sw} onChange={(e) => update('rules_sw', e.target.value)} rows={2} />
        </div>
        <div className="form-group">
          <label>Legacy Amenities (comma-separated)</label>
          <input
            type="text"
            value={form.amenities_text}
            onChange={(e) => update('amenities_text', e.target.value)}
            placeholder="WiFi, Pool, Parking, Kitchen..."
          />
          <small style={{ color: 'var(--color-text-muted)' }}>Use the feature tags above instead — this is for backwards compatibility.</small>
        </div>

        {/* ── LOCATION ── */}
        <h3 style={sectionStyle}>📍 Map Pin</h3>
        <div className="form-group">
          <label>Landmark / nearby place</label>
          <input type="text" value={form.landmark} onChange={(e) => update('landmark', e.target.value)} placeholder="e.g. Near Kendwa Rocks, Nyali Centre..." />
        </div>
        <div style={gridTwo}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Latitude</label>
            <input type="number" step="0.000001" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} placeholder="-6.165917" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Longitude</label>
            <input type="number" step="0.000001" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} placeholder="39.202641" />
          </div>
        </div>

        {/* ── VERIFICATION ── */}
        <h3 style={sectionStyle}>🔒 Verification Details</h3>
        <div className="form-group">
          <label>Walkthrough video link</label>
          <input
            type="url"
            value={form.walkthrough_video_url}
            onChange={(e) => update('walkthrough_video_url', e.target.value)}
            placeholder="YouTube, Google Drive, Dropbox, etc."
          />
          <small style={{ color: 'var(--color-text-muted)' }}>Continuous walkthrough helps us verify faster.</small>
        </div>
        <div style={gridTwo}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Contact person</label>
            <input type="text" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder="Name" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Contact phone</label>
            <input type="tel" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} placeholder="e.g. 2557xxxxxxx" />
          </div>
        </div>
        <div className="form-group">
          <label>Ownership / management details</label>
          <textarea
            value={form.ownership_details}
            onChange={(e) => update('ownership_details', e.target.value)}
            rows={3}
            placeholder="Explain how you manage this property (owner, manager, agent) and any proof you can provide."
          />
        </div>

        {isEdit && (
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />
            <label htmlFor="active" style={{ marginBottom: 0 }}>Active</label>
          </div>
        )}

        {error && <p style={{ color: '#dc3545' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') : t('save')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
