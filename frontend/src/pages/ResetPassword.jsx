import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { confirmPasswordReset } from '../api/auth'

export function ResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { uid, token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError(t('reset_password_min_length'))
      return
    }
    if (password !== confirm) {
      setError(t('reset_password_mismatch'))
      return
    }
    setLoading(true)
    try {
      await confirmPasswordReset({ uid, token, newPassword: password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 440, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('reset_password_title')}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>{t('reset_password_subtitle')}</p>

      {done ? (
        <div>
          <div style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            color: '#0F5F2F',
            padding: '12px 14px',
            borderRadius: 10,
            marginBottom: 12,
          }}>
            {t('reset_password_success')}
          </div>
          <p>
            <Link to="/login">{t('forgot_password_back_to_login')}</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('reset_password_new_label')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>{t('reset_password_confirm_label')}</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') : t('reset_password_submit')}
          </button>
          <p style={{ marginTop: '1rem' }}>
            <Link to="/login">{t('forgot_password_back_to_login')}</Link>
          </p>
        </form>
      )}
    </div>
  )
}
