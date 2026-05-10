import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const WHATSAPP_NUMBER = '254725301031'
const WHATSAPP_DISPLAY = '+254 725 301 031'

const channels = [
  {
    id: 'support',
    titleKey: 'contact_support_title',
    hintKey: 'contact_support_hint',
    emails: ['support@makazi-plus.com'],
  },
  {
    id: 'bookings',
    titleKey: 'contact_bookings_title',
    hintKey: 'contact_bookings_hint',
    emails: ['bookings@makazi-plus.com'],
  },
  {
    id: 'hosts',
    titleKey: 'contact_hosts_title',
    hintKey: 'contact_hosts_hint',
    emails: ['hosts@makazi-plus.com'],
  },
  {
    id: 'legal',
    titleKey: 'contact_legal_privacy_title',
    hintKey: 'contact_legal_privacy_hint',
    emails: ['legal@makazi-plus.com', 'privacy@makazi-plus.com'],
  },
]

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
      <path fill="currentColor" d="M8.6 5.6 7.2 7l5 5-5 5 1.4 1.4 6.4-6.4z" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m1 17h-2v-2h2zm2.07-7.75-.9.92A3.4 3.4 0 0 0 13 14.5v.5h-2v-.5a3.4 3.4 0 0 1 1.17-2.55l1.24-1.26A2 2 0 0 0 12 7.5a2 2 0 0 0-2 2H8a4 4 0 1 1 7.07 2.75"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      <path fill="currentColor" d="m12 10.6 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
      <path
        fill="currentColor"
        d="M12.04 2C6.6 2 2.2 6.4 2.2 11.83c0 1.9.55 3.76 1.59 5.36L2 22l5-1.73a9.8 9.8 0 0 0 5.03 1.39h.01c5.43 0 9.84-4.4 9.84-9.83S17.47 2 12.04 2m0 17.9a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-2.96 1.03.97-2.9-.2-.3a8.07 8.07 0 1 1 6.62 3.48m4.43-6.04c-.24-.12-1.42-.7-1.64-.78s-.38-.12-.54.12-.62.78-.75.94-.28.18-.52.06a6.66 6.66 0 0 1-1.96-1.2 7.38 7.38 0 0 1-1.36-1.7c-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.13.16-.24.24-.4s.04-.31-.02-.43c-.06-.12-.54-1.3-.73-1.79-.19-.45-.39-.39-.54-.4h-.46c-.16 0-.42.06-.65.3-.22.24-.84.82-.84 2s.86 2.33.98 2.49 1.69 2.57 4.09 3.61c.57.25 1.02.4 1.37.5.58.18 1.11.16 1.52.1.46-.07 1.42-.58 1.62-1.13s.2-1.04.14-1.13-.22-.15-.46-.27"
      />
    </svg>
  )
}

export function SupportWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const toggleSection = (id) => setExpanded((current) => (current === id ? null : id))
  const closeAfterAction = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        className={`support-fab ${open ? 'is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label={t('support_open_label')}
        aria-expanded={open}
        aria-controls={titleId}
      >
        <span className="support-fab-icon"><HelpIcon /></span>
        <span className="support-fab-label">{t('support_fab_label')}</span>
      </button>

      {open && (
        <div className="support-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            type="button"
            className="support-overlay-backdrop"
            aria-label={t('support_close_label')}
            onClick={() => setOpen(false)}
          />
          <aside className="support-panel">
            <header className="support-panel-head">
              <div>
                <span className="support-panel-kicker">{t('support_panel_kicker')}</span>
                <h2 id={titleId}>{t('support_panel_title')}</h2>
              </div>
              <button
                type="button"
                className="support-panel-close"
                onClick={() => setOpen(false)}
                aria-label={t('support_close_label')}
              >
                <CloseIcon />
              </button>
            </header>

            <div className="support-panel-body">
              <a
                className="support-whatsapp-cta"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                onClick={closeAfterAction}
              >
                <WhatsAppIcon />
                <span>
                  <strong>{t('contact_whatsapp_title')}</strong>
                  <small>{WHATSAPP_DISPLAY}</small>
                </span>
              </a>

              <ul className="support-accordion">
                {channels.map((channel) => {
                  const isOpen = expanded === channel.id
                  return (
                    <li key={channel.id} className={isOpen ? 'is-open' : ''}>
                      <button
                        type="button"
                        className="support-accordion-trigger"
                        onClick={() => toggleSection(channel.id)}
                        aria-expanded={isOpen}
                      >
                        <span>{t(channel.titleKey)}</span>
                        <span className="support-accordion-chevron"><ChevronIcon /></span>
                      </button>
                      {isOpen && (
                        <div className="support-accordion-panel">
                          <p>{t(channel.hintKey)}</p>
                          <div className="support-accordion-emails">
                            {channel.emails.map((email) => (
                              <a key={email} href={`mailto:${email}`} onClick={closeAfterAction}>
                                {email}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className="support-response">
                <strong>{t('support_response_title')}</strong>
                <ul>
                  <li>{t('support_response_whatsapp')}</li>
                  <li>{t('support_response_email')}</li>
                  <li>{t('support_response_legal')}</li>
                </ul>
              </div>

              <div className="support-panel-footer">
                <Link to="/contact" onClick={closeAfterAction}>{t('support_full_page_link')}</Link>
                <span>·</span>
                <Link to="/privacy" onClick={closeAfterAction}>{t('footer_privacy')}</Link>
                <span>·</span>
                <Link to="/terms" onClick={closeAfterAction}>{t('footer_terms')}</Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
