import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProperty } from '../api/properties'
import { createBooking } from '../api/bookings'
import { useAuth } from '../context/AuthContext'

export function BookProperty() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [error, setError] = useState('')

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  })

  const createMutation = useMutation({
    mutationFn: () => createBooking(Number(id), checkIn, checkOut),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['bookings'])
      navigate(`/pay/${data.id}`, { state: { booking: data } })
    },
    onError: (err) => {
      setError(err.response?.data?.detail || err.response?.data?.check_out?.[0] || err.message || t('error'))
    },
  })

  if (!user) {
    navigate('/login')
    return null
  }
  if (isLoading || !property) return <p>{t('loading')}</p>

  const nights = checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0
  const totalPrice = nights * Number(property.price_per_night)

  return (
    <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('book_now')} — {property.title_sw}</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>{t('choose_dates')}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          createMutation.mutate()
        }}
      >
        <div className="form-group">
          <label>{t('check_in')}</label>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required min={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="form-group">
          <label>{t('check_out')}</label>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required min={checkIn || new Date().toISOString().slice(0, 10)} />
        </div>
        {nights > 0 && (
          <p><strong>{t('price_per_night')}:</strong> TZS {Number(property.price_per_night).toLocaleString()} × {nights} = TZS {totalPrice.toLocaleString()}</p>
        )}
        {error && <p style={{ color: '#dc3545' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || nights < 1}>
          {createMutation.isPending ? t('loading') : t('book_now')}
        </button>
      </form>
    </div>
  )
}
