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
      setError(err.response?.data?.detail || err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('login')}</h1>
      {banner ? (
        <p className="login-success-banner" role="status">
          {banner}
        </p>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t('email')} / Username</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </div>
        <div className="form-group">
          <label>{t('password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? t('loading') : t('login')}</button>
      </form>
      <p style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Link to="/register">{t('register')}</Link>
        <Link to="/forgot-password">{t('forgot_password_link')}</Link>
      </p>
    </div>
  )
}
