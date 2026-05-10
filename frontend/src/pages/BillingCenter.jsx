import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { isOwnerDashboardUser } from '../utils/authProfile'

export function BillingCenter() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const allowed = user && isOwnerDashboardUser(user)

  const [activeTab, setActiveTab] = useState('summary') // 'summary', 'pay'
  const [payForm, setPayForm] = useState({ amount: '', method: 'mpesa', reference_number: '', proof: null })
  const [payError, setPayError] = useState('')

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['billing-summary'],
    queryFn: () => api.get('billing/summary/').then(r => r.data),
    enabled: !!allowed,
  })

  const { data: commissions = [] } = useQuery({
    queryKey: ['billing-commissions'],
    queryFn: () => api.get('billing/commissions/').then(r => r.data),
    enabled: !!allowed,
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['billing-payments'],
    queryFn: () => api.get('billing/payments/').then(r => r.data),
    enabled: !!allowed,
  })

  const payMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData()
      formData.append('amount', data.amount)
      formData.append('method', data.method)
      formData.append('reference_number', data.reference_number)
      if (data.proof) formData.append('proof_image', data.proof)
      
      return api.post('billing/payments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['billing-summary'])
      queryClient.invalidateQueries(['billing-payments'])
      setActiveTab('summary')
      setPayForm({ amount: '', method: 'mpesa', reference_number: '', proof: null })
    },
    onError: (err) => setPayError(err.response?.data?.detail || 'Failed to submit payment.')
  })

  if (!user) return null
  if (!allowed) return <p>Access denied.</p>

  const totalDueKES = summary?.balances?.find(b => b.currency === 'KES')?.total || 0
  const statusDisplay = summary?.billing_status === 'active' ? '✅ Active' : `⚠️ ${summary?.billing_status}`

  return (
    <div className="billing-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="owner-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="owner-dashboard-title">Billing & Payments</h1>
          <p className="owner-dashboard-welcome">Manage your platform commissions</p>
        </div>
        <Link to="/owner-dashboard" className="btn btn-secondary btn-sm">← Back to Dashboard</Link>
      </header>

      {loadingSummary ? <p>Loading...</p> : (
        <div className="owner-stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="owner-stat-card">
            <span className="owner-stat-label">Outstanding Balance</span>
            <strong className="owner-stat-value" style={{ color: totalDueKES > 0 ? '#dc2626' : 'inherit' }}>
              KES {Number(totalDueKES).toLocaleString()}
            </strong>
          </div>
          <div className="owner-stat-card">
            <span className="owner-stat-label">Next Due Date</span>
            <strong className="owner-stat-value">
              {summary?.next_due_date ? new Date(summary.next_due_date).toLocaleDateString() : 'N/A'}
            </strong>
          </div>
          <div className="owner-stat-card">
            <span className="owner-stat-label">Account Standing</span>
            <strong className="owner-stat-value">{statusDisplay}</strong>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('summary')}>
          Ledger & History
        </button>
        <button className={`btn ${activeTab === 'pay' ? 'btn-accent' : 'btn-secondary'}`} onClick={() => setActiveTab('pay')}>
          Make a Payment
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3>Pending Commissions</h3>
          {commissions.filter(c => c.status === 'pending' || c.status === 'overdue').length === 0 ? (
            <p>No pending commissions.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Property</th>
                  <th style={{ padding: '0.5rem 0' }}>Due Date</th>
                  <th style={{ padding: '0.5rem 0' }}>Amount</th>
                  <th style={{ padding: '0.5rem 0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.filter(c => c.status === 'pending' || c.status === 'overdue').map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.5rem 0' }}>{c.property_title || 'General Referral'}</td>
                    <td style={{ padding: '0.5rem 0' }}>{new Date(c.due_date).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem 0' }}>{c.currency} {Number(c.commission_amount).toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0', color: c.status === 'overdue' ? 'red' : 'orange' }}>{c.status.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>Payment History</h3>
          {payments.length === 0 ? <p>No payments recorded.</p> : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '0.5rem 0' }}>Date</th>
                  <th style={{ padding: '0.5rem 0' }}>Method / Ref</th>
                  <th style={{ padding: '0.5rem 0' }}>Amount</th>
                  <th style={{ padding: '0.5rem 0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.5rem 0' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem 0' }}>{p.method.toUpperCase()} ({p.reference_number})</td>
                    <td style={{ padding: '0.5rem 0' }}>{p.currency} {Number(p.amount).toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0' }}>
                      {p.status === 'verified' ? '✅ Verified' : p.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'pay' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3>Submit Payment</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            MakaziPlus does not process bookings directly. Pay your commission using the details below and upload your receipt to clear your balance.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-bg-soft)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem' }}>M-Pesa Till</h4>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--color-primary)' }}>Till Number: 123456</p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>Name: MakaziPlus Ltd</p>
            </div>
            <div style={{ background: 'var(--color-bg-soft)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem' }}>Bank Transfer</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>Bank: Equity Bank</p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>Account Name: MakaziPlus Ltd</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--color-primary)' }}>Account: XXXXXXXX</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); payMutation.mutate(payForm) }}>
            {payError && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{payError}</div>}
            
            <div className="grid grid-2">
              <div className="form-group">
                <label>Amount (KES)</label>
                <input 
                  type="number" 
                  value={payForm.amount} 
                  onChange={e => setPayForm({...payForm, amount: e.target.value})} 
                  required min="1" 
                />
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select value={payForm.method} onChange={e => setPayForm({...payForm, method: e.target.value})}>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Transaction Reference Code</label>
              <input 
                type="text" 
                value={payForm.reference_number} 
                onChange={e => setPayForm({...payForm, reference_number: e.target.value})} 
                required placeholder="e.g. QFE9L..." 
              />
            </div>

            <div className="form-group">
              <label>Upload Receipt / Screenshot</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setPayForm({...payForm, proof: e.target.files[0]})} 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={payMutation.isPending}>
              {payMutation.isPending ? 'Submitting...' : 'Submit Payment for Verification'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
