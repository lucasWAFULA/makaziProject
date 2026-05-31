import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProperty, createProperty, updateProperty,
  getPropertyCategories, getPropertyFeatures,
  importPropertyFromUrl,
} from '../api/properties'
import { getDestinations } from '../api/destinations'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { GooglePlacePicker } from '../components/GooglePlacePicker'
import { PropertyMediaUpload } from '../components/PropertyMediaUpload'

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
  const { currencies: apiCurrencies } = useCurrency()

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
    base_currency: 'KES',
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
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
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
        base_currency: property.base_currency || 'KES',
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

  async function handleImport() {
    if (!importUrl) return
    setIsImporting(true)
    setError('')
    try {
      const data = await importPropertyFromUrl(importUrl)
      setForm((prev) => ({
        ...prev,
        title_sw: data.title || prev.title_sw,
        description_sw: data.description ? `${data.description}\n\n[Ref: ${importUrl}]` : prev.description_sw,
        price_per_night: data.price || prev.price_per_night,
        amenities_text: data.features ? data.features.join(', ') : prev.amenities_text,
      }))
      // Optional: show a success message
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import property details.')
    } finally {
      setIsImporting(false)
    }
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
      base_currency: form.base_currency,
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
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{ marginTop: 0 }}>{isEdit ? t('edit_property') : t('add_property')}</h1>
        {!isEdit && (
          <p style={{ marginTop: 0, color: 'var(--color-text-muted)' }}>
            {t('pf_review_note')}
          </p>
        )}

        {!isEdit && (
          <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1.5px solid var(--color-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h4 style={{ marginTop: 0, marginBottom: '0.4rem', color: 'var(--color-primary)' }}>{t('pf_smart_assist_title')}</h4>
            <p style={{ margin: '0 0 0.85rem', fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
              {t('pf_smart_assist_desc')} 
              <br />
              <small style={{ display: 'block', marginTop: '0.4rem', fontStyle: 'italic' }}>
                {t('pf_smart_assist_note')}
              </small>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                placeholder="https://website.com/property-link..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleImport}
                disabled={isImporting || !importUrl}
                style={{ whiteSpace: 'nowrap' }}
              >
                {isImporting ? t('pf_importing') : t('pf_assist_me')}
              </button>
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: 11, color: 'var(--color-text-muted)' }}>
              {t('pf_import_warning')}
            </p>
          </div>
        )}

      <form onSubmit={handleSubmit}>

        {/* ── BASICS ── */}
        <h3 style={sectionStyle}>{t('pf_basics')}</h3>
        <div className="form-group">
          <label>{t('title')}</label>
          <input type="text" value={form.title_sw} onChange={(e) => update('title_sw', e.target.value)} required />
          <small style={{ color: 'var(--color-text-muted)' }}>{t('pf_content_lang')}</small>
        </div>
        <div className="form-group">
          <label>{t('description')}</label>
          <textarea value={form.description_sw} onChange={(e) => update('description_sw', e.target.value)} rows={3} />
        </div>
        <div className="form-group">
          <label>{t('destination')}</label>
          <select value={form.destination} onChange={(e) => update('destination', e.target.value)}>
            <option value="">{t('pf_select_destination')}</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.destination_name} ({d.country})</option>
            ))}
          </select>
          <small style={{ color: 'var(--color-text-muted)' }}>{t('pf_destination_hint')}</small>
        </div>

        {/* ── TAXONOMY ── */}
        <h3 style={sectionStyle}>{t('pf_classification')}</h3>
        <div style={gridTwo}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_category')}</label>
            <select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">{t('pf_select_category')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_stay_type')}</label>
            <select
              value={form.property_type}
              onChange={(e) => update('property_type', e.target.value)}
              disabled={!form.category}
            >
              <option value="">{form.category ? t('pf_select_type') : t('pf_pick_category_first')}</option>
              {typeOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ ...gridTwo, marginTop: '0.75rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_stay_style')}</label>
            <select value={form.stay_style} onChange={(e) => update('stay_style', e.target.value)}>
              {STAY_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_price_tier')}</label>
            <select value={form.price_tier} onChange={(e) => update('price_tier', e.target.value)}>
              {PRICE_TIERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── CONFIGURATION ── */}
        <h3 style={sectionStyle}>{t('pf_configuration')}</h3>
        <div style={gridThree}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_bedrooms')}</label>
            <input type="number" min="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} placeholder="0" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_beds')}</label>
            <input type="number" min="0" value={form.beds} onChange={(e) => update('beds', e.target.value)} placeholder="1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_bathrooms')}</label>
            <input type="number" min="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} placeholder="1" />
          </div>
        </div>
        <div style={{ ...gridThree, marginTop: '0.75rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_max_guests')}</label>
            <input type="number" min="1" value={form.max_guests} onChange={(e) => update('max_guests', e.target.value)} placeholder="2" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_floors')}</label>
            <input type="number" min="1" value={form.floor_count} onChange={(e) => update('floor_count', e.target.value)} placeholder="1" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_size_sqm')}</label>
            <input type="number" min="0" step="0.1" value={form.room_size_sqm} onChange={(e) => update('room_size_sqm', e.target.value)} placeholder="45" />
          </div>
        </div>

        {/* ── FEATURES ── */}
        <h3 style={sectionStyle}>{t('pf_features_title')}</h3>
        <small style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.75rem' }}>
          {t('pf_features_hint')}
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
        <h3 style={sectionStyle}>{t('pf_pricing')}</h3>
        <div className="form-group">
          <label>{t('pf_base_currency')}</label>
          <select value={form.base_currency} onChange={(e) => update('base_currency', e.target.value)}>
            {apiCurrencies.length > 0 ? (
              apiCurrencies.map((c) => (
                <option key={c.code} value={c.code}>{c.flag_emoji} {c.name} ({c.code})</option>
              ))
            ) : (
              <>
                <option value="KES">Kenyan Shilling (KES)</option>
                <option value="TZS">Tanzanian Shilling (TZS)</option>
                <option value="UGX">Ugandan Shilling (UGX)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="RWF">Rwandan Franc (RWF)</option>
                <option value="ETB">Ethiopian Birr (ETB)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </>
            )}
          </select>
          <small style={{ color: 'var(--color-text-muted)' }}>{t('pf_currency_hint')}</small>
        </div>
        <div className="form-group">
          <label>{t('price_per_night')} ({form.base_currency} / night)</label>
          <input type="number" value={form.price_per_night} onChange={(e) => update('price_per_night', e.target.value)} required min="0" />
        </div>
        <div className="form-group">
          <label>{t('rules')}</label>
          <textarea value={form.rules_sw} onChange={(e) => update('rules_sw', e.target.value)} rows={2} />
        </div>
        <div className="form-group">
          <label>{t('pf_amenities')}</label>
          <input
            type="text"
            value={form.amenities_text}
            onChange={(e) => update('amenities_text', e.target.value)}
            placeholder={t('pf_amenities_placeholder')}
          />
        </div>

        {/* ── LOCATION ── */}
        <h3 style={sectionStyle}>{t('pf_location')}</h3>
        <div className="form-group">
          <label>{t('pf_search_address')}</label>
          <GooglePlacePicker
            value={form.location}
            placeholder={t('pf_address_placeholder')}
            onChange={({ address, lat, lng, country, city }) => {
              setForm((prev) => ({
                ...prev,
                location: address || prev.location,
                latitude: lat ?? prev.latitude,
                longitude: lng ?? prev.longitude,
                ...(country ? { country } : {}),
                ...(city ? { town: city } : {}),
              }))
            }}
          />
          <small style={{ color: 'var(--color-text-muted)' }}>{t('pf_latlng_hint')}</small>
        </div>
        <div className="form-group">
          <label>{t('pf_landmark')}</label>
          <input type="text" value={form.landmark} onChange={(e) => update('landmark', e.target.value)} placeholder={t('pf_landmark_placeholder')} />
        </div>
        <div style={gridTwo}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_latitude')} <small style={{ fontWeight: 400 }}>({t('pf_auto')})</small></label>
            <input type="number" step="0.000001" value={form.latitude} onChange={(e) => update('latitude', e.target.value)} placeholder="-6.165917" readOnly={!!form.latitude} style={{ background: form.latitude ? '#f8fafc' : undefined }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_longitude')} <small style={{ fontWeight: 400 }}>({t('pf_auto')})</small></label>
            <input type="number" step="0.000001" value={form.longitude} onChange={(e) => update('longitude', e.target.value)} placeholder="39.202641" readOnly={!!form.longitude} style={{ background: form.longitude ? '#f8fafc' : undefined }} />
          </div>
        </div>

        {/* ── VERIFICATION ── */}
        <h3 style={sectionStyle}>{t('pf_verification')}</h3>
        <div className="form-group">
          <label>{t('pf_walkthrough_video')}</label>
          <input
            type="url"
            value={form.walkthrough_video_url}
            onChange={(e) => update('walkthrough_video_url', e.target.value)}
            placeholder={t('pf_walkthrough_placeholder')}
          />
          <small style={{ color: 'var(--color-text-muted)' }}>{t('pf_walkthrough_hint')}</small>
        </div>
        <div style={gridTwo}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_contact_person')}</label>
            <input type="text" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder={t('pf_contact_person')} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('pf_contact_phone')}</label>
            <input type="tel" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} placeholder={t('pf_phone_placeholder')} />
          </div>
        </div>
        <div className="form-group">
          <label>{t('pf_ownership')}</label>
          <textarea
            value={form.ownership_details}
            onChange={(e) => update('ownership_details', e.target.value)}
            rows={3}
            placeholder={t('pf_ownership_placeholder')}
          />
        </div>

        {isEdit && (
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} />
            <label htmlFor="active" style={{ marginBottom: 0 }}>{t('pf_active')}</label>
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

      {/* ── MEDIA UPLOAD (only after property exists) ── */}
      {isEdit && id && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '0.25rem' }}>{t('pf_media_title')}</h2>
          <p style={{ margin: '0 0 1.25rem', color: 'var(--color-text-muted)', fontSize: 14 }}>
            {t('pf_media_desc')}
          </p>
          <PropertyMediaUpload
            propertyId={id}
            onUpdate={() => queryClient.invalidateQueries(['property', id])}
          />
        </div>
      )}
      {!isEdit && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #f0fdf4, #fefffe)', border: '1px dashed #86efac' }}>
          <strong>{t('pf_next_step_photos')}</strong>
          <p style={{ margin: '0.35rem 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>
            {t('pf_next_step_photos_desc')}
          </p>
        </div>
      )}
    </div>
  )
}

