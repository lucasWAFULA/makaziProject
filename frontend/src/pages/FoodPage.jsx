import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getApprovedProviders, createServiceRequest } from '../api/providers'
import { useAuth } from '../context/AuthContext'

// ── East Africa Food Data ────────────────────────────────────────────────────
const EA_FOOD_COUNTRIES = [
  {
    code: 'ke',
    flag: '🇰🇪',
    name: 'Kenya',
    currency: 'KSh',
    paymentMethods: ['M-Pesa', 'Airtel Money', 'Card'],
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Diani'],
    cuisineHighlights: ['Nyama Choma', 'Ugali & Sukuma', 'Coastal Swahili', 'Pilau'],
    restaurants: [
      { id: 'ke-1', name: "Mama Njeri's Kitchen", cuisine: 'Local Kenyan Cuisine', rating: '4.8', time: '25-35 min', city: 'Nairobi' },
      { id: 'ke-2', name: 'Coastal Grill & Seafood', cuisine: 'Seafood & BBQ', rating: '4.6', time: '30-40 min', city: 'Mombasa' },
      { id: 'ke-3', name: 'Zanzibar Spice House', cuisine: 'Swahili Cuisine', rating: '4.9', time: '20-30 min', city: 'Mombasa' },
      { id: 'ke-4', name: 'Diani Fresh Bites', cuisine: 'Healthy & Fresh', rating: '4.5', time: '15-25 min', city: 'Diani' },
      { id: 'ke-5', name: 'Mombasa Street Food', cuisine: 'Street Food & Snacks', rating: '4.7', time: '20-30 min', city: 'Mombasa' },
      { id: 'ke-6', name: 'Nairobi Java House', cuisine: 'Coffee & Brunch', rating: '4.4', time: '15-20 min', city: 'Nairobi' },
    ],
    dishes: [
      { id: 'd1', name: 'Nyama Choma (Half Kg)', price: 650 },
      { id: 'd2', name: 'Pilau & Beef Stew', price: 450 },
      { id: 'd3', name: 'Coastal Fish Biryani', price: 650 },
      { id: 'd4', name: 'Ugali & Sukuma Wiki', price: 250 },
      { id: 'd5', name: 'Mandazi & Chai', price: 150 },
    ],
  },
  {
    code: 'tz',
    flag: '🇹🇿',
    name: 'Tanzania',
    currency: 'TSh',
    paymentMethods: ['M-Pesa TZ', 'Tigo Pesa', 'Airtel Money', 'Card'],
    cities: ['Dar es Salaam', 'Zanzibar', 'Arusha', 'Mwanza'],
    cuisineHighlights: ['Zanzibar Pizza', 'Urojo Soup', 'Chipsi Mayai', 'Mishkaki'],
    restaurants: [
      { id: 'tz-1', name: 'Stone Town Eats', cuisine: 'Zanzibari & Swahili', rating: '4.9', time: '20-30 min', city: 'Zanzibar' },
      { id: 'tz-2', name: 'Dar Grillhouse', cuisine: 'Grills & BBQ', rating: '4.7', time: '25-35 min', city: 'Dar es Salaam' },
      { id: 'tz-3', name: 'Mama Afrika Kitchen', cuisine: 'Traditional Tanzanian', rating: '4.8', time: '20-30 min', city: 'Arusha' },
      { id: 'tz-4', name: 'Msasani Bay Seafood', cuisine: 'Seafood & Continental', rating: '4.6', time: '30-45 min', city: 'Dar es Salaam' },
      { id: 'tz-5', name: 'Forodhani Night Market', cuisine: 'Street Food & Snacks', rating: '4.9', time: '15-25 min', city: 'Zanzibar' },
      { id: 'tz-6', name: 'Arusha Spice Garden', cuisine: 'Safari & Fusion Cuisine', rating: '4.5', time: '25-35 min', city: 'Arusha' },
    ],
    dishes: [
      { id: 'd1', name: 'Zanzibar Pizza', price: 8000 },
      { id: 'd2', name: 'Mishkaki (10 pcs)', price: 5000 },
      { id: 'd3', name: 'Pilau & Kachumbari', price: 6000 },
      { id: 'd4', name: 'Chipsi Mayai', price: 3000 },
      { id: 'd5', name: 'Urojo Soup', price: 4000 },
    ],
  },
  {
    code: 'ug',
    flag: '🇺🇬',
    name: 'Uganda',
    currency: 'USh',
    paymentMethods: ['MTN MoMo', 'Airtel Money', 'Card'],
    cities: ['Kampala', 'Entebbe', 'Jinja', 'Gulu'],
    cuisineHighlights: ['Rolex', 'Matoke', 'G-nut Stew', 'Kikomando'],
    restaurants: [
      { id: 'ug-1', name: 'Kampala Kitchen', cuisine: 'Ugandan Traditional', rating: '4.8', time: '20-30 min', city: 'Kampala' },
      { id: 'ug-2', name: 'Rolex Boulevard', cuisine: 'Street Food & Snacks', rating: '4.9', time: '10-20 min', city: 'Kampala' },
      { id: 'ug-3', name: 'Lake Victoria Seafood', cuisine: 'Fresh Fish & Seafood', rating: '4.7', time: '25-35 min', city: 'Entebbe' },
      { id: 'ug-4', name: 'Nile Grill House', cuisine: 'Grills & BBQ', rating: '4.6', time: '30-40 min', city: 'Jinja' },
      { id: 'ug-5', name: 'Kololo Fine Dining', cuisine: 'Continental & African Fusion', rating: '4.5', time: '30-45 min', city: 'Kampala' },
      { id: 'ug-6', name: 'Owino Market Bites', cuisine: 'Local Ugandan Snacks', rating: '4.7', time: '15-20 min', city: 'Kampala' },
    ],
    dishes: [
      { id: 'd1', name: 'Rolex (Egg & Chapati)', price: 3000 },
      { id: 'd2', name: 'Matoke & G-nut Stew', price: 8000 },
      { id: 'd3', name: 'Tilapia (Whole Fish)', price: 25000 },
      { id: 'd4', name: 'Kikomando (Chapati & Beans)', price: 3500 },
      { id: 'd5', name: 'Luwombo Stew', price: 18000 },
    ],
  },
  {
    code: 'rw',
    flag: '🇷🇼',
    name: 'Rwanda',
    currency: 'RWF',
    paymentMethods: ['MTN MoMo', 'Airtel Money', 'Card'],
    cities: ['Kigali', 'Musanze', 'Huye', 'Rubavu'],
    cuisineHighlights: ['Isombe', 'Umutsima', 'Inyama', 'Akabenz'],
    restaurants: [
      { id: 'rw-1', name: 'Kigali Flavors', cuisine: 'Rwandan & African', rating: '4.8', time: '20-30 min', city: 'Kigali' },
      { id: 'rw-2', name: 'Thousand Hills Kitchen', cuisine: 'Traditional Rwandan', rating: '4.9', time: '25-35 min', city: 'Kigali' },
      { id: 'rw-3', name: 'Gorilla Hill Cafe', cuisine: 'Cafe & Continental', rating: '4.6', time: '15-25 min', city: 'Musanze' },
      { id: 'rw-4', name: 'Kimihurura Grill', cuisine: 'BBQ & Fusion', rating: '4.7', time: '25-35 min', city: 'Kigali' },
      { id: 'rw-5', name: 'Lake Kivu Seafood', cuisine: 'Fish & Seafood', rating: '4.5', time: '30-40 min', city: 'Rubavu' },
      { id: 'rw-6', name: 'Norbert Street Bites', cuisine: 'Street Food & Snacks', rating: '4.8', time: '10-20 min', city: 'Kigali' },
    ],
    dishes: [
      { id: 'd1', name: 'Isombe (Cassava Leaves)', price: 2500 },
      { id: 'd2', name: 'Brochette & Chips', price: 4500 },
      { id: 'd3', name: 'Umutsima (Cassava Rice)', price: 2000 },
      { id: 'd4', name: 'Akabenz Steak', price: 8000 },
      { id: 'd5', name: 'Sambaza (Lake Fish)', price: 5000 },
    ],
  },
  {
    code: 'et',
    flag: '🇪🇹',
    name: 'Ethiopia',
    currency: 'ETB',
    paymentMethods: ['Telebirr', 'CBE Birr', 'Card'],
    cities: ['Addis Ababa', 'Dire Dawa', 'Gondar', 'Hawassa'],
    cuisineHighlights: ['Injera & Tibs', 'Doro Wat', 'Shiro', 'Tej (Honey Wine)'],
    restaurants: [
      { id: 'et-1', name: 'Addis Injera House', cuisine: 'Traditional Ethiopian', rating: '4.9', time: '20-30 min', city: 'Addis Ababa' },
      { id: 'et-2', name: 'Lalibela Kitchen', cuisine: 'Ethiopian Heritage Cuisine', rating: '4.8', time: '25-35 min', city: 'Addis Ababa' },
      { id: 'et-3', name: 'Azmera Coffee & Bites', cuisine: 'Ethiopian Coffee & Snacks', rating: '4.9', time: '10-20 min', city: 'Addis Ababa' },
      { id: 'et-4', name: 'Rift Valley Grill', cuisine: 'Grills & Continental', rating: '4.6', time: '25-35 min', city: 'Hawassa' },
      { id: 'et-5', name: 'Gondar Palace Kitchen', cuisine: 'North Ethiopian Cuisine', rating: '4.7', time: '30-40 min', city: 'Gondar' },
      { id: 'et-6', name: 'Dire Dawa Bites', cuisine: 'Harari & Somali Fusion', rating: '4.5', time: '20-30 min', city: 'Dire Dawa' },
    ],
    dishes: [
      { id: 'd1', name: 'Injera & Doro Wat', price: 150 },
      { id: 'd2', name: 'Tibs (Beef or Lamb)', price: 200 },
      { id: 'd3', name: 'Shiro Firfir', price: 80 },
      { id: 'd4', name: 'Ethiopian Coffee Ceremony', price: 50 },
      { id: 'd5', name: 'Kitfo (Ethiopian Tartare)', price: 250 },
    ],
  },
  {
    code: 'bi',
    flag: '🇧🇮',
    name: 'Burundi',
    currency: 'BIF',
    paymentMethods: ['Lumitel', 'Ecocash', 'Card'],
    cities: ['Bujumbura', 'Gitega', 'Ngozi'],
    cuisineHighlights: ['Brochette', 'Isombe', 'Matoke', 'Umutsima'],
    restaurants: [
      { id: 'bi-1', name: 'Bujumbura Bay Grill', cuisine: 'Lake Tanganyika Seafood', rating: '4.7', time: '20-30 min', city: 'Bujumbura' },
      { id: 'bi-2', name: 'Gitega Traditional Kitchen', cuisine: 'Burundian Heritage Cuisine', rating: '4.8', time: '25-35 min', city: 'Gitega' },
      { id: 'bi-3', name: 'Ngozi Street Eats', cuisine: 'Street Food & Local Snacks', rating: '4.5', time: '15-25 min', city: 'Ngozi' },
      { id: 'bi-4', name: 'Kiriri Hilltop Cafe', cuisine: 'Continental & African', rating: '4.6', time: '25-40 min', city: 'Bujumbura' },
    ],
    dishes: [
      { id: 'd1', name: 'Brochette de Boeuf', price: 5000 },
      { id: 'd2', name: 'Isombe & Rice', price: 3000 },
      { id: 'd3', name: 'Tilapia du Lac', price: 8000 },
      { id: 'd4', name: 'Beignets & Café', price: 2000 },
      { id: 'd5', name: 'Matoke Stew', price: 2500 },
    ],
  },
  {
    code: 'ss',
    flag: '🇸🇸',
    name: 'South Sudan',
    currency: 'SSP',
    paymentMethods: ['MTN MoMo', 'Zain Cash', 'Card'],
    cities: ['Juba', 'Wau', 'Malakal'],
    cuisineHighlights: ['Asida', 'Ful Medames', 'Kissra', 'Grilled Fish'],
    restaurants: [
      { id: 'ss-1', name: 'Juba Riverside Kitchen', cuisine: 'South Sudanese Traditional', rating: '4.6', time: '25-35 min', city: 'Juba' },
      { id: 'ss-2', name: 'Nile Star Grill', cuisine: 'BBQ & Continental', rating: '4.5', time: '30-40 min', city: 'Juba' },
      { id: 'ss-3', name: 'Wau Market Bites', cuisine: 'Local Street Food', rating: '4.4', time: '20-30 min', city: 'Wau' },
    ],
    dishes: [
      { id: 'd1', name: 'Asida & Stew', price: 800 },
      { id: 'd2', name: 'Ful Medames', price: 500 },
      { id: 'd3', name: 'Grilled Nile Perch', price: 1500 },
      { id: 'd4', name: 'Kissra Flatbread', price: 300 },
      { id: 'd5', name: 'Beef Brochette', price: 1000 },
    ],
  },
  {
    code: 'cd',
    flag: '🇨🇩',
    name: 'DR Congo',
    currency: 'CDF',
    paymentMethods: ['Airtel Money', 'Orange Money', 'Card'],
    cities: ['Kinshasa', 'Lubumbashi', 'Goma', 'Bukavu'],
    cuisineHighlights: ['Pondu (Cassava Leaves)', 'Liboke', 'Fufu', 'Saka-Saka'],
    restaurants: [
      { id: 'cd-1', name: 'Kinshasa Kitchen', cuisine: 'Congolese Traditional', rating: '4.7', time: '25-35 min', city: 'Kinshasa' },
      { id: 'cd-2', name: 'Goma Volcanic Grill', cuisine: 'BBQ & Lake Kivu Fish', rating: '4.8', time: '20-30 min', city: 'Goma' },
      { id: 'cd-3', name: 'Lubumbashi Bistro', cuisine: 'Congolese & Continental', rating: '4.5', time: '30-40 min', city: 'Lubumbashi' },
      { id: 'cd-4', name: 'Bukavu Bay Seafood', cuisine: 'Lake Fish & Seafood', rating: '4.6', time: '25-35 min', city: 'Bukavu' },
    ],
    dishes: [
      { id: 'd1', name: 'Pondu & Fufu', price: 8000 },
      { id: 'd2', name: 'Liboke de Poisson', price: 15000 },
      { id: 'd3', name: 'Saka-Saka & Rice', price: 6000 },
      { id: 'd4', name: 'Brochette de Chèvre', price: 10000 },
      { id: 'd5', name: 'Mbika (Pumpkin Soup)', price: 5000 },
    ],
  },
]

export function FoodPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeCountry, setActiveCountry] = useState('ke')
  const [selectedRest, setSelectedRest] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState({
    selectedItems: [],
    instructions: '',
    location: '',
    phone: '',
    city: '',
  })

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['approved-providers'],
    queryFn: getApprovedProviders,
  })

  const backendFoodProviders = providers.filter((p) => p.provider_type === 'FOOD')

  const createRequestMutation = useMutation({
    mutationFn: createServiceRequest,
    onSuccess: () => {
      setOrderSuccess(true)
    },
  })

  const currentCountry = EA_FOOD_COUNTRIES.find((c) => c.code === activeCountry) || EA_FOOD_COUNTRIES[0]

  // Merge backend providers with country-specific fallbacks
  const restaurantsList = [
    ...backendFoodProviders.map((p) => ({
      id: p.id,
      name: p.business_name,
      cuisine: 'Makazi Food Partner',
      rating: '4.7',
      time: '20-30 min',
      city: currentCountry.cities[0],
      isMock: false,
      rawProvider: p,
    })),
    ...currentCountry.restaurants.filter(
      (r) => !backendFoodProviders.some((p) => p.business_name.toLowerCase() === r.name.toLowerCase()),
    ).map((r) => ({ ...r, isMock: true })),
  ]

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
      city: restaurant.city || currentCountry.cities[0],
    })
  }

  const handleCheckboxChange = (dishLabel) => {
    setOrderDetails((prev) => {
      const items = prev.selectedItems.includes(dishLabel)
        ? prev.selectedItems.filter((item) => item !== dishLabel)
        : [...prev.selectedItems, dishLabel]
      return { ...prev, selectedItems: items }
    })
  }

  const handleSubmitOrder = (e) => {
    e.preventDefault()
    if (orderDetails.selectedItems.length === 0) {
      alert('Please select at least one item.')
      return
    }

    const detailsString = JSON.stringify({
      country: currentCountry.name,
      restaurantName: selectedRest.name,
      city: orderDetails.city,
      items: orderDetails.selectedItems,
      specialInstructions: orderDetails.instructions,
      deliveryLocation: orderDetails.location,
      contactPhone: orderDetails.phone,
    })

    let providerId = selectedRest.id
    if (selectedRest.isMock) {
      const activeRealProvider = backendFoodProviders[0]
      if (activeRealProvider) {
        providerId = activeRealProvider.id
      } else {
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
    <div className="food-page" style={{ padding: '0', maxWidth: '100%', margin: '0 auto' }}>

      {/* ── Hero ── */}
      <header
        className="food-hero hero-animate"
        style={{
          padding: '4rem 2rem 3rem',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #dc2626 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'6\'/%3E%3C/g%3E%3C/svg%3E")', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Country Flags in Hero */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {EA_FOOD_COUNTRIES.map((c) => (
              <span
                key={c.code}
                style={{
                  fontSize: '1.5rem',
                  filter: c.code === activeCountry ? 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' : 'grayscale(40%) opacity(0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: c.code === activeCountry ? 'scale(1.25)' : 'scale(1)',
                }}
                title={c.name}
                onClick={() => setActiveCountry(c.code)}
              >
                {c.flag}
              </span>
            ))}
          </div>
          <span className="hero-kicker" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', letterSpacing: '0.15em', fontWeight: '700', textTransform: 'uppercase' }}>
            🍽️ Food Delivery Across East Africa
          </span>
          <h1 className="hero-title" style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.2, margin: '0.75rem 0' }}>
            Delicious Meals Delivered to <span style={{ color: 'rgba(255,255,100,1)' }}>Your Stay</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Order from top local restaurants in {EA_FOOD_COUNTRIES.length} East African countries. Fresh food, fast delivery, mobile money payments.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#restaurants" className="btn btn-primary" style={{ background: '#fff', color: '#ef4444', fontWeight: '700' }}>
              Browse Restaurants
            </a>
            <a href="#countries" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
              Select Country
            </a>
          </div>
        </div>
      </header>

      {/* ── Trust Strip ── */}
      <div style={{ background: 'linear-gradient(90deg, #fff7ed, #fff1f2)', borderBottom: '1px solid var(--color-border)', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: '🌍', label: `${EA_FOOD_COUNTRIES.length} EA Countries` },
            { icon: '📱', label: 'Mobile Money Payments' },
            { icon: '⚡', label: 'Fast Delivery' },
            { icon: '🏠', label: 'Delivery to Your Stay' },
            { icon: '✅', label: 'Verified Restaurants' },
            { icon: '🔒', label: 'Secure Ordering' },
          ].map((item) => (
            <span key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-heading)' }}>
              {item.icon} {item.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ── Integration Note ── */}
        <section className="card section-card food-integration-note" style={{ marginTop: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))', border: '1px solid rgba(245,158,11,0.3)' }}>
          <p>🏠 <strong>{t('food_integration_note', 'Makazi Plus food delivery is linked to your booked property — meals go exactly where you are staying in East Africa.')}</strong></p>
        </section>

        {/* ── Country Selector ── */}
        <section id="countries" className="card section-card" style={{ marginBottom: '2rem' }}>
          <div className="section-heading" style={{ marginBottom: '1.5rem' }}>
            <span className="section-kicker">Coverage</span>
            <h2>Select Your Country</h2>
            <p>We partner with local restaurants and vendors in all major East African cities.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.85rem' }}>
            {EA_FOOD_COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => setActiveCountry(country.code)}
                style={{
                  background: activeCountry === country.code ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'var(--color-card)',
                  border: `2px solid ${activeCountry === country.code ? '#f59e0b' : 'var(--color-border)'}`,
                  borderRadius: '14px',
                  padding: '1rem 0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.25s ease',
                  transform: activeCountry === country.code ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: activeCountry === country.code ? '0 6px 20px rgba(245,158,11,0.35)' : 'none',
                  color: activeCountry === country.code ? '#fff' : 'var(--color-heading)',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{country.flag}</div>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{country.name}</strong>
                <small style={{ opacity: 0.8, fontSize: '0.72rem' }}>{country.currency} · {country.paymentMethods[0]}</small>
                <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {country.cuisineHighlights.slice(0, 2).map((h) => (
                    <span key={h} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem', background: activeCountry === country.code ? 'rgba(255,255,255,0.2)' : 'rgba(245,158,11,0.12)', borderRadius: '6px', color: activeCountry === country.code ? '#fff' : '#b45309' }}>
                      {h}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Current Country Info ── */}
        <section className="card section-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.04))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '3rem' }}>{currentCountry.flag}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.25rem', color: 'var(--color-heading)' }}>
                {currentCountry.name} — Food Delivery
              </h3>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Serving: <strong>{currentCountry.cities.join(', ')}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Payments: {currentCountry.paymentMethods.join(' · ')} &nbsp;|&nbsp; Currency: <strong>{currentCountry.currency}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {currentCountry.cuisineHighlights.map((h) => (
                <span key={h} style={{ padding: '0.3rem 0.7rem', background: 'rgba(245,158,11,0.15)', borderRadius: '20px', fontSize: '0.8rem', color: '#b45309', fontWeight: '600' }}>
                  🍴 {h}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Restaurant Grid ── */}
        <section id="restaurants" className="card section-card" style={{ marginBottom: '2rem' }}>
          <div className="section-heading" style={{ marginBottom: '1.5rem' }}>
            <span className="section-kicker">{currentCountry.flag} {currentCountry.name}</span>
            <h2>Featured Restaurants</h2>
            <p>Browse partner restaurants and order directly to your location in {currentCountry.name}.</p>
          </div>
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading restaurants...</div>
          ) : (
            <div className="grid grid-3">
              {restaurantsList.map((rest, idx) => (
                <article key={rest.id} className="food-restaurant-card" style={{ '--stagger': idx }}>
                  {/* Restaurant header with emoji based on cuisine */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.08))', borderRadius: '12px 12px 0 0', padding: '1.25rem 1rem', textAlign: 'center', fontSize: '2rem' }}>
                    {rest.cuisine.toLowerCase().includes('seafood') ? '🦐' :
                     rest.cuisine.toLowerCase().includes('coffee') || rest.cuisine.toLowerCase().includes('cafe') ? '☕' :
                     rest.cuisine.toLowerCase().includes('bbq') || rest.cuisine.toLowerCase().includes('grill') ? '🔥' :
                     rest.cuisine.toLowerCase().includes('street') ? '🍢' :
                     rest.cuisine.toLowerCase().includes('healthy') ? '🥗' : '🍽️'}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div className="food-rest-header">
                      <strong>{rest.name}</strong>
                      <span className="food-rest-rating">★ {rest.rating}</span>
                    </div>
                    <p className="food-rest-cuisine">{rest.cuisine}</p>
                    {rest.city && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.25rem 0' }}>
                        📍 {rest.city}
                      </p>
                    )}
                    <div className="food-rest-footer">
                      <span className="food-rest-time">⏱️ {rest.time}</span>
                      <button
                        onClick={() => handleOpenOrderModal(rest)}
                        className="btn btn-primary btn-sm"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none' }}
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── Service Categories ── */}
        <section className="card section-card" style={{ marginBottom: '2rem' }}>
          <div className="section-heading">
            <h2>Services Offered</h2>
          </div>
          <div className="food-categories-grid">
            {[
              { icon: '🍽️', label: 'Restaurant Meal Delivery', stagger: 0 },
              { icon: '🛒', label: 'Grocery & Convenience Delivery', stagger: 1 },
              { icon: '🍱', label: 'Office Lunch Delivery', stagger: 2 },
              { icon: '🏘️', label: 'Apartment & Gated-Community Delivery', stagger: 3 },
              { icon: '🎉', label: 'Catering Requests for Events', stagger: 4 },
              { icon: '📅', label: 'Scheduled Meal Deliveries', stagger: 5 },
            ].map((item) => (
              <div key={item.label} className="food-category-card" style={{ '--stagger': item.stagger }}>
                <span className="food-cat-icon">{item.icon}</span>
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Use Makazi Food ── */}
        <section className="card section-card" style={{ marginBottom: '2rem' }}>
          <div className="section-heading">
            <h2>Why Use Makazi Food?</h2>
          </div>
          <div className="food-steps-grid">
            {[
              { icon: '🌍', title: 'Pan-East Africa Coverage', desc: `Restaurants in all ${EA_FOOD_COUNTRIES.length} East African countries — Kenya, Tanzania, Uganda, Rwanda, Ethiopia, Burundi, South Sudan, DR Congo.` },
              { icon: '📱', title: 'Mobile Money Payments', desc: 'M-Pesa, MTN MoMo, Airtel Money, Telebirr, Tigo Pesa — pay how you want, where you are.' },
              { icon: '🏠', title: 'Direct to Your Stay', desc: 'Delivery directly to your booked property, hotel room, or apartment across East Africa.' },
              { icon: '🤝', title: 'Verified Local Partners', desc: 'All restaurants are verified local businesses with quality assurance and food safety compliance.' },
              { icon: '⚡', title: 'Fast & Reliable', desc: 'Real-time tracking and guaranteed delivery times from top-rated local restaurants.' },
              { icon: '🔒', title: 'Secure Ordering', desc: 'End-to-end encrypted orders with secure mobile payment confirmation.' },
            ].map((item, idx) => (
              <div key={idx} className="food-step-card" style={{ '--stagger': idx }}>
                <span className="food-step-icon">{item.icon}</span>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Partner CTA ── */}
        <section
          className="card section-card"
          style={{
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            border: 'none',
            textAlign: 'center',
            padding: '3rem 2rem',
          }}
        >
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Partner with Makazi Plus Food</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', maxWidth: '550px', margin: '0 auto 2rem' }}>
            Are you a restaurant, caterer, or food vendor in East Africa? Join our verified network and reach thousands of travelers and residents.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register-provider" className="btn btn-primary" style={{ background: '#fff', color: '#ef4444', fontWeight: '700' }}>
              Register as a Food Partner
            </Link>
            <Link to="/contact" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}>
              Contact Our Team
            </Link>
          </div>
        </section>
      </div>

      {/* ── Glassmorphic Order Modal ── */}
      {selectedRest && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedRest(null) }}
        >
          <div
            className="card reveal-item"
            style={{
              maxWidth: '560px', width: '100%', padding: '2rem',
              background: 'var(--color-card)', border: '1px solid var(--color-border)',
              position: 'relative', overflowY: 'auto', maxHeight: '90vh', borderRadius: '20px',
            }}
          >
            <button
              onClick={() => setSelectedRest(null)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                border: 'none', background: 'rgba(0,0,0,0.1)', borderRadius: '50%',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', color: 'var(--color-text)', cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {orderSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
                <h3>Order Placed Successfully!</h3>
                <p style={{ margin: '1rem 0 2rem 0', color: 'var(--color-text-muted)' }}>
                  Your order from <strong>{selectedRest.name}</strong> ({currentCountry.flag} {currentCountry.name}) has been sent. You can track it in your dashboard.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedRest(null)} className="btn btn-secondary">Close</button>
                  <Link to="/provider-dashboard" className="btn btn-primary">Track Order</Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder}>
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{currentCountry.flag}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>Order from {selectedRest.name}</h3>
                    <small style={{ color: 'var(--color-text-muted)' }}>{currentCountry.name} · {selectedRest.city || currentCountry.cities[0]} · {currentCountry.currency}</small>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700' }}>Select Menu Items</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {currentCountry.dishes.map((dish) => {
                      const dishLabel = `${dish.name} (${currentCountry.currency} ${dish.price.toLocaleString()})`
                      return (
                        <label
                          key={dish.id}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.75rem', background: orderDetails.selectedItems.includes(dishLabel) ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                            borderRadius: '8px', cursor: 'pointer',
                            border: `1px solid ${orderDetails.selectedItems.includes(dishLabel) ? 'rgba(245,158,11,0.4)' : 'transparent'}`,
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="checkbox"
                              checked={orderDetails.selectedItems.includes(dishLabel)}
                              onChange={() => handleCheckboxChange(dishLabel)}
                            />
                            <span>{dish.name}</span>
                          </div>
                          <strong style={{ color: '#f59e0b' }}>{currentCountry.currency} {dish.price.toLocaleString()}</strong>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* City */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '700' }}>City / Area</label>
                  <select
                    value={orderDetails.city}
                    onChange={(e) => setOrderDetails((prev) => ({ ...prev, city: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  >
                    <option value="">Select city</option>
                    {currentCountry.cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Special Instructions */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '700' }}>Special Instructions</label>
                  <textarea
                    value={orderDetails.instructions}
                    onChange={(e) => setOrderDetails((prev) => ({ ...prev, instructions: e.target.value }))}
                    placeholder="e.g. Extra spice, no onions, deliver at 8 PM..."
                    style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                {/* Delivery Location */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '700' }}>Delivery Location / Room / Stay Name</label>
                  <input
                    type="text"
                    value={orderDetails.location}
                    onChange={(e) => setOrderDetails((prev) => ({ ...prev, location: e.target.value }))}
                    required
                    placeholder="e.g. Room 402 / Villa Sunset / Apartment 7B"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                {/* Phone */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '700' }}>Contact Phone Number</label>
                  <input
                    type="tel"
                    value={orderDetails.phone}
                    onChange={(e) => setOrderDetails((prev) => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder={`e.g. +254 712 345 678 or +255 754 000 000`}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none' }}
                  disabled={createRequestMutation.isLoading}
                >
                  {createRequestMutation.isLoading ? 'Placing Order...' : `Confirm & Order — ${currentCountry.currency}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
