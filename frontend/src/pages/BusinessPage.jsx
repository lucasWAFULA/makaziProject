import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getApprovedProviders, createServiceRequest } from '../api/providers'
import { useAuth } from '../context/AuthContext'
import { useRef } from 'react'

// ── East Africa Country Data ───────────────────────────────────────────────────
const EA_COUNTRIES = [
  {
    code: 'ke',
    flag: '🇰🇪',
    name: 'Kenya',
    regBody: 'Business Registration Service (BRS)',
    taxBody: 'KRA',
    currency: 'KES',
    paymentMethods: ['M-Pesa', 'Airtel Money', 'Bank Transfer'],
    services: {
      tax: ['KRA PIN Registration', 'KRA PIN Updates & Retrieval', 'Tax Compliance Certificate', 'VAT Registration', 'eTIMS Registration', 'Tax Return Filing'],
      registration: ['Business Name Registration', 'Company Registration (Ltd)', 'Partnership Registration'],
      property: ['Real Estate Agency Registration', 'Short-stay & Hospitality Setup', 'Property Management License'],
    },
  },
  {
    code: 'tz',
    flag: '🇹🇿',
    name: 'Tanzania',
    regBody: 'Business Registrations and Licensing Agency (BRELA)',
    taxBody: 'TRA',
    currency: 'TZS',
    paymentMethods: ['M-Pesa Tanzania', 'Tigo Pesa', 'Airtel Money TZ', 'Bank Transfer'],
    services: {
      tax: ['TRA TIN Registration', 'VAT Registration (TRA)', 'Tax Clearance Certificate', 'e-Returns Filing'],
      registration: ['Business Name (BRELA)', 'Limited Company Registration', 'Sole Proprietorship'],
      property: ['Tourism License (TALA)', 'Hotel & BNB Licensing', 'Property Agency Setup'],
    },
  },
  {
    code: 'ug',
    flag: '🇺🇬',
    name: 'Uganda',
    regBody: 'Uganda Registration Services Bureau (URSB)',
    taxBody: 'URA',
    currency: 'UGX',
    paymentMethods: ['MTN Mobile Money', 'Airtel Money UG', 'Bank Transfer'],
    services: {
      tax: ['URA TIN Registration', 'VAT Registration', 'Tax Clearance Certificate', 'Annual Returns Filing'],
      registration: ['Business Name (URSB)', 'Company of Shares Registration', 'NGO Registration'],
      property: ['Real Estate Dealers License (REIB)', 'BNB & Guesthouse License', 'Land Title Support'],
    },
  },
  {
    code: 'rw',
    flag: '🇷🇼',
    name: 'Rwanda',
    regBody: 'Rwanda Development Board (RDB)',
    taxBody: 'RRA',
    currency: 'RWF',
    paymentMethods: ['MTN Mobile Money', 'Airtel Money RW', 'Bank Transfer'],
    services: {
      tax: ['RRA TIN Registration', 'VAT Registration', 'Annual Tax Returns', 'EBM (Electronic Billing Machine) Support'],
      registration: ['Business Registration (RDB)', 'LLC Company Formation', 'Cooperative Registration'],
      property: ['Tourism Enterprise License', 'Hotel & Lodge Registration', 'Real Estate Agency'],
    },
  },
  {
    code: 'bi',
    flag: '🇧🇮',
    name: 'Burundi',
    regBody: 'Agence de Promotion des Investissements (API)',
    taxBody: 'OBR',
    currency: 'BIF',
    paymentMethods: ['Lumitel (Econet)', 'Ecocash', 'Bank Transfer'],
    services: {
      tax: ['OBR NIF Registration', 'VAT Registration', 'Tax Clearance Certificate'],
      registration: ['RCCM Business Registration', 'Company Formation', 'Cooperative Registration'],
      property: ['Tourism & Hospitality License', 'Hotel Registration', 'Agency Setup'],
    },
  },
  {
    code: 'ss',
    flag: '🇸🇸',
    name: 'South Sudan',
    regBody: 'Business Registration Authority',
    taxBody: 'NRA',
    currency: 'SSP',
    paymentMethods: ['MTN Mobile Money', 'Zain Cash', 'Bank Transfer'],
    services: {
      tax: ['NRA TIN Registration', 'Business Tax Registration', 'Tax Compliance Certificate'],
      registration: ['Business Name Registration', 'Company Registration', 'Sole Proprietorship'],
      property: ['Hospitality Business License', 'Real Estate Agency Setup'],
    },
  },
  {
    code: 'et',
    flag: '🇪🇹',
    name: 'Ethiopia',
    regBody: 'Ministry of Trade and Regional Integration',
    taxBody: 'ERCA',
    currency: 'ETB',
    paymentMethods: ['Telebirr', 'CBE Birr', 'Bank Transfer'],
    services: {
      tax: ['ERCA TIN Registration', 'VAT Registration', 'Tax Clearance Certificate', 'Annual Returns Filing'],
      registration: ['Trade Name Registration', 'Private Limited Company (PLC)', 'Share Company Registration'],
      property: ['Tourism Investment License', 'Hotel & Hospitality License', 'Agency Registration'],
    },
  },
  {
    code: 'cd',
    flag: '🇨🇩',
    name: 'DR Congo',
    regBody: 'Agence Nationale pour la Promotion des Investissements (ANAPI)',
    taxBody: 'DGI',
    currency: 'CDF',
    paymentMethods: ['Airtel Money DRC', 'Orange Money', 'Bank Transfer'],
    services: {
      tax: ['DGI NIF Registration', 'VAT Registration', 'Tax Clearance Certificate'],
      registration: ['RCCM Business Registration', 'SARL Company Formation', 'Representative Office'],
      property: ['Tourism License (OFIDA)', 'Hotel & BNB License', 'Agency Registration'],
    },
  },
]

// ── Interactive Registration Steps ─────────────────────────────────────────────
const STEP_ACTIONS = [
  {
    id: 'signup',
    step: 1,
    icon: '👤',
    labelKey: 'biz_page_step1_label',
    descKey: 'biz_page_step1_desc',
    to: '/register',
    btnLabelKey: 'biz_page_step1_btnLabel',
    color: '#10b981',
    bgColor: 'linear-gradient(135deg, #10b981, #059669)',
    detailKey: 'biz_page_step1_detail',
  },
  {
    id: 'choose',
    step: 2,
    icon: '📋',
    labelKey: 'biz_page_step2_label',
    descKey: 'biz_page_step2_desc',
    anchor: '#services',
    btnLabelKey: 'biz_page_step2_btnLabel',
    color: '#3b82f6',
    bgColor: 'linear-gradient(135deg, #3b82f6, #1e3a5f)',
    detailKey: 'biz_page_step2_detail',
  },
  {
    id: 'upload',
    step: 3,
    icon: '📤',
    labelKey: 'biz_page_step3_label',
    descKey: 'biz_page_step3_desc',
    to: '/provider-dashboard',
    btnLabelKey: 'biz_page_step3_btnLabel',
    color: '#f59e0b',
    bgColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
    detailKey: 'biz_page_step3_detail',
  },
  {
    id: 'pay',
    step: 4,
    icon: '💳',
    labelKey: 'biz_page_step4_label',
    descKey: 'biz_page_step4_desc',
    anchor: '#services',
    btnLabelKey: 'biz_page_step4_btnLabel',
    color: '#8b5cf6',
    bgColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    detailKey: 'biz_page_step4_detail',
  },
  {
    id: 'complete',
    step: 5,
    icon: '✅',
    labelKey: 'biz_page_step5_label',
    descKey: 'biz_page_step5_desc',
    to: '/provider-dashboard',
    btnLabelKey: 'biz_page_step5_btnLabel',
    color: '#ef4444',
    bgColor: 'linear-gradient(135deg, #ef4444, #dc2626)',
    detailKey: 'biz_page_step5_detail',
  },
]

export function BusinessPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const stepSectionRef = useRef(null)

  const [activeCountry, setActiveCountry] = useState('ke')
  const [activeServiceGroup, setActiveServiceGroup] = useState('registration')
  const [selectedService, setSelectedService] = useState(null)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [inquiryDetails, setInquiryDetails] = useState({
    subject: '',
    specificDetails: '',
    phone: '',
  })
  const [activeStep, setActiveStep] = useState(null)
  const [hoveredStep, setHoveredStep] = useState(null)

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['approved-providers'],
    queryFn: getApprovedProviders,
  })

  const backendBusinessProviders = providers.filter((p) => p.provider_type === 'BUSINESS')

  const createRequestMutation = useMutation({
    mutationFn: createServiceRequest,
    onSuccess: () => {
      setInquirySuccess(true)
    },
  })

  const currentCountry = EA_COUNTRIES.find((c) => c.code === activeCountry) || EA_COUNTRIES[0]

  const handleOpenInquiryModal = (serviceName) => {
    setSelectedService(serviceName)
    setInquirySuccess(false)
    setSelectedProviderId(backendBusinessProviders[0]?.id || '')
    setInquiryDetails({
      subject: `[${currentCountry.name}] ${serviceName}`,
      specificDetails: '',
      phone: '',
    })
  }

  const handleSubmitInquiry = (e) => {
    e.preventDefault()
    if (!user) {
      navigate(`/login?redirect=/business`)
      return
    }
    let providerId = selectedProviderId
    if (!providerId) {
      if (backendBusinessProviders.length > 0) {
        providerId = backendBusinessProviders[0].id
      } else {
        setInquirySuccess(true)
        return
      }
    }
    const detailsString = JSON.stringify({
      country: currentCountry.name,
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

  const serviceGroups = [
    { id: 'registration', label: t('biz_page_group_registration'), icon: '🏢' },
    { id: 'tax', label: t('biz_page_group_tax'), icon: '📊' },
    { id: 'property', label: t('biz_page_group_property'), icon: '🏠' },
  ]

  const currentCountryName = t(currentCountry.name)
  const currentServices = currentCountry.services[activeServiceGroup] || []

  return (
    <div className="biz-page" style={{ padding: '0', maxWidth: '100%', margin: '0 auto' }}>

      {/* ── Hero ── */}
      <header
        className="biz-hero hero-animate"
        style={{
          padding: '4rem 2rem 3rem',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 60%, #0a1628 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'8\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {EA_COUNTRIES.map((c) => (
              <span key={c.code} style={{ fontSize: '1.5rem', filter: c.code === activeCountry ? 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' : 'grayscale(60%) opacity(0.7)', cursor: 'pointer', transition: 'all 0.3s', transform: c.code === activeCountry ? 'scale(1.2)' : 'scale(1)' }} title={c.name} onClick={() => setActiveCountry(c.code)}>
                {c.flag}
              </span>
            ))}
          </div>
          <span className="hero-kicker" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {t('biz_page_hero_kicker')}
          </span>
          <h1 className="hero-title" style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2 }}>
            {t('biz_page_hero_title')}
          </h1>
          <p className="hero-tagline" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            {t('biz_page_hero_tagline', { count: EA_COUNTRIES.length })}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#services" className="btn btn-primary">{t('biz_page_explore_services')}</a>
            <a href="#countries" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              {t('biz_page_select_country')}
            </a>
            <Link to="/register" className="btn btn-accent">{t('biz_page_get_started_free')}</Link>
          </div>
        </div>
      </header>

      {/* ── Trust Strip ── */}
      <div style={{ background: 'linear-gradient(90deg, #f0fdf4, #eff6ff)', borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: '🔒', label: t('biz_page_trust_secure_docs') },
            { icon: '✅', label: t('biz_page_trust_govt_compliant') },
            { icon: '📱', label: t('biz_page_trust_mobile_payments') },
            { icon: '⚡', label: t('biz_page_trust_fast_turnaround') },
            { icon: '🌍', label: t('biz_page_trust_ea_countries', { count: EA_COUNTRIES.length }) },
            { icon: '👨‍💼', label: t('biz_page_trust_certified_consultants') },
          ].map((item) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-heading)' }}>
              {item.icon} {item.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── How Registration Works (Interactive Steps) ── */}
        <section ref={stepSectionRef} className="card section-card" style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>
          <div className="section-heading centered" style={{ marginBottom: '2.5rem' }}>
            <span className="section-kicker">{t('biz_page_simple_process')}</span>
            <h2>{t('biz_page_how_reg_works')}</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{t('biz_page_how_reg_works_desc')}</p>
          </div>

          {/* Progress Bar */}
          <div className="biz-progress-bar">
            {STEP_ACTIONS.map((step, idx) => (
              <div key={step.id} className="biz-progress-step">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(activeStep === step.id ? null : step.id)
                  }}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: activeStep === step.id ? step.bgColor : hoveredStep === step.id ? step.bgColor : 'var(--color-card)',
                    border: `2px solid ${activeStep === step.id ? 'transparent' : step.color}`,
                    color: activeStep === step.id || hoveredStep === step.id ? '#fff' : step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: activeStep === step.id ? `0 6px 20px ${step.color}55` : '0 2px 8px rgba(0,0,0,0.08)',
                    transform: activeStep === step.id ? 'scale(1.15)' : 'scale(1)',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                  aria-label={t(step.labelKey)}
                >
                  {step.icon}
                  {/* Step number badge */}
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: step.color,
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    border: '2px solid var(--color-card)',
                  }}>
                    {step.step}
                  </span>
                </button>
                {idx < STEP_ACTIONS.length - 1 && (
                  <div className="biz-progress-line" style={{ background: `linear-gradient(90deg, ${STEP_ACTIONS[idx].color}, ${STEP_ACTIONS[idx + 1].color})` }} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels Row */}
          <div className="biz-step-labels">
            {STEP_ACTIONS.map((step) => (
              <button
                key={`label-${step.id}`}
                type="button"
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <small style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: activeStep === step.id ? step.color : 'var(--color-text-muted)',
                  display: 'block',
                  lineHeight: 1.3,
                  transition: 'color 0.2s',
                }}>
                  {t(step.labelKey)}
                </small>
              </button>
            ))}
          </div>

          {/* Expanded Step Detail Panel */}
          {activeStep && (() => {
            const step = STEP_ACTIONS.find((s) => s.id === activeStep)
            if (!step) return null
            return (
              <div
                className="biz-step-detail-panel"
                style={{
                  background: `linear-gradient(135deg, ${step.color}10, ${step.color}06)`,
                  border: `2px solid ${step.color}55`,
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: step.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  flexShrink: 0,
                  boxShadow: `0 6px 20px ${step.color}40`,
                }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      background: step.color,
                      color: '#fff',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                    }}>
                      {t('biz_page_step_word')} {step.step} {t('biz_page_step_of')} {STEP_ACTIONS.length}
                    </span>
                  </div>
                  <strong style={{ fontSize: '1.2rem', color: step.color, display: 'block', marginBottom: '0.5rem' }}>
                    {t(step.labelKey)}
                  </strong>
                  <p style={{ color: 'var(--color-text)', margin: '0 0 0.5rem', lineHeight: 1.6 }}>{t(step.descKey)}</p>
                  <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{t(step.detailKey)}</p>
                </div>
                <div className="biz-step-actions">
                  {step.to ? (
                    <Link
                      to={step.to}
                      className="btn btn-primary"
                      style={{
                        background: step.bgColor,
                        border: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: `0 4px 14px ${step.color}50`,
                      }}
                    >
                      {t(step.btnLabelKey)}
                    </Link>
                  ) : (
                    <a
                      href={step.anchor}
                      className="btn btn-primary"
                      style={{
                        background: step.bgColor,
                        border: 'none',
                        whiteSpace: 'nowrap',
                        boxShadow: `0 4px 14px ${step.color}50`,
                      }}
                    >
                      {t(step.btnLabelKey)}
                    </a>
                  )}
                  {step.step < STEP_ACTIONS.length && (
                    <button
                      type="button"
                      onClick={() => setActiveStep(STEP_ACTIONS[step.step].id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '0.25rem 0.5rem' }}
                    >
                      {t('biz_page_step_next')}: {t(STEP_ACTIONS[step.step].labelKey)} →
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {/* Instruction when nothing is selected */}
          {!activeStep && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {t('biz_page_step_instruction')}
            </div>
          )}

          {/* Quick action row at bottom */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <Link to="/register" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}>
              👤 {t('biz_page_step_sign_up_free')}
            </Link>
            <a href="#services" className="btn btn-secondary">
              📋 {t('biz_page_step_browse_services')}
            </a>
            <Link to="/provider-dashboard" className="btn" style={{ background: 'rgba(15,139,141,0.1)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
              📊 {t('biz_page_step_my_dashboard')}
            </Link>
          </div>
        </section>

        {/* ── Country Selector ── */}
        <section id="countries" className="card section-card" style={{ marginBottom: '2.5rem' }}>
          <div className="section-heading" style={{ marginBottom: '1.5rem' }}>
            <span className="section-kicker">{t('biz_page_coverage_kicker')}</span>
            <h2>{t('biz_page_select_your_country')}</h2>
            <p>{t('biz_page_country_desc')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {EA_COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => setActiveCountry(country.code)}
                style={{
                  background: activeCountry === country.code ? 'linear-gradient(135deg, var(--color-primary), #1e3a5f)' : 'var(--color-card)',
                  border: `2px solid ${activeCountry === country.code ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: '14px',
                  padding: '1.25rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  transform: activeCountry === country.code ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: activeCountry === country.code ? '0 6px 20px rgba(15,139,141,0.3)' : 'none',
                  color: activeCountry === country.code ? '#fff' : 'var(--color-heading)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{country.flag}</div>
                <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.25rem' }}>{t(country.name)}</strong>
                <small style={{ opacity: 0.75, fontSize: '0.75rem' }}>{t(country.regBody.split('(')[0].trim())}</small>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {country.paymentMethods.slice(0, 2).map((method) => (
                    <span key={method} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: activeCountry === country.code ? 'rgba(255,255,255,0.2)' : 'rgba(15,139,141,0.1)', borderRadius: '6px', color: activeCountry === country.code ? '#fff' : 'var(--color-primary)' }}>
                      {t(method)}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Services for Selected Country ── */}
        <section id="services" className="card section-card" style={{ marginBottom: '2.5rem' }}>
          <div className="section-heading" style={{ marginBottom: '0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span className="section-kicker">{currentCountry.flag} {currentCountryName}</span>
                <h2>{t('biz_page_services_offered')}</h2>
                <p style={{ maxWidth: '600px' }}>
                  {t('biz_page_regulated_by', { reg: t(currentCountry.regBody), tax: t(currentCountry.taxBody), payments: currentCountry.paymentMethods.map(m => t(m)).join(', ') })}
                </p>
              </div>
            </div>
          </div>

          {/* Service group tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
            {serviceGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveServiceGroup(group.id)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '50px',
                  border: '2px solid',
                  borderColor: activeServiceGroup === group.id ? 'var(--color-primary)' : 'var(--color-border)',
                  background: activeServiceGroup === group.id ? 'var(--color-primary)' : 'transparent',
                  color: activeServiceGroup === group.id ? '#fff' : 'var(--color-text)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                }}
              >
                {group.label}
              </button>
            ))}
          </div>

          <div className="biz-services-grid">
            {currentServices.map((serviceName, idx) => {
              const icons = { registration: '📝', tax: '📋', property: '🏠' }
              return (
                <article
                  key={`${currentCountry.code}-${activeServiceGroup}-${idx}`}
                  className="biz-service-card"
                  style={{ '--stagger': idx, cursor: 'pointer' }}
                  onClick={() => handleOpenInquiryModal(serviceName)}
                >
                  <span className="biz-svc-icon">{icons[activeServiceGroup] || '📄'}</span>
                  <div className="biz-svc-content">
                    <strong>{t(serviceName)}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      {t('biz_page_card_desc', { country: currentCountryName, tax: t(currentCountry.taxBody), reg: t(currentCountry.regBody.split('(')[0].trim()) })}
                    </p>
                    <button className="btn btn-accent btn-sm" style={{ marginTop: '0.75rem' }}>
                      {t('biz_page_inquire_now')}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="card section-card" style={{ marginBottom: '2.5rem' }}>
          <div className="section-heading centered" style={{ marginBottom: '2rem' }}>
            <span className="section-kicker">{t('biz_page_why_kicker')}</span>
            <h2>{t('biz_page_why_title')}</h2>
          </div>
          <div className="food-steps-grid">
            {[
              { icon: '🌍', title: t('biz_page_why_benefit1_title'), desc: t('biz_page_why_benefit1_desc', { count: EA_COUNTRIES.length }) },
              { icon: '✨', title: t('biz_page_why_benefit2_title'), desc: t('biz_page_why_benefit2_desc') },
              { icon: '👨‍💼', title: t('biz_page_why_benefit3_title'), desc: t('biz_page_why_benefit3_desc') },
              { icon: '🔒', title: t('biz_page_why_benefit4_title'), desc: t('biz_page_why_benefit4_desc') },
              { icon: '📱', title: t('biz_page_why_benefit5_title'), desc: t('biz_page_why_benefit5_desc') },
              { icon: '⚡', title: t('biz_page_why_benefit6_title'), desc: t('biz_page_why_benefit6_desc') },
            ].map((item, idx) => (
              <div key={idx} className="food-step-card" style={{ '--stagger': idx }}>
                <span className="food-step-icon">{item.icon}</span>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Partner / Register Provider CTA ── */}
        <section
          className="card section-card"
          style={{
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #1e3a5f 100%)',
            border: 'none',
            textAlign: 'center',
            padding: '3rem 2rem',
          }}
        >
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>{t('biz_page_partner_title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', maxWidth: '550px', margin: '0 auto 2rem' }}>
            {t('biz_page_partner_desc')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register-provider" className="btn btn-accent">{t('biz_page_register_provider')}</Link>
            <Link to="/contact" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
              {t('biz_page_contact_team')}
            </Link>
          </div>
        </section>

      </div>{/* /maxWidth container */}

      {/* ── Inquiry Modal ── */}
      {selectedService && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedService(null) }}
        >
          <div className="card reveal-item responsive-modal-card">
            <button
              onClick={() => setSelectedService(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'rgba(0,0,0,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--color-text)', cursor: 'pointer' }}
            >
              ✕
            </button>

            {inquirySuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>✅</span>
                <h3>{t('biz_page_inquiry_success')}</h3>
                <p style={{ margin: '1rem 0 2rem 0', color: 'var(--color-text-muted)' }}>
                  {t('biz_page_inquiry_success_desc', { service: t(selectedService), flag: currentCountry.flag, country: currentCountryName })}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedService(null)} className="btn btn-secondary">{t('biz_page_close')}</button>
                  <Link to="/provider-dashboard" className="btn btn-primary">{t('biz_page_view_dashboard')}</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry}>
                <div style={{ display: 'flex', align: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem' }}>{currentCountry.flag}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>{t('biz_page_request_service', { service: t(selectedService) })}</h3>
                    <small style={{ color: 'var(--color-text-muted)' }}>{currentCountryName} · {t(currentCountry.regBody)}</small>
                  </div>
                </div>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {t('biz_page_request_desc', { country: currentCountryName })}
                </p>

                {!user && (
                  <div style={{
                    background: 'rgba(15, 139, 141, 0.1)',
                    border: '1px solid rgba(15, 139, 141, 0.25)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    color: 'var(--color-primary)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '600'
                  }}>
                    <span>⚠️</span>
                    <span>{t('biz_page_guest_warning')}</span>
                  </div>
                )}

                {backendBusinessProviders.length > 0 && (
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>{t('biz_page_select_consultant')}</label>
                    <select
                      value={selectedProviderId}
                      onChange={(e) => setSelectedProviderId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                    >
                      {backendBusinessProviders.map((p) => (
                        <option key={p.id} value={p.id}>{p.business_name} ({p.location})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>{t('biz_page_inquiry_details')}</label>
                  <textarea
                    value={inquiryDetails.specificDetails}
                    onChange={(e) => setInquiryDetails((prev) => ({ ...prev, specificDetails: e.target.value }))}
                    required
                    placeholder={t('biz_page_inquiry_placeholder', { service: t(selectedService), country: currentCountryName })}
                    style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>{t('biz_page_contact_phone')}</label>
                  <input
                    type="tel"
                    value={inquiryDetails.phone}
                    onChange={(e) => setInquiryDetails((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="e.g. +254 712 345 678 or +255 754 000 000"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                {!user ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/login?redirect=/business`)}
                    className="btn btn-accent"
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px' }}
                  >
                    🔐 {t('biz_page_login_to_submit')}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px' }}
                    disabled={createRequestMutation.isLoading}
                  >
                    {createRequestMutation.isLoading ? t('biz_page_submitting') : t('biz_page_submit_for_country', { country: currentCountryName })}
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
