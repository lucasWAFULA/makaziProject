import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getMyProperties } from '../api/properties'
import { getHostDashboardStats } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { isOwnerDashboardUser, getUserDisplayName } from '../utils/authProfile'

export function HostDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const allowed = user && isOwnerDashboardUser(user)

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: getMyProperties,
    enabled: !!allowed && user.role !== 'agent',
  })

  const { data: stats } = useQuery({
    queryKey: ['host-stats'],
    queryFn: getHostDashboardStats,
    enabled: !!allowed,
  })

  if (!user) return null
  if (!allowed) {
    return <p>{t('owner_dashboard_denied')}</p>
  }

  const displayName = getUserDisplayName(user)
  const canAddProperty =
    user.role === 'host' || user.role === 'hotel_admin' || user.role === 'admin' || user.is_staff

  const fmtMoney = (v) => {
    const n = Number(v)
    if (Number.isNaN(n)) return v
    return n.toLocaleString()
  }

  return (
    <div className="owner-dashboard">
      <header className="owner-dashboard-header">
        <h1 className="owner-dashboard-title">{t('owner_dashboard')}</h1>
        <p className="owner-dashboard-welcome">
          {t('welcome_back_owner', { name: displayName })}
        </p>
      </header>

      {stats && (
        <div className="owner-stats-grid">
          <div className="owner-stat-card">
            <span className="owner-stat-label">{t('stat_active_listings')}</span>
            <strong className="owner-stat-value">{stats.active_listings}</strong>
          </div>
          <div className="owner-stat-card">
            <span className="owner-stat-label">{t('stat_total_bookings')}</span>
            <strong className="owner-stat-value">{stats.total_bookings}</strong>
          </div>
          <div className="owner-stat-card">
            <span className="owner-stat-label">{t('stat_pending_requests')}</span>
            <strong className="owner-stat-value">{stats.pending_requests}</strong>
          </div>
          <div className="owner-stat-card">
            <span className="owner-stat-label">{t('stat_revenue')}</span>
            <strong className="owner-stat-value">{fmtMoney(stats.revenue_total)}</strong>
          </div>
        </div>
      )}

      {user.role === 'agent' && !user.is_staff ? (
        <p className="owner-dashboard-agent-note">{t('owner_dashboard_agent_note')}</p>
      ) : null}

      <div className="owner-dashboard-actions">
        {canAddProperty ? (
          <>
            <Link to="/property/new" className="btn btn-primary">{t('new_listing')}</Link>
            <Link to="/property/new" className="btn btn-accent">{t('register_your_stay')}</Link>
          </>
        ) : null}
      </div>

      {user.role === 'agent' && !user.is_staff ? (
        <p className="text-muted">{t('owner_dashboard_agent_listings')}</p>
      ) : isLoading ? (
        <p>{t('loading')}</p>
      ) : list.length === 0 ? (
        <p>{t('no_results')}. {canAddProperty ? t('register_your_stay') : null}</p>
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
