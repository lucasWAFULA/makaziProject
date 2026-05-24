import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { register as apiRegister } from '../api/auth'

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    role: 'customer',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirm) {
      setError(t('register_password_mismatch'))
      return
    }
    setLoading(true)
    try {
      await apiRegister({
        first_name: form.first_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
        role: form.role,
      })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const msg = err.response?.data
      setError(typeof msg === 'object' ? JSON.stringify(msg) : (msg || err.message || t('error')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide auth-animate-in">
        <div className="auth-header">
          <div className="auth-logo-icon">🏠</div>
          <span className="auth-brand">MakaziPlus</span>
        </div>
        <h1 className="auth-title">{t('register')}</h1>
        <p className="auth-subtitle">{t('register_role_intro')}</p>

        <div className="auth-role-selector" role="group" aria-label={t('role')}>
          <button
            type="button"
            className={`auth-role-option ${form.role === 'customer' ? 'is-active' : ''}`}
            onClick={() => update('role', 'customer')}
          >
            <span className="auth-role-emoji">🧳</span>
            <span className="auth-role-label">{t('register_card_customer_title')}</span>
            <span className="auth-role-hint">{t('register_card_customer_hint')}</span>
          </button>
          <button
            type="button"
            className={`auth-role-option ${form.role === 'host' ? 'is-active' : ''}`}
            onClick={() => update('role', 'host')}
          >
            <span className="auth-role-emoji">🏡</span>
            <span className="auth-role-label">{t('register_card_owner_title')}</span>
            <span className="auth-role-hint">{t('register_card_owner_hint')}</span>
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="reg-name">{t('register_full_name')}</label>
              <input
                id="reg-name"
                type="text"
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                required
                autoComplete="name"
                placeholder="John Doe"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-phone">{t('phone_number')}</label>
              <input
                id="reg-phone"
                type="tel"
                value={form.phone_number}
                onChange={(e) => update('phone_number', e.target.value)}
                autoComplete="tel"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="reg-email">{t('email')}</label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="reg-pw">{t('password')}</label>
              <div className="auth-password-wrap">
                <input
                  id="reg-pw"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="reg-pw2">{t('confirm_password')}</label>
              <div className="auth-password-wrap">
                <input
                  id="reg-pw2"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.password_confirm}
                  onChange={(e) => update('password_confirm', e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : null}
            {loading ? t('loading') : t('register_submit')}
          </button>
        </form>
        <div className="auth-links" style={{ justifyContent: 'center' }}>
          <Link to="/login">{t('register_already_account')}</Link>
        </div>
      </div>
    </div>
  )
}
