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
    <div className="card register-card" style={{ maxWidth: 440, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('register')}</h1>
      <p className="register-role-intro">{t('register_role_intro')}</p>
      <div className="register-role-cards" role="group" aria-label={t('role')}>
        <button
          type="button"
          className={`register-role-card ${form.role === 'customer' ? 'is-selected' : ''}`}
          onClick={() => update('role', 'customer')}
        >
          <span className="register-role-card-title">{t('register_card_customer_title')}</span>
          <span className="register-role-card-hint">{t('register_card_customer_hint')}</span>
        </button>
        <button
          type="button"
          className={`register-role-card ${form.role === 'host' ? 'is-selected' : ''}`}
          onClick={() => update('role', 'host')}
        >
          <span className="register-role-card-title">{t('register_card_owner_title')}</span>
          <span className="register-role-card-hint">{t('register_card_owner_hint')}</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="reg-name">{t('register_full_name')}</label>
          <input
            id="reg-name"
            type="text"
            value={form.first_name}
            onChange={(e) => update('first_name', e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-email">{t('email')}</label>
          <input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-phone">{t('phone_number')}</label>
          <input
            id="reg-phone"
            type="tel"
            value={form.phone_number}
            onChange={(e) => update('phone_number', e.target.value)}
            autoComplete="tel"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-pw">{t('password')}</label>
          <input
            id="reg-pw"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reg-pw2">{t('confirm_password')}</label>
          <input
            id="reg-pw2"
            type="password"
            value={form.password_confirm}
            onChange={(e) => update('password_confirm', e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t('loading') : t('register_submit')}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">{t('register_already_account')}</Link>
      </p>
    </div>
  )
}
