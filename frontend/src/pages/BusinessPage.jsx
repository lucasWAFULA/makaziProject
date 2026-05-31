import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function BusinessPage() {
  const { t } = useTranslation()

  return (
    <div className="biz-page">
      <header className="biz-hero hero-animate">
        <span className="hero-kicker">Business Registration & Tax Services</span>
        <h1 className="hero-title">Supporting Property Owners, Agents, Landlords, and Entrepreneurs</h1>
        <p className="hero-tagline">Makazi Plus helps individuals and businesses establish and manage their operations by providing access to essential registration and compliance support services.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#services" className="btn btn-primary">{t('cta_get_started', 'Explore Services')}</a>
        </div>
      </header>

      <div className="biz-trust-strip" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem', background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
        <span>🔒 Secure Documents</span>
        <span>✅ KRA Compliant</span>
        <span>📱 M-Pesa Payments</span>
        <span>🕐 Fast Turnaround</span>
      </div>

      <section className="card section-card">
        <div className="section-heading">
          <h2>{t('biz_how_it_works_title', 'How It Works')}</h2>
        </div>
        <div className="biz-workflow">
          <div className="biz-workflow-step " style={{ '--stagger': 0 }}>
            <span className="biz-step-icon">📋</span>
            <strong>{t('biz_step_1', '1. Select Service')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step " style={{ '--stagger': 1 }}>
            <span className="biz-step-icon">📤</span>
            <strong>{t('biz_step_2', '2. Upload Documents')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step " style={{ '--stagger': 2 }}>
            <span className="biz-step-icon">💳</span>
            <strong>{t('biz_step_3', '3. Make Payment')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step " style={{ '--stagger': 3 }}>
            <span className="biz-step-icon">⏳</span>
            <strong>{t('biz_step_4', '4. Processing')}</strong>
          </div>
          <span className="biz-workflow-arrow">→</span>
          <div className="biz-workflow-step " style={{ '--stagger': 4 }}>
            <span className="biz-step-icon">✅</span>
            <strong>{t('biz_step_5', '5. Completion')}</strong>
          </div>
        </div>
      </section>

      <section id="services" className="card section-card">
        <div className="section-heading">
          <h2>Services Offered</h2>
          <p>Whether you are starting a real estate agency, property management company, hospitality business, restaurant, or small enterprise, we help simplify the registration process.</p>
        </div>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Business Registration</h3>
        <div className="biz-services-grid" style={{ marginBottom: '2rem' }}>
          {[
            { icon: "📝", title: "Business Name Registration", desc: "Register your business name officially." },
            { icon: "🏢", title: "Company Registration Support", desc: "Expert guidance for setting up your company." },
            { icon: "👤", title: "Business Profile Setup", desc: "Set up your profile to attract the right clients." },
          ].map((svc, idx) => (
            <article key={`biz-${idx}`} className="biz-service-card " style={{ '--stagger': idx }}>
              <span className="biz-svc-icon">{svc.icon}</span>
              <div className="biz-svc-content">
                <strong>{svc.title}</strong>
                <p>{svc.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Tax Services</h3>
        <div className="biz-services-grid" style={{ marginBottom: '2rem' }}>
          {[
            { icon: "📋", title: "KRA PIN Registration", desc: "Get your KRA PIN registered quickly." },
            { icon: "🔍", title: "KRA PIN Updates & Retrieval", desc: "Update or retrieve your lost PIN." },
            { icon: "📄", title: "Tax Compliance Certificate", desc: "Apply for your TCC hassle-free." },
            { icon: "💼", title: "VAT Registration Guidance", desc: "Register for VAT with expert help." },
            { icon: "💻", title: "eTIMS Registration Support", desc: "Get set up on the eTIMS platform." },
            { icon: "📊", title: "Tax Return Filing", desc: "Assistance with filing your tax returns." },
          ].map((svc, idx) => (
            <article key={`tax-${idx}`} className="biz-service-card " style={{ '--stagger': idx }}>
              <span className="biz-svc-icon">{svc.icon}</span>
              <div className="biz-svc-content">
                <strong>{svc.title}</strong>
                <p>{svc.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Property and Real Estate Business Support</h3>
        <div className="biz-services-grid">
          {[
            { icon: "🔑", title: "Real Estate Agency Registration", desc: "Guidance for setting up your agency." },
            { icon: "🏠", title: "Property Management Support", desc: "Business support for property managers." },
            { icon: "🛏️", title: "Short-stay & Hospitality Setup", desc: "Assistance setting up your BNB or short-stay." },
          ].map((svc, idx) => (
            <article key={`prop-${idx}`} className="biz-service-card " style={{ '--stagger': idx }}>
              <span className="biz-svc-icon">{svc.icon}</span>
              <div className="biz-svc-content">
                <strong>{svc.title}</strong>
                <p>{svc.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <h2>Why Choose Makazi Plus?</h2>
        </div>
        <div className="food-steps-grid">
          <div className="food-step-card " style={{ '--stagger': 0 }}>
            <span className="food-step-icon">🌐</span>
            <strong>One Platform</strong>
            <p>For property and business needs.</p>
          </div>
          <div className="food-step-card " style={{ '--stagger': 1 }}>
            <span className="food-step-icon">✨</span>
            <strong>Simplified Processes</strong>
            <p>Easy registration processes.</p>
          </div>
          <div className="food-step-card " style={{ '--stagger': 2 }}>
            <span className="food-step-icon">👨‍💼</span>
            <strong>Professional Support</strong>
            <p>Expert guidance at every step.</p>
          </div>
          <div className="food-step-card " style={{ '--stagger': 3 }}>
            <span className="food-step-icon">🔒</span>
            <strong>Secure Handling</strong>
            <p>Secure document handling.</p>
          </div>
        </div>
      </section>

      <section className="biz-providers-section">
        <div className="section-heading">
          <h2>Partner with Makazi Plus</h2>
          <p>Join our network of verified professionals and grow your business.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/providers" className="btn btn-primary">Register as a Service Provider</Link>
        </div>
      </section>
    </div>
  )
}
