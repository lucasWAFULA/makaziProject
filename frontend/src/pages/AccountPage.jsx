import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserDisplayName, isOwnerDashboardUser } from '../utils/authProfile'

export function AccountPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 520, margin: '2rem auto', padding: '1.5rem' }}>
        <p>{t('account_sign_in_prompt')}</p>
        <Link to="/login" className="btn btn-primary">{t('login')}</Link>
      </div>
    )
  }

  const name = getUserDisplayName(user)

  return (
    <div className="card account-page" style={{ maxWidth: 520, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('nav_account_profile')}</h1>
      <p className="account-page-name"><strong>{name}</strong></p>
      <dl className="account-page-dl">
        <dt>{t('email')}</dt>
        <dd>{user.email || '—'}</dd>
        <dt>{t('role')}</dt>
        <dd>{t(`role_label_${user.role}`, { defaultValue: user.role })}</dd>
      </dl>
      <div className="account-page-actions">
        <Link to="/bookings" className="btn btn-secondary">{t('my_bookings')}</Link>
        {isOwnerDashboardUser(user) ? (
          <Link to="/owner-dashboard" className="btn btn-secondary">{t('owner_dashboard')}</Link>
        ) : null}
      </div>
    </div>
  )
}
