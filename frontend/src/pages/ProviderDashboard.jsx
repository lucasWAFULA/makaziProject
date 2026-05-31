import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { getProviderProfile } from '../api/providers'
import { useAuth } from '../context/AuthContext'

export function ProviderDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: getProviderProfile,
    retry: false, // Don't retry so we can quickly catch the 404
  })

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Please log in to view the provider dashboard.</p>
        <button onClick={() => navigate('/login?redirect=/provider-dashboard')} className="btn btn-primary">Log In</button>
      </div>
    )
  }

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading dashboard...</div>
  }

  // If 404, it means they don't have a profile
  if (error && error.response?.status === 404) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👋</span>
        <h2>Welcome to the Makazi Plus Network</h2>
        <p style={{ marginBottom: '2rem' }}>You do not have an active service provider profile yet. Register your business to start receiving requests from our users.</p>
        <Link to="/register-provider" className="btn btn-primary">Register as a Service Provider</Link>
      </div>
    )
  }

  // If there's another error (like 500/502 database connection issues)
  if (error) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>Error Loading Dashboard</h2>
        <p>There was a problem connecting to the server. Please try again later.</p>
        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '1rem' }}>{error.message || 'Unknown error occurred'}</p>
      </div>
    )
  }

  if (!profile) return null

  const isPending = profile.status === 'PENDING'
  const isApproved = profile.status === 'APPROVED'

  return (
    <div className="provider-dashboard" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Provider Dashboard</h1>
          <p className="text-muted">{profile.business_name} ({profile.provider_type}) - {profile.location}</p>
        </div>
        <div>
          <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`} style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Status: {profile.status}
          </span>
        </div>
      </header>

      {isPending && (
        <div className="alert alert-warning" style={{ padding: '1.5rem', background: '#fff3cd', color: '#856404', borderRadius: '8px', marginBottom: '2rem' }}>
          <strong>Your profile is under review.</strong> We are currently verifying your documents. Once approved, you will be able to receive service requests.
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-4" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>12</div>
          <div className="text-muted">Total Requests</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>8</div>
          <div className="text-muted">Completed</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Ksh 45,000</div>
          <div className="text-muted">Total Earnings</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>4.8 ⭐</div>
          <div className="text-muted">Average Rating</div>
        </div>
      </div>

      <div className="grid grid-3" style={{ gap: '2rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Incoming Requests</h2>
            {isApproved ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Mocked Requests */}
                <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>New Order #1024</strong>
                    <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Deliver to: Westlands, Nairobi · Ksh 1,200</p>
                  </div>
                  <button className="btn btn-primary btn-sm">Accept</button>
                </div>
                <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>New Inquiry #1025</strong>
                    <p className="text-muted" style={{ margin: '0.25rem 0 0 0' }}>Service: KRA PIN Registration · Client: John Doe</p>
                  </div>
                  <button className="btn btn-primary btn-sm">Review</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                <span style={{ fontSize: '2rem' }}>🔒</span>
                <p style={{ marginTop: '1rem', color: '#666' }}>Incoming requests will appear here once your account is approved.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }}>Update Profile</button>
              <button className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }}>Manage Services</button>
              <button className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }}>Payout Settings</button>
              <button className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }}>Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
