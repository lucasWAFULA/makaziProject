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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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
    <div className="auth-page">
      <div className="auth-card auth-animate-in">
        <div className="auth-header">
          <div className="auth-logo-icon">🔑</div>
          <span className="auth-brand">MakaziPlus</span>
        </div>
        <h1 className="auth-title">{t('reset_password_title')}</h1>
        <p className="auth-subtitle">{t('reset_password_subtitle')}</p>

        {done ? (
          <div>
            <div className="auth-success">
              <span style={{ fontSize: 20, marginRight: 8 }}>✅</span>
              {t('reset_password_success')}
            </div>
            <div className="auth-links" style={{ justifyContent: 'center' }}>
              <Link to="/login">{t('forgot_password_back_to_login')}</Link>
            </div>
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>{t('reset_password_new_label')}</label>
                <div className="auth-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label>{t('reset_password_confirm_label')}</label>
                <div className="auth-password-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : null}
                {loading ? t('loading') : t('reset_password_submit')}
              </button>
            </form>
            <div className="auth-links" style={{ justifyContent: 'center' }}>
              <Link to="/login">{t('forgot_password_back_to_login')}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
