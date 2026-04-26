import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { ChatWidget } from './ChatWidget'

function WhatsAppIcon() {
  return (
    <svg className="icon icon-social" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.6 2 2.2 6.4 2.2 11.83c0 1.9.55 3.76 1.59 5.36L2 22l5-1.73a9.8 9.8 0 0 0 5.03 1.39h.01c5.43 0 9.84-4.4 9.84-9.83S17.47 2 12.04 2m0 17.9a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-2.96 1.03.97-2.9-.2-.3a8.07 8.07 0 1 1 6.62 3.48m4.43-6.04c-.24-.12-1.42-.7-1.64-.78s-.38-.12-.54.12-.62.78-.75.94-.28.18-.52.06a6.66 6.66 0 0 1-1.96-1.2 7.38 7.38 0 0 1-1.36-1.7c-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.13.16-.24.24-.4s.04-.31-.02-.43c-.06-.12-.54-1.3-.73-1.79-.19-.45-.39-.39-.54-.4h-.46c-.16 0-.42.06-.65.3-.22.24-.84.82-.84 2s.86 2.33.98 2.49 1.69 2.57 4.09 3.61c.57.25 1.02.4 1.37.5.58.18 1.11.16 1.52.1.46-.07 1.42-.58 1.62-1.13s.2-1.04.14-1.13-.22-.15-.46-.27"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="icon icon-social" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.25.2 2.25.2v2.45H15.2c-1.26 0-1.65.78-1.65 1.58V12h2.8l-.45 2.88h-2.35v6.99A10 10 0 0 0 22 12"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="icon icon-social" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 2h2.95l-6.45 7.37L23 22h-6.06l-4.75-6.2L6.77 22H3.82l6.9-7.89L1 2h6.2l4.3 5.66zM17.87 20.24h1.63L6.32 3.67H4.57z"
      />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg className="icon icon-social" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.6 2a5.5 5.5 0 0 0 3.26 3.8v2.88a8.3 8.3 0 0 1-3.2-.79v6.02a6.3 6.3 0 1 1-6.31-6.31c.4 0 .8.04 1.18.12v3.1a3.2 3.2 0 1 0 2.04 3v-12z"
      />
    </svg>
  )
}

export function Layout({ children }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const bookingMenu = [
    { label: 'Airport Pickup + Stay', to: '/booking/airport-pickup-stay' },
    { label: 'Beach Holiday Packages', to: '/booking/beach-holiday-packages' },
    { label: 'Family Vacation Packages', to: '/booking/family-vacation-packages' },
    { label: 'Honeymoon Packages', to: '/booking/honeymoon-packages' },
    { label: 'Weekend Getaways', to: '/booking/weekend-getaways' },
    { label: 'Executive Business Stay', to: '/booking/executive-business-stay' },
  ]
  const agentMenu = [
    { label: 'Verified Agents', to: '/agents/verified' },
    { label: 'Apartments for Rent', to: '/agents/apartments' },
    { label: 'Houses for Sale', to: '/agents/houses' },
    { label: 'Land for Sale', to: '/agents/land' },
    { label: 'Commercial Space', to: '/agents/commercial' },
  ]
  const hotelsMenu = [
    { label: 'Budget Rooms', to: '/stays/budget-rooms' },
    { label: 'Beach Villas', to: '/stays/beach-villas' },
    { label: 'Apartments', to: '/stays/apartments' },
    { label: 'Luxury Hotels', to: '/stays/luxury-hotels' },
    { label: 'Near Airport', to: '/stays/near-airport' },
    { label: 'Near SGR', to: '/stays/near-sgr' },
  ]
  const guideMenu = [
    { label: 'How to Book', href: '/#guides' },
    { label: 'Airport Transfers', href: '/#guides' },
    { label: 'Ferry Crossing Tips', href: '/#guides' },
    { label: 'Tanzania Visa Info', href: '/#guides' },
    { label: 'Currency Exchange Tips', href: '/#guides' },
    { label: 'Safe Travel Advice', href: '/#guides' },
  ]

  const switchLanguage = () => {
    const nextLang = i18n.language === 'sw' ? 'en' : i18n.language === 'en' ? 'tz' : 'sw'
    i18n.changeLanguage(nextLang)
  }

  return (
    <div className="app-layout">
      <div className="quick-actions">
        <a href="tel:+255700000111">{t('quick_call')}</a>
        <a href="https://wa.me/255700000111" target="_blank" rel="noreferrer">{t('quick_whatsapp')}</a>
        <a href="https://maps.google.com/?q=Mombasa" target="_blank" rel="noreferrer">{t('quick_directions')}</a>
      </div>

      <nav className="nav nav-main">
        <div className="nav-row">
          <Link to="/" className="nav-brand" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="" className="nav-logo" onError={(e) => { e.target.style.display = 'none' }} />
            <span className="nav-name">{t('app_name')}</span>
          </Link>
          <span className="nav-tagline">{t('tagline')}</span>
          <button type="button" className="mobile-menu-btn" onClick={() => setMobileOpen((prev) => !prev)}>
            {mobileOpen ? '×' : '☰'}
          </button>
        </div>

        <div className={`nav-menu ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>{t('home')}</Link>
          <Link to="/stays/apartments" className="nav-link" onClick={() => setMobileOpen(false)}>{t('menu_stays')}</Link>
          <details className="nav-dropdown">
            <summary>{t('menu_booking')}</summary>
            <div className="nav-dropdown-menu">
              {bookingMenu.map((item) => <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)}>{item.label}</Link>)}
            </div>
          </details>
          <details className="nav-dropdown">
            <summary>{t('menu_agents')}</summary>
            <div className="nav-dropdown-menu">
              {agentMenu.map((item) => <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)}>{item.label}</Link>)}
            </div>
          </details>
          <details className="nav-dropdown">
            <summary>{t('menu_hotels')}</summary>
            <div className="nav-dropdown-menu">
              {hotelsMenu.map((item) => <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)}>{item.label}</Link>)}
            </div>
          </details>
          <details className="nav-dropdown">
            <summary>{t('menu_guide')}</summary>
            <div className="nav-dropdown-menu">
              {guideMenu.map((item) => <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</a>)}
            </div>
          </details>
          <a href="/#contact" className="nav-link" onClick={() => setMobileOpen(false)}>{t('menu_contact')}</a>
          <Link to="/taxi" className="nav-link" onClick={() => setMobileOpen(false)}>{t('taxi_booking')}</Link>
          {user && <Link to="/bookings" className="nav-link" onClick={() => setMobileOpen(false)}>{t('my_bookings')}</Link>}
          {user?.role === 'host' && <Link to="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>{t('manage_listings')}</Link>}
        </div>

        <span className="nav-right">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={switchLanguage}
          >
            {String(i18n.language).toUpperCase()}
          </button>
          {user ? (
            <button type="button" className="btn btn-secondary" onClick={logout}>{t('logout')}</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">{t('login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('register')}</Link>
            </>
          )}
        </span>
      </nav>
      <main className="container main">{children}</main>
      <footer className="site-footer">
        <div className="container site-footer-inner">
          <strong>{t('app_name')}</strong>
          <span>{t('tagline')}</span>
          <div className="social-links" aria-label="Social media links">
            <a href="https://wa.me/255700000111" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <XIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
              <TikTokIcon />
            </a>
          </div>
          <span>© {new Date().getFullYear()} KaribuMakazi</span>
        </div>
      </footer>
      <a className="whatsapp-fab" href="https://wa.me/255700000111" target="_blank" rel="noreferrer">
        <WhatsAppIcon />
        {t('cta_whatsapp_now')}
      </a>
      <ChatWidget />
    </div>
  )
}
