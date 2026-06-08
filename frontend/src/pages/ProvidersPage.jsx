import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function ProvidersPage() {
  const { t } = useTranslation()

  return (
    <div className="providers-page">
      <header className="biz-hero hero-animate" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
        <span className="hero-kicker">{t('prov_hero_kicker')}</span>
        <h1 className="hero-title">{t('prov_hero_title')}</h1>
        <p className="hero-tagline">{t('prov_hero_desc')}</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#how-it-works" className="btn btn-primary">{t('prov_learn_more')}</a>
          <Link to="/register-provider" className="btn btn-secondary">{t('prov_register_now')}</Link>
        </div>
      </header>

      <section className="card section-card">
        <div className="section-heading">
          <h2>{t('prov_who_can_register')}</h2>
        </div>
        <div className="grid grid-3">
          <article className="biz-service-card " style={{ '--stagger': 0 }}>
            <span className="biz-svc-icon">🍔</span>
            <div className="biz-svc-content">
              <strong>{t('prov_food_providers')}</strong>
              <ul className="service-eco-list">
                <li>{t('prov_food_li1')}</li>
                <li>{t('prov_food_li2')}</li>
                <li>{t('prov_food_li3')}</li>
                <li>{t('prov_food_li4')}</li>
              </ul>
            </div>
          </article>
          <article className="biz-service-card " style={{ '--stagger': 1 }}>
            <span className="biz-svc-icon">🛵</span>
            <div className="biz-svc-content">
              <strong>{t('prov_delivery_partners')}</strong>
              <ul className="service-eco-list">
                <li>{t('prov_delivery_li1')}</li>
                <li>{t('prov_delivery_li2')}</li>
                <li>{t('prov_delivery_li3')}</li>
              </ul>
            </div>
          </article>
          <article className="biz-service-card " style={{ '--stagger': 2 }}>
            <span className="biz-svc-icon">💼</span>
            <div className="biz-svc-content">
              <strong>{t('prov_biz_providers')}</strong>
              <ul className="service-eco-list">
                <li>{t('prov_biz_li1')}</li>
                <li>{t('prov_biz_li2')}</li>
                <li>{t('prov_biz_li3')}</li>
                <li>{t('prov_biz_li4')}</li>
                <li>{t('prov_biz_li5')}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section id="how-it-works" className="card section-card">
        <div className="section-heading">
          <h2>{t('prov_how_reg_works')}</h2>
        </div>
        <div className="biz-workflow" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 0 }}>
            <span className="biz-step-icon">📝</span>
            <strong>{t('prov_step1_label')}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('prov_step1_desc')}</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 1 }}>
            <span className="biz-step-icon">🏷️</span>
            <strong>{t('prov_step2_label')}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('prov_step2_desc')}</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 2 }}>
            <span className="biz-step-icon">📄</span>
            <strong>{t('prov_step3_label')}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('prov_step3_desc')}</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 3 }}>
            <span className="biz-step-icon">✅</span>
            <strong>{t('prov_step4_label')}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('prov_step4_desc')}</p>
          </div>
          <div className="biz-workflow-step " style={{ width: 'auto', '--stagger': 4 }}>
            <span className="biz-step-icon">🚀</span>
            <strong>{t('prov_step5_label')}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('prov_step5_desc')}</p>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="grid grid-2" style={{ gap: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '1rem' }}>{t('prov_partner_benefits')}</h2>
            <ul className="service-eco-list">
              <li>{t('prov_benefit_1')}</li>
              <li>{t('prov_benefit_2')}</li>
              <li>{t('prov_benefit_3')}</li>
              <li>{t('prov_benefit_4')}</li>
              <li>{t('prov_benefit_5')}</li>
              <li>{t('prov_benefit_6')}</li>
            </ul>
          </div>
          <div>
            <h2 style={{ marginBottom: '1rem' }}>{t('prov_requirements')}</h2>
            <ul className="service-eco-list">
              <li>{t('prov_req_1')}</li>
              <li>{t('prov_req_2')}</li>
              <li>{t('prov_req_3')}</li>
              <li>{t('prov_req_4')}</li>
              <li>{t('prov_req_5')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="biz-providers-section" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #4a90d9 100%)' }}>
        <div className="section-heading">
          <h2>{t('prov_why_partner')}</h2>
          <p>{t('prov_why_desc')}</p>
        </div>
        <div className="biz-trust-strip" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem', flexWrap: 'wrap', marginBottom: '2rem', color: 'white' }}>
          <span>🤝 {t('prov_trust_1')}</span>
          <span>🌍 {t('prov_trust_2')}</span>
          <span>⚡ {t('prov_trust_3')}</span>
          <span>🔗 {t('prov_trust_4')}</span>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register-provider" className="btn btn-primary">{t('prov_register_now')}</Link>
          <a href="https://wa.me/254725301031" className="btn btn-secondary" target="_blank" rel="noreferrer">{t('prov_contact_support')}</a>
        </div>
      </section>
    </div>
  )
}
