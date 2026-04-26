import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { register as apiRegister, login, setTokens } from '../api/auth'

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { loginSuccess } = useAuth()
  const [form, setForm] = useState({
    username: '', email: '', phone_number: '', password: '', password_confirm: '', role: 'guest'
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
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await apiRegister(form)
      const data = await login(form.username, form.password)
      setTokens(data.access, data.refresh)
      loginSuccess(data.user)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'object' ? JSON.stringify(msg) : (msg || err.message || t('error')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('register')}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={form.username} onChange={(e) => update('username', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('email')}</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('phone_number')}</label>
          <input type="tel" value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('password')}</label>
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('confirm_password')}</label>
          <input type="password" value={form.password_confirm} onChange={(e) => update('password_confirm', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('role')}</label>
          <select value={form.role} onChange={(e) => update('role', e.target.value)}>
            <option value="guest">{t('role_guest')}</option>
            <option value="host">{t('role_host')}</option>
          </select>
        </div>
        {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? t('loading') : t('submit')}</button>
      </form>
      <p style={{ marginTop: '1rem' }}><Link to="/login">{t('login')}</Link></p>
    </div>
  )
}
