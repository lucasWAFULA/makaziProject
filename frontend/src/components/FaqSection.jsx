import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function FaqSection() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(null)

  const faqKeys = [
    { category: "General", q: "faq_q_1", a: "faq_a_1" },
    { category: "General", q: "faq_q_2", a: "faq_a_2" },
    { category: "General", q: "faq_q_3", a: "faq_a_3" },
    { category: "Booking", q: "faq_q_4", a: "faq_a_4" },
    { category: "Booking", q: "faq_q_5", a: "faq_a_5" },
    { category: "Trust", q: "faq_q_6", a: "faq_a_6" },
    { category: "Regional", q: "faq_q_7", a: "faq_a_7" },
    { category: "Regional", q: "faq_q_8", a: "faq_a_8" },
    { category: "Services", q: "faq_q_9", a: "faq_a_9" },
    { category: "Services", q: "faq_q_10", a: "faq_a_10" }
  ]

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section" style={{ padding: '4rem 1rem', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontFamily: 'var(--font-heading)', color: 'var(--color-heading)' }}>
            {t('faq_title', 'Frequently Asked Questions')}
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {t('faq_subtitle', 'Everything you need to know about MakaziPlus.')}
          </p>
        </div>

        <div className="faq-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqKeys.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className={`faq-card ${isOpen ? 'is-open' : ''}`}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  border: isOpen ? '1px solid var(--color-primary)' : '1px solid #e2e8f0',
                  boxShadow: isOpen ? '0 4px 12px rgba(15, 139, 141, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <button 
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '16px',
                    color: isOpen ? 'var(--color-primary)' : 'var(--color-heading)'
                  }}
                >
                  {t(faq.q)}
                  <span style={{ fontSize: '20px', transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>
                    +
                  </span>
                </button>
                <div 
                  style={{
                    maxHeight: isOpen ? '500px' : '0',
                    opacity: isOpen ? 1 : 0,
                    padding: isOpen ? '0 1.5rem 1.25rem' : '0 1.5rem',
                    transition: 'all 0.3s ease',
                    color: 'var(--color-text-muted)',
                    lineHeight: '1.6'
                  }}
                >
                  <p style={{ margin: 0 }}>{t(faq.a)}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{t('faq_still_need_help', 'Still need help?')}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{t('faq_support_team', 'Our team is always here for you.')}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-secondary">{t('faq_contact_support', 'Contact Support')}</Link>
            <a href="https://wa.me/254725301031" target="_blank" rel="noreferrer" className="btn btn-accent">{t('faq_whatsapp_us', 'WhatsApp Us')}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
