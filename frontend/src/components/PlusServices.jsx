import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

// Pre-defined UI icons based on categories
const categoryConfig = {
  restaurant: { icon: '🍔', label: 'Food & Dining', color: '#f59e0b' },
  grocery: { icon: '🛒', label: 'Groceries', color: '#10b981' },
  pharmacy: { icon: '💊', label: 'Pharmacy', color: '#ef4444' },
  all_in_one: { icon: '🛵', label: 'All-in-One Delivery', color: '#3b82f6' },
}

const fallbackPartners = [
  { id: 'fb-1', name: 'Glovo', category: 'all_in_one', link: 'https://glovoapp.com/', isRestaurant: false },
  { id: 'fb-2', name: 'Uber Eats', category: 'restaurant', link: 'https://www.ubereats.com/', isRestaurant: false },
  { id: 'fb-3', name: 'Bolt Food', category: 'restaurant', link: 'https://bolt.eu/en/food/', isRestaurant: false },
  { id: 'fb-4', name: 'Supermarket Delivery', category: 'grocery', link: '#', isRestaurant: false },
  { id: 'fb-5', name: 'Local Pharmacy', category: 'pharmacy', link: '#', isRestaurant: false },
]

export function PlusServices({ propertyId, location }) {
  const { t } = useTranslation()

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
  
  const finalItems = displayItems.length > 0 ? displayItems : fallbackPartners

  if (finalItems.length === 0) return null

  return (
    <div className="plus-services-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        ✨ Food & Essentials Nearby
      </h3>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Ordering to this stay? Use these trusted local delivery partners.
      </p>

      <div className="grid grid-3" style={{ gap: '1rem' }}>
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
                  {item.isRestaurant ? 'Local Restaurant' : config.label}
                </span>
              </div>
              <span style={{ color: 'var(--color-primary)' }}>→</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
