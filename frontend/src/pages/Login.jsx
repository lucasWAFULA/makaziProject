import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { login, setTokens } from '../api/auth'

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { loginSuccess } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      setTokens(data.access, data.refresh)
      loginSuccess(data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: '2rem auto', padding: '1.5rem' }}>
      <h1 style={{ marginTop: 0 }}>{t('login')}</h1>
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
      <p style={{ marginTop: '1rem' }}><Link to="/register">{t('register')}</Link></p>
    </div>
  )
}
