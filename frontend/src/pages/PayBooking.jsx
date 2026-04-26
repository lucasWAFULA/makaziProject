import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { initiateMpesa } from '../api/payments'
import api from '../api/client'

export function PayBooking() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get('/bookings/my/')
      const list = res.data
      const b = list.find((x) => x.id === Number(id))
      if (!b) throw new Error('Booking not found')
      return b
    },
    enabled: !!id && !!submitted,
  })

  useEffect(() => {
    if (!submitted || !id) return
    const interval = setInterval(() => {
      api.get('/bookings/my/').then((res) => {
        const b = res.data.find((x) => x.id === Number(id))
        if (b?.status === 'confirmed') {
          navigate('/bookings', { state: { confirmed: true } })
        }
      }).catch(() => {})
    }, 4000)
    return () => clearInterval(interval)
  }, [id, submitted, navigate])

  async function handlePay(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await initiateMpesa(Number(id), phone)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || t('payment_failed'))
    } finally {
      setLoading(false)
    }
  }

  if (isLoading && submitted) return <p>{t('loading')}</p>

  if (submitted) {
    return (
      <div className="card" style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem', textAlign: 'center' }}>
        <h2>{t('waiting_payment')}</h2>
        <p>{t('pay_with_mpesa')}</p>
        <p>Check your phone and enter M-Pesa PIN.</p>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/bookings')}>{t('my_bookings')}</button>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('pay_now')}</h1>
      <p>{t('pay_with_mpesa')}</p>
      <form onSubmit={handlePay}>
        <div className="form-group">
          <label>{t('enter_phone')}</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" required />
        </div>
        {error && <p style={{ color: '#dc3545' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? t('loading') : t('pay_now')}</button>
      </form>
      <p style={{ marginTop: '1rem' }}><button type="button" className="btn btn-secondary" onClick={() => navigate('/bookings')}>{t('cancel')}</button></p>
    </div>
  )
}
