import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const channels = [
  {
    id: 'support',
    email: 'support@makazi-plus.com',
    titleKey: 'contact_support_title',
    hintKey: 'contact_support_hint',
  },
  {
    id: 'bookings',
    email: 'bookings@makazi-plus.com',
    titleKey: 'contact_bookings_title',
    hintKey: 'contact_bookings_hint',
  },
  {
    id: 'hosts',
    email: 'hosts@makazi-plus.com',
    titleKey: 'contact_hosts_title',
    hintKey: 'contact_hosts_hint',
  },
  {
    id: 'legal',
    email: 'legal@makazi-plus.com',
    titleKey: 'contact_legal_title',
    hintKey: 'contact_legal_hint',
  },
  {
    id: 'privacy',
    email: 'privacy@makazi-plus.com',
    titleKey: 'contact_privacy_title',
    hintKey: 'contact_privacy_hint',
  },
]

export function Contact() {
  const { t } = useTranslation()
  return (
    <div className="page-stack" style={{ maxWidth: 1080, margin: '0 auto' }}>
      <section className="card section-card contact-section" id="contact">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t('contact_kicker')}</span>
            <h1 style={{ marginTop: 6 }}>{t('contact_title')}</h1>
            <p>{t('contact_subtitle')}</p>
          </div>
        </div>
        <div className="contact-grid">
          {channels.map((channel) => (
            <a key={channel.id} className="contact-card" href={`mailto:${channel.email}`}>
              <strong>{t(channel.titleKey)}</strong>
              <span>{channel.email}</span>
              <small>{t(channel.hintKey)}</small>
            </a>
          ))}
          <a className="contact-card" href="https://wa.me/254725301031" target="_blank" rel="noreferrer">
            <strong>{t('contact_whatsapp_title')}</strong>
            <span>+254 725 301 031</span>
            <small>{t('contact_whatsapp_hint')}</small>
          </a>
          <a className="contact-card" href="tel:+254725301031">
            <strong>{t('contact_phone_title')}</strong>
            <span>+254 725 301 031</span>
            <small>{t('contact_phone_hint')}</small>
          </a>
        </div>
      </section>

      <section className="card section-card">
        <h2 style={{ marginTop: 0 }}>{t('contact_response_title')}</h2>
        <p>{t('contact_response_body')}</p>
        <ul style={{ lineHeight: 1.8 }}>
          <li>{t('contact_response_li1')}</li>
          <li>{t('contact_response_li2')}</li>
          <li>{t('contact_response_li3')}</li>
        </ul>
        <p style={{ marginTop: '1rem' }}>
          {t('contact_legal_links_intro')}{' '}
          <Link to="/terms">{t('footer_terms')}</Link>{' · '}
          <Link to="/privacy">{t('footer_privacy')}</Link>{' · '}
          <Link to="/dispute-policy">{t('menu_dispute_policy', 'Dispute Policy')}</Link>
        </p>
      </section>
    </div>
  )
}
