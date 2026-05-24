import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { requestPasswordReset } from '../api/auth'

export function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email.trim())
      setSubmitted(true)
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
          <div className="auth-logo-icon">🔐</div>
          <span className="auth-brand">MakaziPlus</span>
        </div>
        <h1 className="auth-title">{t('forgot_password_title')}</h1>
        <p className="auth-subtitle">{t('forgot_password_subtitle')}</p>

        {submitted ? (
          <div>
            <div className="auth-success">
              <span style={{ fontSize: 20, marginRight: 8 }}>✉️</span>
              {t('forgot_password_sent')}
            </div>
            <p className="auth-hint">{t('forgot_password_check_spam')}</p>
            <div className="auth-links" style={{ justifyContent: 'center' }}>
              <Link to="/login">{t('forgot_password_back_to_login')}</Link>
            </div>
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? <span className="auth-spinner" /> : null}
                {loading ? t('loading') : t('forgot_password_submit')}
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
