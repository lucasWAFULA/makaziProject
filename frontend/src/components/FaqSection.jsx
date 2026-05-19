import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const faqs = [
  {
    category: "General",
    q: "What is MakaziPlus?",
    a: "MakaziPlus is an East African stay, travel, and lifestyle discovery platform designed to connect people with authentic local experiences across the region. The platform brings together accommodation, transport access, food delivery, tours, and trusted local services in one place while embracing the culture, hospitality, and diversity of East Africa. From beachfront stays in Zanzibar and safari lodges in Tanzania to city apartments in Nairobi, Kigali, Kampala, and Addis Ababa, MakaziPlus helps travelers, residents, and diaspora communities discover places and services that reflect local lifestyles and traditions."
  },
  {
    category: "General",
    q: "Does MakaziPlus own the listed properties?",
    a: "No. Properties listed on MakaziPlus are owned or managed by independent hosts, agents, hotels, and property managers."
  },
  {
    category: "General",
    q: "Does MakaziPlus handle accommodation payments?",
    a: "No. MakaziPlus connects customers directly with hosts or agents. Payments are arranged directly between both parties unless otherwise specified by the listing provider."
  },
  {
    category: "Booking",
    q: "How do I book a stay?",
    a: "Browse listings, select your preferred property, then contact the host or agent directly through WhatsApp, phone call, or booking request options provided on the listing."
  },
  {
    category: "Booking",
    q: "Can I contact the host before booking?",
    a: "Yes. MakaziPlus allows users to contact hosts and agents directly before confirming any booking arrangements."
  },
  {
    category: "Trust",
    q: "Are listings verified?",
    a: "MakaziPlus works to verify agents, businesses, and selected listings to improve trust and user safety. Verified listings are marked accordingly on the platform."
  },
  {
    category: "Regional",
    q: "Which countries does MakaziPlus support?",
    a: "MakaziPlus supports listings and travel services across East Africa, including Kenya, Tanzania, Uganda, Rwanda, Ethiopia, and other expanding regional markets."
  },
  {
    category: "Regional",
    q: "Can I view prices in my local currency?",
    a: "Yes. MakaziPlus supports multiple currencies including USD, KES, TZS, UGX, RWF, and ETB for easier price estimation and comparison."
  },
  {
    category: "Services",
    q: "Does MakaziPlus provide transport services?",
    a: "MakaziPlus connects users with third-party transport providers such as Uber, Bolt, airport transfer companies, and local mobility services depending on the location."
  },
  {
    category: "Services",
    q: "Can I order food or groceries through MakaziPlus?",
    a: "MakaziPlus provides access to nearby food delivery, grocery, and convenience services through regional partners and referral links where available."
  }
]

export function FaqSection() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState(null)

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq-section" style={{ padding: '4rem 1rem', background: '#f8fafc' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontFamily: 'var(--font-heading)', color: 'var(--color-heading)' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Everything you need to know about MakaziPlus.
          </p>
        </div>

        <div className="faq-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
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
                  {faq.q}
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
                  <p style={{ margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Still need help?</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Our team is always here for you.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-secondary">Contact Support</Link>
            <a href="https://wa.me/254725301031" target="_blank" rel="noreferrer" className="btn btn-accent">WhatsApp Us</a>
          </div>
        </div>
      </div>
    </section>
  )
}
