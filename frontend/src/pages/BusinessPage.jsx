import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getApprovedProviders, createServiceRequest } from '../api/providers'
import { useAuth } from '../context/AuthContext'

export function BusinessPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Modal State
  const [selectedService, setSelectedService] = useState(null)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [inquiryDetails, setInquiryDetails] = useState({
    subject: '',
    specificDetails: '',
    phone: '',
  })

  // Query actual providers
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['approved-providers'],
    queryFn: getApprovedProviders,
  })

  // Filter approved business providers
  const backendBusinessProviders = providers.filter(p => p.provider_type === 'BUSINESS')

  // Mutation to create ServiceRequest
  const createRequestMutation = useMutation({
    mutationFn: createServiceRequest,
    onSuccess: () => {
      setInquirySuccess(true)
    },
  })

  const handleOpenInquiryModal = (serviceName) => {
    if (!user) {
      navigate(`/login?redirect=/business`)
      return
    }
    setSelectedService(serviceName)
    setInquirySuccess(false)
    setSelectedProviderId(backendBusinessProviders[0]?.id || '')
    setInquiryDetails({
      subject: serviceName,
      specificDetails: '',
      phone: '',
    })
  }

  const handleSubmitInquiry = (e) => {
    e.preventDefault()

    // Determine provider ID
    let providerId = selectedProviderId
    if (!providerId) {
      if (backendBusinessProviders.length > 0) {
        providerId = backendBusinessProviders[0].id
      } else {
        alert("Simulating local inquiry: In production, requests are assigned to registered consultants.")
        setInquirySuccess(true)
        return
      }
    }

    // Prepare details string
    const detailsString = JSON.stringify({
      serviceSubject: inquiryDetails.subject,
      specificDetails: inquiryDetails.specificDetails,
      contactPhone: inquiryDetails.phone,
    })

    createRequestMutation.mutate({
      provider: providerId,
      service_type: 'BUSINESS',
      details: detailsString,
    })
  }

  return (
    <div className="biz-page" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="biz-hero hero-animate" style={{ marginBottom: '2rem' }}>
        <span className="hero-kicker">{t('biz_hero_kicker', 'Business Registration & Tax Services')}</span>
        <h1 className="hero-title">{t('biz_hero_title', 'Supporting Property Owners, Agents, Landlords, and Entrepreneurs')}</h1>
        <p className="hero-tagline">{t('biz_hero_tagline', 'Makazi Plus helps individuals and businesses establish and manage their operations by providing access to essential registration and compliance support services.')}</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#services" className="btn btn-primary">{t('cta_get_started', 'Explore Services')}</a>
        </div>
      </header>

      <div className="biz-trust-strip" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <span>🔒 {t('biz_trust_secure', 'Secure Documents')}</span>
        <span>✅ {t('biz_trust_kra', 'KRA Compliant')}</span>
        <span>📱 {t('biz_trust_mpesa', 'M-Pesa Payments')}</span>
        <span>🕐 {t('biz_trust_fast', 'Fast Turnaround')}</span>
      </div>

      <section className="card section-card" style={{ marginBottom: '2rem' }}>
        <div className="section-heading">
          <h2>{t('biz_how_it_works_title', 'How It Works')}</h2>
        </div>
        <div className="biz-workflow">
          <div className="biz-workflow-step" style={{ '--stagger': 0 }}>
            <span className="biz-step-icon">📋</span>
            <strong>{t('biz_step_1', '1. Select Service')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step" style={{ '--stagger': 1 }}>
            <span className="biz-step-icon">📤</span>
            <strong>{t('biz_step_2', '2. Upload Documents')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step" style={{ '--stagger': 2 }}>
            <span className="biz-step-icon">💳</span>
            <strong>{t('biz_step_3', '3. Make Payment')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step" style={{ '--stagger': 3 }}>
            <span className="biz-step-icon">⏳</span>
            <strong>{t('biz_step_4', '4. Processing')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step" style={{ '--stagger': 4 }}>
            <span className="biz-step-icon">✅</span>
            <strong>{t('biz_step_5', '5. Completion')}</strong>
          </div>
        </div>
      </section>

      <section id="services" className="card section-card" style={{ marginBottom: '2rem' }}>
        <div className="section-heading">
          <h2>{t('biz_services_title', 'Services Offered')}</h2>
          <p>{t('biz_services_desc', 'Whether you are starting a real estate agency, property management company, hospitality business, restaurant, or small enterprise, we help simplify the registration process.')}</p>
        </div>
        
        <h3 style={{ marginTop: '2.5rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>{t('biz_group_registration', 'Business Registration')}</h3>
        <div className="biz-services-grid" style={{ marginBottom: '2rem' }}>
          {[
            { key: 'name', title: t('biz_svc_name', 'Business Name Registration'), desc: t('biz_svc_name_desc', 'Register your business name officially.') },
            { key: 'company', title: t('biz_svc_company', 'Company Registration Support'), desc: t('biz_svc_company_desc', 'Expert guidance for setting up your company.') },
            { key: 'profile', title: t('biz_svc_profile', 'Business Profile Setup'), desc: t('biz_svc_profile_desc', 'Set up your profile to attract the right clients.') },
          ].map((svc, idx) => (
            <article key={`biz-${svc.key}`} className="biz-service-card" style={{ '--stagger': idx }} onClick={() => handleOpenInquiryModal(svc.title)}>
              <span className="biz-svc-icon">📝</span>
              <div className="biz-svc-content">
                <strong>{svc.title}</strong>
                <p>{svc.desc}</p>
                <button className="btn btn-accent btn-sm" style={{ marginTop: '0.75rem' }}>{t('inquire_now', 'Inquire Now')}</button>
              </div>
            </article>
          ))}
        </div>

        <h3 style={{ marginTop: '2.5rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>{t('biz_group_tax', 'Tax Services')}</h3>
        <div className="biz-services-grid" style={{ marginBottom: '2rem' }}>
          {[
            { key: 'pin', title: t('biz_svc_pin', 'KRA PIN Registration'), desc: t('biz_svc_pin_desc', 'Get your KRA PIN registered quickly.') },
            { key: 'pin_update', title: t('biz_svc_pin_update', 'KRA PIN Updates & Retrieval'), desc: t('biz_svc_pin_update_desc', 'Update or retrieve your lost PIN.') },
            { key: 'tcc', title: t('biz_svc_tcc', 'Tax Compliance Certificate'), desc: t('biz_svc_tcc_desc', 'Apply for your TCC hassle-free.') },
            { key: 'vat', title: t('biz_svc_vat', 'VAT Registration Guidance'), desc: t('biz_svc_vat_desc', 'Register for VAT with expert help.') },
            { key: 'etims', title: t('biz_svc_etims', 'eTIMS Registration Support'), desc: t('biz_svc_etims_desc', 'Get set up on the eTIMS platform.') },
            { key: 'filing', title: t('biz_svc_filing', 'Tax Return Filing'), desc: t('biz_svc_filing_desc', 'Assistance with filing your tax returns.') },
          ].map((svc, idx) => (
            <article key={`tax-${svc.key}`} className="biz-service-card" style={{ '--stagger': idx }} onClick={() => handleOpenInquiryModal(svc.title)}>
              <span className="biz-svc-icon">📋</span>
              <div className="biz-svc-content">
                <strong>{svc.title}</strong>
                <p>{svc.desc}</p>
                <button className="btn btn-accent btn-sm" style={{ marginTop: '0.75rem' }}>{t('inquire_now', 'Inquire Now')}</button>
              </div>
            </article>
          ))}
        </div>

        <h3 style={{ marginTop: '2.5rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>{t('biz_group_property', 'Property & Real Estate Support')}</h3>
        <div className="biz-services-grid">
          {[
            { key: 'agency', title: t('biz_svc_agency', 'Real Estate Agency Registration'), desc: t('biz_svc_agency_desc', 'Guidance for setting up your agency.') },
            { key: 'mgmt', title: t('biz_svc_mgmt', 'Property Management Support'), desc: t('biz_svc_mgmt_desc', 'Business support for property managers.') },
            { key: 'stay', title: t('biz_svc_stay', 'Short-stay & Hospitality Setup'), desc: t('biz_svc_stay_desc', 'Assistance setting up your BNB or short-stay.') },
          ].map((svc, idx) => (
            <article key={`prop-${svc.key}`} className="biz-service-card" style={{ '--stagger': idx }} onClick={() => handleOpenInquiryModal(svc.title)}>
              <span className="biz-svc-icon">🏠</span>
              <div className="biz-svc-content">
                <strong>{svc.title}</strong>
                <p>{svc.desc}</p>
                <button className="btn btn-accent btn-sm" style={{ marginTop: '0.75rem' }}>{t('inquire_now', 'Inquire Now')}</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-card" style={{ marginBottom: '2rem' }}>
        <div className="section-heading">
          <h2>{t('biz_why_title', 'Why Choose Makazi Plus?')}</h2>
        </div>
        <div className="food-steps-grid">
          <div className="food-step-card" style={{ '--stagger': 0 }}>
            <span className="food-step-icon">🌐</span>
            <strong>{t('biz_benefit_1_title', 'One Platform')}</strong>
            <p>{t('biz_benefit_1_desc', 'For property and business needs.')}</p>
          </div>
          <div className="food-step-card" style={{ '--stagger': 1 }}>
            <span className="food-step-icon">✨</span>
            <strong>{t('biz_benefit_2_title', 'Simplified Processes')}</strong>
            <p>{t('biz_benefit_2_desc', 'Easy registration processes.')}</p>
          </div>
          <div className="food-step-card" style={{ '--stagger': 2 }}>
            <span className="food-step-icon">👨‍💼</span>
            <strong>{t('biz_benefit_3_title', 'Professional Support')}</strong>
            <p>{t('biz_benefit_3_desc', 'Expert guidance at every step.')}</p>
          </div>
          <div className="food-step-card" style={{ '--stagger': 3 }}>
            <span className="food-step-icon">🔒</span>
            <strong>{t('biz_benefit_4_title', 'Secure Handling')}</strong>
            <p>{t('biz_benefit_4_desc', 'Secure document handling.')}</p>
          </div>
        </div>
      </section>

      <section className="biz-providers-section">
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>{t('biz_partner_title', 'Partner with Makazi Plus')}</h2>
          <p>{t('biz_partner_desc', 'Join our network of verified professionals and grow your business.')}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/register-provider" className="btn btn-primary">{t('cta_register_provider', 'Register as a Service Provider')}</Link>
        </div>
      </section>

      {/* Glassmorphic Inquiry Modal */}
      {selectedService && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card reveal-item" style={{
            maxWidth: '550px', width: '100%', padding: '2rem',
            background: 'var(--color-card)', border: '1px solid var(--color-border)',
            position: 'relative', overflowY: 'auto', maxHeight: '90vh'
          }}>
            <button 
              onClick={() => setSelectedService(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                border: 'none', background: 'none', fontSize: '1.5rem',
                color: 'var(--color-text)', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            {inquirySuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>✅</span>
                <h3>{t('inquiry_submitted_title', 'Inquiry Submitted!')}</h3>
                <p style={{ margin: '1rem 0 2rem 0' }}>
                  {t('inquiry_submitted_desc', 'Your inquiry has been successfully recorded. A verified consultant will review your documents and contact you shortly.')}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setSelectedService(null)} className="btn btn-secondary">{t('close', 'Close')}</button>
                  <Link to="/provider-dashboard" className="btn btn-primary">{t('view_dashboard', 'View Dashboard')}</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry}>
                <h3 style={{ marginBottom: '0.5rem' }}>{t('inquire_about', 'Request')} {selectedService}</h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{t('inquiry_hint', 'Submit your details, and a verified professional will begin processing.')}</p>

                {backendBusinessProviders.length > 0 && (
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>{t('select_consultant', 'Select Certified Consultant')}</label>
                    <select
                      value={selectedProviderId}
                      onChange={(e) => setSelectedProviderId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                    >
                      {backendBusinessProviders.map(p => (
                        <option key={p.id} value={p.id}>{p.business_name} ({p.location})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>{t('inquiry_details_label', 'Inquiry Details')}</label>
                  <textarea 
                    value={inquiryDetails.specificDetails}
                    onChange={(e) => setInquiryDetails(prev => ({ ...prev, specificDetails: e.target.value }))}
                    required
                    placeholder={t('inquiry_placeholder', 'e.g. Please outline your requirements, existing KRA PIN if retrieving, or company name ideas.')}
                    style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>{t('contact_phone', 'Contact Phone Number')}</label>
                  <input 
                    type="text" 
                    value={inquiryDetails.phone}
                    onChange={(e) => setInquiryDetails(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder={t('phone_placeholder', 'e.g. 0712345678')}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem' }}
                  disabled={createRequestMutation.isLoading}
                >
                  {createRequestMutation.isLoading ? t('submitting', 'Submitting...') : t('cta_get_started', 'Submit Request')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
