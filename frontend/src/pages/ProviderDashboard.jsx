import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { getProviderProfile, getServiceRequests, updateServiceRequest } from '../api/providers'
import { useAuth } from '../context/AuthContext'

export function ProviderDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State to manage price input for accepting a request
  const [acceptingRequestId, setAcceptingRequestId] = useState(null)
  const [negotiatedPrice, setNegotiatedPrice] = useState('')

  // Fetch provider profile
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: getProviderProfile,
    retry: false,
  })

  // Fetch incoming service requests (only enabled if profile is loaded and approved)
  const isApproved = profile?.status === 'APPROVED'
  const { data: requests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['provider-requests'],
    queryFn: getServiceRequests,
    enabled: !!profile && isApproved,
  })

  // Mutation to update service request status or price
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, payload }) => updateServiceRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['provider-requests'])
      setAcceptingRequestId(null)
      setNegotiatedPrice('')
    },
    onError: (err) => {
      alert(err.response?.data?.detail || 'Failed to update request.')
    }
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

  if (isProfileLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading dashboard...</div>
  }

  // If 404, it means they don't have a profile
  if (profileError && profileError.response?.status === 404) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👋</span>
        <h2>Welcome to the Makazi Plus Network</h2>
        <p style={{ marginBottom: '2rem' }}>You do not have an active service provider profile yet. Register your business to start receiving requests from our users.</p>
        <Link to="/register-provider" className="btn btn-primary">Register as a Service Provider</Link>
      </div>
    )
  }

  // Other error cases
  if (profileError) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'red' }}>Error Loading Dashboard</h2>
        <p>There was a problem connecting to the server. Please try again later.</p>
        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '1rem' }}>{profileError.message || 'Unknown error occurred'}</p>
      </div>
    )
  }

  if (!profile) return null

  const isPending = profile.status === 'PENDING'

  // Calculate dynamic metrics based on actual database requests
  const totalRequests = requests.length
  const completedRequests = requests.filter(r => r.status === 'COMPLETED').length
  const totalEarnings = requests
    .filter(r => r.status === 'COMPLETED' && r.price)
    .reduce((sum, r) => sum + parseFloat(r.price), 0)

  // Status transitions handlers
  const handleStartAcceptFlow = (id) => {
    setAcceptingRequestId(id)
    setNegotiatedPrice('')
  }

  const handleConfirmAccept = (id) => {
    if (!negotiatedPrice) {
      alert("Please specify a price to accept the request.")
      return
    }
    updateRequestMutation.mutate({
      id,
      payload: { status: 'ACCEPTED', price: negotiatedPrice }
    })
  }

  const handleStatusUpdate = (id, newStatus) => {
    updateRequestMutation.mutate({
      id,
      payload: { status: newStatus }
    })
  }

  // Parse and display order/inquiry details
  const renderRequestDetails = (detailsString) => {
    try {
      const data = JSON.parse(detailsString)
      return (
        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
          {data.items && (
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Items Ordered:</strong> {data.items.join(', ')}</p>
          )}
          {data.serviceSubject && (
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Inquiry Service:</strong> {data.serviceSubject}</p>
          )}
          {data.specificDetails && (
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Specific Details:</strong> {data.specificDetails}</p>
          )}
          {data.specialInstructions && (
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Special Instructions:</strong> {data.specialInstructions}</p>
          )}
          {data.deliveryLocation && (
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Delivery Location:</strong> {data.deliveryLocation}</p>
          )}
          {data.contactPhone && (
            <p style={{ margin: '0' }}><strong>Contact Phone:</strong> {data.contactPhone}</p>
          )}
        </div>
      )
    } catch (e) {
      // Fallback if not stringified JSON
      return <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>{detailsString}</p>
    }
  }

  return (
    <div className="provider-dashboard" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Provider Dashboard</h1>
          <p className="text-muted">{profile.business_name} ({profile.provider_type}) — {profile.location}</p>
        </div>
        <div>
          <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`} style={{ padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 'bold' }}>
            Status: {profile.status}
          </span>
        </div>
      </header>

      {isPending && (
        <div className="alert alert-warning" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '8px', marginBottom: '2rem' }}>
          <strong>Your profile is under review.</strong> We are currently verifying your documents. Once approved, you will be able to receive and manage service requests in real-time.
        </div>
      )}

      {/* Dynamic Metrics Grid */}
      <div className="grid grid-4" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{totalRequests}</div>
          <div className="text-muted" style={{ marginTop: '0.25rem' }}>Total Requests</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{completedRequests}</div>
          <div className="text-muted" style={{ marginTop: '0.25rem' }}>Completed Orders</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Ksh {totalEarnings.toLocaleString()}</div>
          <div className="text-muted" style={{ marginTop: '0.25rem' }}>Total Earnings</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>4.8 ⭐</div>
          <div className="text-muted" style={{ marginTop: '0.25rem' }}>Average Rating</div>
        </div>
      </div>

      <div className="grid grid-3" style={{ gap: '2rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Incoming Requests</h2>
            
            {isApproved ? (
              isRequestsLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading incoming requests...</div>
              ) : requests.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dotted var(--color-border)' }}>
                  <span style={{ fontSize: '2.5rem' }}>🔔</span>
                  <p style={{ marginTop: '1rem', color: '#888' }}>You have no incoming requests at the moment.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {requests.map((req) => (
                    <div key={req.id} style={{ border: '1px solid var(--color-border)', padding: '1.5rem', borderRadius: '10px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem' }}>Order #{req.id} — {req.customer_name || req.customer_email}</strong>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }} className="text-muted">
                            Submitted on {new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`badge badge-sm ${
                          req.status === 'PENDING' ? 'badge-warning' :
                          req.status === 'ACCEPTED' ? 'badge-info' :
                          req.status === 'IN_PROGRESS' ? 'badge-primary' :
                          req.status === 'COMPLETED' ? 'badge-success' :
                          'badge-danger'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      {renderRequestDetails(req.details)}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          {req.price ? (
                            <span style={{ fontSize: '1.1rem' }}><strong>Price / Fee:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Ksh {parseFloat(req.price).toLocaleString()}</span></span>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Price not set yet</span>
                          )}
                        </div>

                        {/* Interactive Status transition controls */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {req.status === 'PENDING' && (
                            <>
                              {acceptingRequestId === req.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input 
                                    type="number"
                                    placeholder="Price in KES"
                                    value={negotiatedPrice}
                                    onChange={(e) => setNegotiatedPrice(e.target.value)}
                                    style={{ padding: '0.4rem', width: '120px', borderRadius: '4px', border: '1px solid var(--color-primary)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                                  />
                                  <button onClick={() => handleConfirmAccept(req.id)} className="btn btn-primary btn-sm">Confirm</button>
                                  <button onClick={() => setAcceptingRequestId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => handleStartAcceptFlow(req.id)} className="btn btn-primary btn-sm">Accept Request</button>
                                  <button onClick={() => handleStatusUpdate(req.id, 'REJECTED')} className="btn btn-secondary btn-sm">Reject</button>
                                </>
                              )}
                            </>
                          )}
                          {req.status === 'ACCEPTED' && (
                            <button onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')} className="btn btn-primary btn-sm">Mark In-Progress</button>
                          )}
                          {req.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleStatusUpdate(req.id, 'COMPLETED')} className="btn btn-success btn-sm">Mark Completed</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '2.5rem' }}>🔒</span>
                <p style={{ marginTop: '1rem', color: '#888' }}>Incoming service requests will appear here once your provider profile is approved.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1.25rem', fontSize: '1.3rem' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => alert("Profile updates coming soon.")} className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }}>Update Profile</button>
              <button onClick={() => alert("Service catalog customization coming soon.")} className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }}>Manage Services</button>
              <button onClick={() => alert("M-Pesa payout settings coming soon.")} className="btn btn-secondary" style={{ width: '100%', textAlign: 'left' }}>Payout Settings</button>
              <Link to="/contact" className="btn btn-secondary" style={{ width: '100%', textAlign: 'left', display: 'block', textDecoration: 'none' }}>Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
