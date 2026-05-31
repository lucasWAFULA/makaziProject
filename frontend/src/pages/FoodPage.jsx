import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getApprovedProviders, createServiceRequest } from '../api/providers'
import { useAuth } from '../context/AuthContext'

export function FoodPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Modal State
  const [selectedRest, setSelectedRest] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState({
    selectedItems: [],
    instructions: '',
    location: '',
    phone: '',
  })

  // Sample dishes list for dynamic rendering in modal
  const sampleDishes = [
    { id: 'item1', name: 'Swahili Pilau & Beef', price: 450 },
    { id: 'item2', name: 'Coastal Fish Biryani', price: 650 },
    { id: 'item3', name: 'Grilled Chicken Tikka (Half)', price: 550 },
    { id: 'item4', name: 'Zanzibar Spice Tea & Samosas', price: 250 },
    { id: 'item5', name: 'Fresh Pwani Juice (Mango/Pineapple)', price: 200 },
  ]

  // Query actual providers
  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['approved-providers'],
    queryFn: getApprovedProviders,
  })

  // Filter approved food providers
  const backendFoodProviders = providers.filter(p => p.provider_type === 'FOOD')

  // Hardcoded premium fallback/merged providers to ensure the UI is rich
  const fallbackRestaurants = [
    { id: 'mock-1', name: "Mama Njeri's Kitchen", cuisine: "Local Cuisine", rating: "4.8", time: "25-35 min", isMock: true },
    { id: 'mock-2', name: "Coastal Grill", cuisine: "Seafood & BBQ", rating: "4.6", time: "30-40 min", isMock: true },
    { id: 'mock-3', name: "Zanzibar Spice House", cuisine: "Swahili Cuisine", rating: "4.9", time: "20-30 min", isMock: true },
    { id: 'mock-4', name: "Diani Fresh Bites", cuisine: "Healthy & Fresh", rating: "4.5", time: "15-25 min", isMock: true },
    { id: 'mock-5', name: "Mombasa Street Food", cuisine: "Street Food", rating: "4.7", time: "20-30 min", isMock: true },
    { id: 'mock-6', name: "Pwani Café", cuisine: "Coffee & Brunch", rating: "4.4", time: "15-20 min", isMock: true },
  ]

  // Merge dynamic providers first, then append mocks that aren't duplicates
  const restaurantsList = [
    ...backendFoodProviders.map(p => ({
      id: p.id,
      name: p.business_name,
      cuisine: t('svc_food_title', 'Makazi Food Partner'),
      rating: "4.7",
      time: "20-30 min",
      isMock: false,
      rawProvider: p
    })),
    ...fallbackRestaurants.filter(fallback => !backendFoodProviders.some(p => p.business_name.toLowerCase() === fallback.name.toLowerCase()))
  ]

  // Mutation to create ServiceRequest
  const createRequestMutation = useMutation({
    mutationFn: createServiceRequest,
    onSuccess: () => {
      setOrderSuccess(true)
    },
  })

  const handleOpenOrderModal = (restaurant) => {
    if (!user) {
      navigate(`/login?redirect=/food`)
      return
    }
    setSelectedRest(restaurant)
    setOrderSuccess(false)
    setOrderDetails({
      selectedItems: [],
      instructions: '',
      location: '',
      phone: '',
    })
  }

  const handleCheckboxChange = (dishName) => {
    setOrderDetails(prev => {
      const items = prev.selectedItems.includes(dishName)
        ? prev.selectedItems.filter(item => item !== dishName)
        : [...prev.selectedItems, dishName]
      return { ...prev, selectedItems: items }
    })
  }

  const handleSubmitOrder = (e) => {
    e.preventDefault()
    if (orderDetails.selectedItems.length === 0) {
      alert("Please select at least one item.")
      return
    }

    // Prepare details string
    const detailsString = JSON.stringify({
      restaurantName: selectedRest.name,
      items: orderDetails.selectedItems,
      specialInstructions: orderDetails.instructions,
      deliveryLocation: orderDetails.location,
      contactPhone: orderDetails.phone,
    })

    // If it's a fallback mock, assign to first backend provider or simulate
    let providerId = selectedRest.id
    if (selectedRest.isMock) {
      // Find a real provider to submit to, or if none, fallback gracefully
      const activeRealProvider = backendFoodProviders[0]
      if (activeRealProvider) {
        providerId = activeRealProvider.id
      } else {
        alert("Simulating local order: In production, orders are assigned to registered providers.")
        setOrderSuccess(true)
        return
      }
    }

    createRequestMutation.mutate({
      provider: providerId,
      service_type: 'FOOD',
      details: detailsString,
    })
  }

  return (
    <div className="food-page" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="food-hero hero-animate" style={{ marginBottom: '2rem' }}>
        <span className="hero-kicker">{t('food_hero_kicker', 'Food Delivery Services')}</span>
        <h1 className="hero-title">{t('food_hero_title', 'Delicious meals delivered to your stay')}</h1>
        <p className="hero-tagline">{t('food_hero_tagline', 'Order from local restaurants near your booked property. Fresh food, fast delivery, M-Pesa payments.')}</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#restaurants" className="btn btn-primary">{t('cta_browse_restaurants', 'Browse Restaurants')}</a>
        </div>
      </header>

      <section className="card section-card food-integration-note" style={{ marginBottom: '2rem' }}>
        <p>🏠 <strong>{t('food_integration_note')}</strong></p>
      </section>

      <section className="card section-card" style={{ marginBottom: '2rem' }}>
        <div className="section-heading">
          <h2>{t('food_services_title', 'Services Offered')}</h2>
        </div>
        <div className="food-categories-grid">
          <div className="food-category-card" style={{ '--stagger': 0 }}>
            <span className="food-cat-icon">🍽️</span>
            <strong>{t('food_cat_restaurant', 'Restaurant meal delivery')}</strong>
          </div>
          <div className="food-category-card" style={{ '--stagger': 1 }}>
            <span className="food-cat-icon">🛒</span>
            <strong>{t('food_cat_grocery', 'Grocery & convenience item delivery')}</strong>
          </div>
          <div className="food-category-card" style={{ '--stagger': 2 }}>
            <span className="food-cat-icon">🍱</span>
            <strong>{t('food_cat_office', 'Office lunch delivery')}</strong>
          </div>
          <div className="food-category-card" style={{ '--stagger': 3 }}>
            <span className="food-cat-icon">🏘️</span>
            <strong>{t('food_cat_community', 'Apartment & gated-community delivery')}</strong>
          </div>
          <div className="food-category-card" style={{ '--stagger': 4 }}>
            <span className="food-cat-icon">🎉</span>
            <strong>{t('food_cat_catering', 'Catering requests for events')}</strong>
          </div>
          <div className="food-category-card" style={{ '--stagger': 5 }}>
            <span className="food-cat-icon">📅</span>
            <strong>{t('food_cat_scheduled', 'Scheduled meal deliveries')}</strong>
          </div>
        </div>
      </section>

      <section className="card section-card" style={{ marginBottom: '2rem' }}>
        <div className="section-heading">
          <h2>{t('food_why_title', 'Why Use Makazi Food?')}</h2>
        </div>
        <div className="food-steps-grid">
          <div className="food-step-card" style={{ '--stagger': 0 }}>
            <span className="food-step-icon">📱</span>
            <strong>{t('food_benefit_1_title', 'Convenient Ordering')}</strong>
            <p>{t('food_benefit_1_desc', 'Order easily from one platform.')}</p>
          </div>
          <div className="food-step-card" style={{ '--stagger': 1 }}>
            <span className="food-step-icon">🏠</span>
            <strong>{t('food_benefit_2_title', 'Direct Delivery')}</strong>
            <p>{t('food_benefit_2_desc', 'Delivery to homes, apartments, and offices.')}</p>
          </div>
          <div className="food-step-card" style={{ '--stagger': 2 }}>
            <span className="food-step-icon">💳</span>
            <strong>{t('food_benefit_3_title', 'Secure Payments')}</strong>
            <p>{t('food_benefit_3_desc', 'Safe and reliable payment options.')}</p>
          </div>
          <div className="food-step-card" style={{ '--stagger': 3 }}>
            <span className="food-step-icon">🤝</span>
            <strong>{t('food_benefit_4_title', 'Reliable Partners')}</strong>
            <p>{t('food_benefit_4_desc', 'Access to local restaurants and verified vendors.')}</p>
          </div>
        </div>
      </section>

      <section id="restaurants" className="card section-card" style={{ marginBottom: '2rem' }}>
        <div className="section-heading">
          <h2>{t('food_featured_restaurants_title', 'Featured Restaurants')}</h2>
          <p>{t('food_featured_restaurants_subtitle', 'Browse our partner restaurants and order tasty meals directly to your location.')}</p>
        </div>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading restaurants...</div>
        ) : (
          <div className="grid grid-3">
            {restaurantsList.map((rest, idx) => (
              <article key={rest.id} className="food-restaurant-card" style={{ '--stagger': idx }}>
                <div className="food-rest-header">
                  <strong>{rest.name}</strong>
                  <span className="food-rest-rating">★ {rest.rating}</span>
                </div>
                <p className="food-rest-cuisine">{rest.cuisine}</p>
                <div className="food-rest-footer">
                  <span className="food-rest-time">⏱️ {rest.time}</span>
                  <button 
                    onClick={() => handleOpenOrderModal(rest)} 
                    className="btn btn-primary btn-sm"
                  >
                    {t('cta_order_now', 'Order Now')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="food-providers-section">
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>{t('food_partner_title', 'Partner with Makazi Plus')}</h2>
          <p>{t('food_partner_desc', 'Join our network of trusted service providers and grow your business.')}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/register-provider" className="btn btn-accent">{t('cta_register_provider', 'Register as a Service Provider')}</Link>
        </div>
      </section>

      {/* Glassmorphic Order Modal */}
      {selectedRest && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="card reveal-item" style={{
            maxWidth: '550px', width: '100%', padding: '2rem',
            background: 'var(--color-card)', border: '1px solid var(--color-border)',
            position: 'relative', overflowY: 'auto', maxHeight: '90vh'
          }}>
            <button 
              onClick={() => setSelectedRest(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                border: 'none', background: 'none', fontSize: '1.5rem',
                color: 'var(--color-text)', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            {orderSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                <h3>{t('order_placed_title', 'Order Placed Successfully!')}</h3>
                <p style={{ margin: '1rem 0 2rem 0' }}>
                  {t('order_placed_desc', 'Your order has been sent to the kitchen. You can track its status inside your dashboard.')}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => setSelectedRest(null)} className="btn btn-secondary">{t('close', 'Close')}</button>
                  <Link to="/provider-dashboard" className="btn btn-primary">{t('view_dashboard', 'View Status')}</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder}>
                <h3 style={{ marginBottom: '0.5rem' }}>{t('checkout_order_from', 'Order from')} {selectedRest.name}</h3>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{t('checkout_hint', 'Select items, fill in your details, and place your order.')}</p>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('select_menu_items', 'Select Menu Items')}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sampleDishes.map(dish => (
                      <label key={dish.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            checked={orderDetails.selectedItems.includes(`${dish.name} (Ksh ${dish.price})`)}
                            onChange={() => handleCheckboxChange(`${dish.name} (Ksh ${dish.price})`)}
                          />
                          <span>{dish.name}</span>
                        </div>
                        <strong style={{ color: 'var(--color-primary)' }}>Ksh {dish.price}</strong>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>{t('special_instructions', 'Special Instructions')}</label>
                  <textarea 
                    value={orderDetails.instructions}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder={t('instructions_placeholder', 'e.g. Extra pepper, deliver at 8 PM, or dietary requests...')}
                    style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>{t('delivery_location', 'Delivery Location / Room / Stay Name')}</label>
                  <input 
                    type="text" 
                    value={orderDetails.location}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, location: e.target.value }))}
                    required
                    placeholder={t('location_placeholder', 'e.g. Room 402 or Stay Name')}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>{t('contact_phone', 'Contact Phone Number')}</label>
                  <input 
                    type="text" 
                    value={orderDetails.phone}
                    onChange={(e) => setOrderDetails(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder={t('phone_placeholder', 'e.g. 0712345678')}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '1rem' }}
                  disabled={createRequestMutation.isLoading}
                >
                  {createRequestMutation.isLoading ? t('submitting', 'Placing Order...') : t('cta_order_now', 'Confirm & Order Now')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
