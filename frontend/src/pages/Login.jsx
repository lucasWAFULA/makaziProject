import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { login, setTokens } from '../api/auth'
import { getPostLoginPath } from '../utils/authProfile'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { loginSuccess } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (location.state?.registered) {
      setBanner(t('register_success_login_prompt'))
    }
  }, [location.state, t])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      setTokens(data.access, data.refresh)
      loginSuccess(data.user)
      navigate(getPostLoginPath(data.user), { replace: true })
    } catch (err) {
      let errMsg = t('error') || 'An error occurred during sign in. Please try again.'
      if (err.response?.data) {
        const data = err.response.data
        if (typeof data === 'string') {
          errMsg = data
        } else if (data.detail) {
          errMsg = data.detail
        } else if (data.non_field_errors) {
          errMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors
        } else if (typeof data === 'object') {
          const errors = Object.values(data).flat()
          if (errors.length > 0) errMsg = errors[0]
        }
      } else if (err.message) {
        errMsg = err.message
      }
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-animate-in">
        <div className="auth-header">
          <div className="auth-logo-icon">🏠</div>
          <span className="auth-brand">MakaziPlus</span>
        </div>
        <h1 className="auth-title">{t('login')}</h1>
        <p className="auth-subtitle">{t('forgot_password_subtitle') || 'Welcome back — sign in to continue'}</p>

        {banner && <div className="auth-success" role="status">{banner}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>{t('email')} / Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="you@example.com"
            />
          </div>
          <div className="auth-field">
            <label>{t('password')}</label>
            <div className="auth-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : null}
            {loading ? t('loading') : t('login')}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/register">{t('register')}</Link>
          <Link to="/forgot-password">{t('forgot_password_link')}</Link>
        </div>
      </div>
    </div>
  )
}
