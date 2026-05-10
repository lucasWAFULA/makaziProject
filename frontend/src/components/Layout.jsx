import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getUserDisplayName, getUserInitials, isOwnerDashboardUser } from '../utils/authProfile'
import { ChatWidget } from './ChatWidget'
import { SupportWidget } from './SupportWidget'
import { CurrencySelector } from './CurrencySelector'

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

function InstagramIcon() {
  return (
    <svg className="icon icon-social" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
      />
    </svg>
  )
}

export function Layout({ children }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navRef = useRef(null)
  const accountRef = useRef(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [accountOpen, setAccountOpen] = useState(false)

  const bookingMenu = [
    { label: 'All Packages', to: '/packages' },
    { label: 'Airport Pickup + Stay', to: '/booking/airport-pickup-stay' },
    { label: 'Beach Holiday Packages', to: '/booking/beach-holiday-packages' },
    { label: 'Family Vacation Packages', to: '/booking/family-vacation-packages' },
    { label: 'Honeymoon Packages', to: '/booking/honeymoon-packages' },
    { label: 'Weekend Getaways', to: '/booking/weekend-getaways' },
    { label: 'Executive Business Stay', to: '/booking/executive-business-stay' },
  ]
  const agentMenu = [
    { label: 'All Agents', to: '/agents' },
    { label: 'Verified Agents', to: '/agents/verified' },
    { label: 'Apartments for Rent', to: '/agents/apartments' },
    { label: 'Houses for Sale', to: '/agents/houses' },
    { label: 'Land for Sale', to: '/agents/land' },
    { label: 'Commercial Space', to: '/agents/commercial' },
  ]
  const hotelsMenu = [
    { label: 'All Stays', to: '/stays' },
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
  const menuItems = {
    booking: bookingMenu,
    agents: agentMenu,
    hotels: hotelsMenu,
    guide: guideMenu,
  }

  const switchLanguage = () => {
    const nextLang = i18n.language === 'sw' ? 'en' : i18n.language === 'en' ? 'tz' : 'sw'
    i18n.changeLanguage(nextLang)
  }

  const closeMenus = () => {
    setMobileOpen(false)
    setActiveMenu(null)
    setAccountOpen(false)
  }

  const closeMenusBeforeNavigation = () => {
    flushSync(() => {
      closeMenus()
    })
  }

  const toggleMenu = (menu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu))
  }

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => {
      const next = !prev
      if (!next) setActiveMenu(null)
      return next
    })
  }

  useEffect(() => {
    setActiveMenu(null)
    setMobileOpen(false)
    setAccountOpen(false)
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    if (!accountOpen) return undefined
    const onPointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [accountOpen])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setActiveMenu(null)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveMenu(null)
        setAccountOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const renderMenuButton = (key, label) => (
    <button
      type="button"
      className="nav-dropdown-trigger"
      onClick={() => toggleMenu(key)}
      aria-expanded={activeMenu === key}
    >
      {label}
    </button>
  )

  const renderMegaMenu = () => (
    activeMenu ? (
      <div className="mega-menu">
        {menuItems[activeMenu].map((item) => (
          item.href ? (
            <a key={item.label} href={item.href} onClick={closeMenusBeforeNavigation}>{item.label}</a>
          ) : (
            <Link key={item.label} to={item.to} onClick={closeMenusBeforeNavigation}>{item.label}</Link>
          )
        ))}
      </div>
    ) : null
  )

  return (
    <div className="app-layout">
      <div className="quick-actions">
        <a href="tel:+254725301031">{t('quick_call')}</a>
        <a href="https://wa.me/254725301031" target="_blank" rel="noreferrer">{t('quick_whatsapp')}</a>
        <a href="https://maps.google.com/?q=Mombasa" target="_blank" rel="noreferrer">{t('quick_directions')}</a>
      </div>

      <nav className="nav nav-main" ref={navRef}>
        <div className="nav-row">
          <Link to="/" className="nav-brand" onClick={closeMenusBeforeNavigation}>
            <img src="/logo.png" alt="" className="nav-logo" onError={(e) => { e.target.style.display = 'none' }} />
            <span className="nav-name">{t('app_name')}</span>
          </Link>
          <span className="nav-tagline">{t('tagline')}</span>
          <button type="button" className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {mobileOpen ? '×' : '☰'}
          </button>
        </div>

        <div className={`nav-menu ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenusBeforeNavigation}>{t('home')}</Link>
          <Link to="/stays" className="nav-link" onClick={closeMenusBeforeNavigation}>{t('menu_stays')}</Link>
          {renderMenuButton('booking', t('menu_booking'))}
          <Link to="/agents" className="nav-link" onClick={closeMenusBeforeNavigation}>{t('menu_agents')}</Link>
          {renderMenuButton('hotels', t('menu_hotels'))}
          {renderMenuButton('guide', t('menu_guide'))}
          <Link to="/contact" className="nav-link" onClick={closeMenusBeforeNavigation}>{t('menu_contact')}</Link>
          <Link to="/taxi" className="nav-link" onClick={closeMenusBeforeNavigation}>{t('taxi_booking')}</Link>
        </div>
        {renderMegaMenu()}

        <span className={`nav-right ${mobileOpen ? 'open' : ''}`}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={switchLanguage}
          >
            {String(i18n.language).toUpperCase()}
          </button>
          <CurrencySelector />
          {user ? (
            <div className="nav-account" ref={accountRef}>
              <button
                type="button"
                className="nav-account-trigger"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="nav-account-avatar" aria-hidden="true">
                  {getUserInitials(user)}
                </span>
                <span className="nav-account-name">{getUserDisplayName(user)}</span>
                <span className="nav-account-chevron" aria-hidden="true">▾</span>
              </button>
              {accountOpen ? (
                <div className="nav-account-dropdown" role="menu">
                  {isOwnerDashboardUser(user) ? (
                    <Link to="/owner-dashboard" role="menuitem" className="nav-account-item" onClick={() => setAccountOpen(false)}>
                      {t('owner_dashboard')}
                    </Link>
                  ) : null}
                  <Link to="/bookings" role="menuitem" className="nav-account-item" onClick={() => setAccountOpen(false)}>
                    {t('my_bookings')}
                  </Link>
                  <Link to="/account" role="menuitem" className="nav-account-item" onClick={() => setAccountOpen(false)}>
                    {t('nav_account_profile')}
                  </Link>
                  {user.is_staff ? (
                    <a href="/admin/" role="menuitem" className="nav-account-item" onClick={() => setAccountOpen(false)}>
                      {t('menu_site_admin')}
                    </a>
                  ) : null}
                  <button type="button" role="menuitem" className="nav-account-item nav-account-logout" onClick={() => { setAccountOpen(false); logout() }}>
                    {t('logout')}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">{t('login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('register')}</Link>
            </>
          )}
        </span>
      </nav>
      <main className="container main">{children}</main>
      <a
        className="whatsapp-fab"
        href="https://wa.me/254725301031"
        target="_blank"
        rel="noreferrer"
        aria-label={t('quick_whatsapp')}
        title={t('quick_whatsapp')}
      >
        <WhatsAppIcon />
      </a>
      <footer className="site-footer">
        <div className="container site-footer-inner">
          <strong>{t('app_name')}</strong>
          <span>{t('tagline')}</span>
          <span className="footer-contact-line">
            {t('footer_support_label')}{' '}
            <a href="mailto:support@makazi-plus.com">support@makazi-plus.com</a>
          </span>
          <div className="social-links footer-legal-row" aria-label="Footer legal links">
            <Link to="/contact" className="footer-legal-link">
              {t('menu_contact')}
            </Link>
            <Link to="/terms" className="footer-legal-link">
              {t('footer_terms')}
            </Link>
            <Link to="/privacy" className="footer-legal-link">
              {t('footer_privacy')}
            </Link>
          </div>
          <div className="footer-bottom-row">
            <span className="footer-copyright">© {new Date().getFullYear()} MakaziPlus</span>
            <div className="footer-social-icons" aria-label="Social media">
              <a href="https://wa.me/254725301031" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
              <a href="https://www.instagram.com/karibumakazi" target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://www.tiktok.com/@makaziplus0" target="_blank" rel="noreferrer" aria-label="TikTok">
                <TikTokIcon />
              </a>
              <a href="https://www.facebook.com/KaribuMakazi" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://x.com/MakaziPlus26" target="_blank" rel="noreferrer" aria-label="X (Twitter)">
                <XIcon />
              </a>
            </div>
          </div>
        </div>
      </footer>
      <SupportWidget />
      <ChatWidget />
    </div>
  )
}
