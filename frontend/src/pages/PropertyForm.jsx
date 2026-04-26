import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProperty, createProperty, updateProperty } from '../api/properties'
import { useAuth } from '../context/AuthContext'

export function PropertyForm() {
  const { id } = useParams()
  const isEdit = id && id !== 'new'
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [form, setForm] = useState({
    title_sw: '', description_sw: '', location: '', price_per_night: '', rules_sw: '', is_active: true
  })
  const [error, setError] = useState('')

  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (property) {
      setForm({
        title_sw: property.title_sw || '',
        description_sw: property.description_sw || '',
        location: property.location || '',
        price_per_night: property.price_per_night ?? '',
        rules_sw: property.rules_sw || '',
        is_active: property.is_active ?? true,
      })
    }
  }, [property])

  const createMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-properties', 'properties'])
      navigate('/dashboard')
    },
    onError: (err) => setError(err.response?.data?.detail || err.message || t('error')),
  })

  const updateMutation = useMutation({
    mutationFn: (data) => updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['property', id, 'properties'])
      navigate('/dashboard')
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
    const payload = {
      ...form,
      price_per_night: form.price_per_night ? Number(form.price_per_night) : 0,
    }
    if (isEdit) updateMutation.mutate(payload)
    else createMutation.mutate(payload)
  }

  const loading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{isEdit ? t('edit_property') : t('add_property')}</h1>
      <form onSubmit={handleSubmit}>
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
          <label>{t('price_per_night')} (TZS)</label>
          <input type="number" value={form.price_per_night} onChange={(e) => update('price_per_night', e.target.value)} required min="0" />
        </div>
        <div className="form-group">
          <label>{t('rules')}</label>
          <textarea value={form.rules_sw} onChange={(e) => update('rules_sw', e.target.value)} rows={2} />
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
