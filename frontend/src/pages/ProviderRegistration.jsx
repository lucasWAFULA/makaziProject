import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerProvider } from '../api/providers'
import { useAuth } from '../context/AuthContext'

export function ProviderRegistration() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    provider_type: 'FOOD',
    business_name: '',
    contact_phone: '',
    location: '',
  })
  const [idDocument, setIdDocument] = useState(null)
  const [businessDocument, setBusinessDocument] = useState(null)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: registerProvider,
    onSuccess: () => {
      queryClient.invalidateQueries(['provider-profile'])
      navigate('/provider-dashboard')
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'Failed to register as provider. Please try again.')
    }
  })

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h2>Registration Required</h2>
        <p>You must be logged in to register as a service provider.</p>
        <button onClick={() => navigate('/login?redirect=/register-provider')} className="btn btn-primary">Log In to Continue</button>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    const data = new FormData()
    Object.entries(formData).forEach(([key, val]) => data.append(key, val))
    if (idDocument) data.append('id_document', idDocument)
    if (businessDocument) data.append('business_document', businessDocument)
      
    mutation.mutate(data)
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>Service Provider Registration</h1>
        <p className="text-muted">Fill out the details below to join the Makazi Plus ecosystem.</p>
      </header>

      <form className="card" onSubmit={handleSubmit} style={{ padding: '2rem' }}>
        {error && <div className="alert alert-danger" style={{ marginBottom: '1rem', color: 'red' }}>{error}</div>}

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Provider Category</label>
          <select 
            name="provider_type" 
            className="input" 
            value={formData.provider_type} 
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="FOOD">Food & Restaurant Services</option>
            <option value="DELIVERY">Delivery & Logistics</option>
            <option value="BUSINESS">Business & Tax Consulting</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Business / Agency Name</label>
          <input 
            type="text" 
            name="business_name" 
            className="input" 
            value={formData.business_name} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Mama Njeri Kitchen or Elite Tax Consultants"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Contact Phone</label>
          <input 
            type="text" 
            name="contact_phone" 
            className="input" 
            value={formData.contact_phone} 
            onChange={handleChange} 
            required 
            placeholder="e.g. 0712345678"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Location / Operating Area</label>
          <input 
            type="text" 
            name="location" 
            className="input" 
            value={formData.location} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Westlands, Nairobi"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <hr style={{ margin: '2rem 0', borderColor: '#eee' }} />
        <h3 style={{ marginBottom: '1rem' }}>Verification Documents</h3>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>National ID or Passport</label>
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={(e) => setIdDocument(e.target.files[0])}
            style={{ display: 'block', marginTop: '0.5rem' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label>Business Registration Document (Optional)</label>
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={(e) => setBusinessDocument(e.target.files[0])}
            style={{ display: 'block', marginTop: '0.5rem' }}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={mutation.isLoading}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          {mutation.isLoading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  )
}
