import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function ProvidersPage() {
  const { t } = useTranslation()

  return (
    <div className="providers-page">
      <header className="biz-hero hero-animate" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
        <span className="hero-kicker">Service Provider Registration</span>
        <h1 className="hero-title">Become a Service Provider on Makazi Plus</h1>
        <p className="hero-tagline">Join Our Network of Trusted Service Partners. We connect customers with reliable professionals across housing, food delivery, and essential business services.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#how-it-works" className="btn btn-primary">Learn More</a>
          <Link to="/register-provider" className="btn btn-secondary">Register Now</Link>
        </div>
      </header>

      <section className="card section-card">
        <div className="section-heading">
          <h2>Who Can Register?</h2>
        </div>
        <div className="grid grid-3">
          <article className="biz-service-card " style={{ '--stagger': 0 }}>
            <span className="biz-svc-icon">🍔</span>
            <div className="biz-svc-content">
              <strong>Food Service Providers</strong>
              <ul className="service-eco-list">
                <li>Restaurants</li>
                <li>Cafés and fast-food outlets</li>
                <li>Grocery and food vendors</li>
                <li>Catering businesses</li>
              </ul>
            </div>
          </article>
          <article className="biz-service-card " style={{ '--stagger': 1 }}>
            <span className="biz-svc-icon">🛵</span>
            <div className="biz-svc-content">
              <strong>Delivery Partners</strong>
              <ul className="service-eco-list">
                <li>Motorcycle riders</li>
                <li>Car delivery operators</li>
                <li>Logistics and courier services</li>
              </ul>
            </div>
          </article>
          <article className="biz-service-card " style={{ '--stagger': 2 }}>
            <span className="biz-svc-icon">💼</span>
            <div className="biz-svc-content">
              <strong>Business Service Providers</strong>
              <ul className="service-eco-list">
                <li>Business registration agents</li>
                <li>Tax consultants</li>
                <li>KRA compliance agents</li>
                <li>eCitizen service agents</li>
                <li>Administrative service providers</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="card section-card">
        <div className="section-heading">
          <h2>How Registration Works</h2>
        </div>
        <div className="biz-workflow" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 0 }}>
            <span className="biz-step-icon">📝</span>
            <strong>Step 1: Sign Up</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Create an account with basic details.</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 1 }}>
            <span className="biz-step-icon">🏷️</span>
            <strong>Step 2: Select Category</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Food, Delivery, or Business services.</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 2 }}>
            <span className="biz-step-icon">📄</span>
            <strong>Step 3: Submit Docs</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Provide ID and business details.</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 3 }}>
            <span className="biz-step-icon">✅</span>
            <strong>Step 4: Activation</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Profile becomes active once verified.</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 4 }}>
            <span className="biz-step-icon">🚀</span>
            <strong>Step 5: Receive Requests</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Begin receiving customer orders.</p>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '1rem' }}>What You Get as a Partner</h2>
            <ul className="service-eco-list">
              <li>Access to new customers through Makazi Plus</li>
              <li>Increased visibility for your services</li>
              <li>Flexible work opportunities</li>
              <li>Direct service requests from users</li>
              <li>Secure payment handling options</li>
              <li>Growth opportunities across multiple service categories</li>
            </ul>
          </div>
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Requirements</h2>
            <ul className="service-eco-list">
              <li>National ID or Passport</li>
              <li>Business registration documents (if applicable)</li>
              <li>Valid contact information</li>
              <li>Location details</li>
              <li>Proof of service capability</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="biz-providers-section" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #4a90d9 100%)' }}>
        <div className="section-heading">
          <h2>Why Partner With Makazi Plus?</h2>
          <p>Makazi Plus is designed to grow with local communities by connecting people to essential services in one place. As a service provider, you become part of a growing ecosystem that supports housing, convenience, and business growth.</p>
        </div>
        <div className="biz-trust-strip" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem', flexWrap: 'wrap', marginBottom: '2rem', color: 'white' }}>
          <span>🤝 Trust and reliability</span>
          <span>🌍 Local service empowerment</span>
          <span>⚡ Fast service matching</span>
          <span>🔗 Long-term relationships</span>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register-provider" className="btn btn-primary">Register Now</Link>
          <a href="https://wa.me/254725301031" className="btn btn-secondary" target="_blank" rel="noreferrer">Contact Support</a>
        </div>
      </section>
    </div>
  )
}
