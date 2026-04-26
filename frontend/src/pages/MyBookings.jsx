import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getMyBookings } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'

export function MyBookings() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const confirmed = location.state?.confirmed

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: getMyBookings,
    enabled: !!user,
  })

  if (!user) return null

  return (
    <div>
      <h1>{t('my_bookings')}</h1>
      {confirmed && <p className="notification notification-success">{t('booking_confirmed_notification')}</p>}
      {isLoading ? (
        <p>{t('loading')}</p>
      ) : list.length === 0 ? (
        <p>{t('no_results')}</p>
      ) : (
        <div className="grid" style={{ gap: '1rem' }}>
          {list.map((b) => (
            <div key={b.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong>{b.property_detail?.title_sw || `Booking #${b.id}`}</strong>
                <p style={{ margin: '0.25rem 0', color: '#666' }}>{b.check_in} — {b.check_out}</p>
                <p style={{ margin: 0 }}>TZS {Number(b.total_price).toLocaleString()} · {b.status}</p>
              </div>
              {b.status === 'pending' && (
                <Link to={`/pay/${b.id}`} className="btn btn-primary">{t('pay_now')}</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
