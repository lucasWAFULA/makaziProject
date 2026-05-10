import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

export function PlusServices({ propertyId, location }) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  // Pre-defined UI icons based on categories
  const categoryConfig = {
    restaurant: { icon: '🍔', label: t('category_food'), color: '#f59e0b' },
    grocery: { icon: '🛒', label: t('category_grocery'), color: '#10b981' },
    pharmacy: { icon: '💊', label: t('category_pharmacy'), color: '#ef4444' },
    all_in_one: { icon: '🛵', label: t('category_all_in_one'), color: '#3b82f6' },
    transport: { icon: '🚕', label: t('category_transport'), color: '#8b5cf6' },
  }

function getFallbackPartners(locString) {
  const loc = String(locString || '').toLowerCase()
  
  if (loc.includes('uganda') || loc.includes('kampala')) {
    return [
      { id: 'fb-ug-1', name: 'SafeBoda', category: 'transport', link: 'https://safeboda.com/' },
      { id: 'fb-ug-2', name: 'Glovo Uganda', category: 'restaurant', link: 'https://glovoapp.com/ug/en/' },
      { id: 'fb-ug-3', name: 'Supermarket Delivery', category: 'grocery', link: '#' },
    ]
  }

  if (loc.includes('rwanda') || loc.includes('kigali')) {
    return [
      { id: 'fb-rw-1', name: 'Vuba Vuba', category: 'all_in_one', link: 'https://vubavuba.africa/' },
      { id: 'fb-rw-2', name: 'SafeBoda Rides', category: 'transport', link: 'https://safeboda.com/' },
      { id: 'fb-rw-3', name: 'Supermarket Delivery', category: 'grocery', link: '#' },
    ]
  }

  if (loc.includes('tanzania') || loc.includes('zanzibar') || loc.includes('dar')) {
    return [
      { id: 'fb-tz-1', name: 'Uber', category: 'transport', link: 'https://www.uber.com/' },
      { id: 'fb-tz-2', name: 'Bolt', category: 'transport', link: 'https://bolt.eu/' },
      { id: 'fb-tz-3', name: 'Food Delivery', category: 'restaurant', link: '#' },
      { id: 'fb-tz-4', name: 'Local Groceries', category: 'grocery', link: '#' },
    ]
  }

  // Kenya / Default
  return [
    { id: 'fb-ke-1', name: 'Uber', category: 'transport', link: 'https://www.uber.com/' },
    { id: 'fb-ke-2', name: 'Bolt', category: 'transport', link: 'https://bolt.eu/' },
    { id: 'fb-ke-3', name: 'Faras', category: 'transport', link: 'https://demo.faras.com/' },
    { id: 'fb-ke-4', name: 'Glovo', category: 'all_in_one', link: 'https://glovoapp.com/ke/en/' },
    { id: 'fb-ke-5', name: 'Uber Eats', category: 'restaurant', link: 'https://www.ubereats.com/' },
    { id: 'fb-ke-6', name: 'Bolt Food', category: 'restaurant', link: 'https://bolt.eu/en-ke/food/' },
    { id: 'fb-ke-7', name: 'Carrefour', category: 'grocery', link: 'https://www.carrefour.ke/mafken/en/' },
    { id: 'fb-ke-8', name: 'Naivas', category: 'grocery', link: 'https://naivas.online/' },
  ]
}

// getFallbackPartners expects locString, and is now moved below PlusServices or defined globally
// but we need it here, so let's keep it below but since it's used inside, let's just leave it as is 
// or maybe pass t into getFallbackPartners? The names are mostly brand names (Uber, Bolt) so they don't need translation.
// I moved categoryConfig inside PlusServices so it can use t().

  // We fetch either contextual property delivery maps or fallback to location partners
  const { data: mappings = [], isLoading: isLoadingMaps } = useQuery({
    queryKey: ['property-delivery-map', propertyId],
    queryFn: () => api.get(`services/property-map/?property=${propertyId}`).then(r => r.data),
    enabled: !!propertyId,
  })

  // If no property mappings, maybe fetch by location? 
  // For MVP, we'll just display the mappings if they exist.
  // We can also fetch general partners for the country/city.
  const { data: partners = [], isLoading: isLoadingPartners } = useQuery({
    queryKey: ['delivery-partners', location],
    queryFn: () => api.get(`services/partners/`).then(r => r.data), // In prod, filter by country/city
    enabled: mappings.length === 0 && !!location,
  })

  const isLoading = isLoadingMaps || isLoadingPartners

  // Combine items to display
  const displayItems = []

  if (mappings.length > 0) {
    mappings.forEach(map => {
      if (map.partner) {
        displayItems.push({
          id: `p-${map.partner.id}`,
          name: map.partner.name,
          category: map.partner.category,
          link: map.partner.referral_link,
          logo: map.partner.logo_url,
          isRestaurant: false
        })
      }
      if (map.restaurant) {
        displayItems.push({
          id: `r-${map.restaurant.id}`,
          name: map.restaurant.name,
          category: 'restaurant',
          link: map.restaurant.whatsapp_number ? `https://wa.me/${map.restaurant.whatsapp_number.replace(/\D/g,'')}` : '#',
          logo: null,
          isRestaurant: true,
          rating: map.restaurant.rating
        })
      }
    })
  } else if (partners.length > 0) {
    partners.forEach(partner => {
      displayItems.push({
        id: `p-${partner.id}`,
        name: partner.name,
        category: partner.category,
        link: partner.referral_link,
        logo: partner.logo_url,
        isRestaurant: false
      })
    })
  }

  if (isLoading) return null // Or a small skeleton
  
  const finalItems = displayItems.length > 0 ? displayItems : getFallbackPartners(location)

  if (finalItems.length === 0) return null

  return (
    <div className="plus-services-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
      <button 
        type="button" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          padding: '0.5rem 0',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✨ {t('nearby_services_title')}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            {t('nearby_services_subtitle')}
          </p>
        </div>
        <span style={{ fontSize: '1.5rem', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="grid grid-3" style={{ gap: '1rem', marginTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
          {finalItems.map(item => {
            const config = categoryConfig[item.category] || categoryConfig.all_in_one
            return (
              <a 
                key={item.id} 
                href={item.link} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  background: 'var(--color-card)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `${config.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  {item.logo ? <img src={item.logo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} /> : config.icon}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <strong style={{ display: 'block', fontSize: '1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {item.name}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {item.isRestaurant ? t('local_restaurant_label') : config.label}
                  </span>
                </div>
                <span style={{ color: 'var(--color-primary)' }}>→</span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
