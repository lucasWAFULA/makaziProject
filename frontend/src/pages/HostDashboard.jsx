import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getMyProperties } from '../api/properties'
import { useAuth } from '../context/AuthContext'

export function HostDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: getMyProperties,
    enabled: !!(user?.role === 'host' || user?.is_staff),
  })

  if (!user) return null
  if (user.role !== 'host' && !user.is_staff) {
    return <p>{t('error')}: Only hosts can access this page.</p>
  }

  return (
    <div>
      <h1>{t('manage_listings')}</h1>
      <p><Link to="/property/new" className="btn btn-primary">{t('new_listing')}</Link> <Link to="/property/new" className="btn btn-accent">{t('register_your_stay')}</Link></p>
      {isLoading ? (
        <p>{t('loading')}</p>
      ) : list.length === 0 ? (
        <p>{t('no_results')}. {t('register_your_stay')}.</p>
      ) : (
        <div className="grid grid-2">
          {list.map((p) => (
            <div key={p.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{p.title_sw}</strong>
                <p style={{ margin: '0.25rem 0', color: 'var(--color-text-muted)' }}>{p.location} · TZS {Number(p.price_per_night).toLocaleString()}</p>
              </div>
              <Link to={`/property/${p.id}/edit`} className="btn btn-secondary">{t('edit_property')}</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
