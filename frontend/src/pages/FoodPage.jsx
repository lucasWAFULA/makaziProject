import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function FoodPage() {
  const { t } = useTranslation()

  return (
    <div className="food-page">
      <header className="food-hero hero-animate">
        <span className="hero-kicker">Food Delivery Services</span>
        <h1 className="hero-title">Food Delivery for Homes, Apartments, Offices, and Communities</h1>
        <p className="hero-tagline">Makazi Plus makes everyday living more convenient by connecting residents, tenants, homeowners, offices, and communities with nearby restaurants and food vendors. Whether you are at home, at work, or managing a property, you can order meals and have them delivered quickly and reliably.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#restaurants" className="btn btn-primary">{t('cta_browse_restaurants')}</a>
        </div>
      </header>

      <section className="card section-card food-integration-note">
        <p>🏠 <strong>Integrated with your stay</strong> — When you book a property on MakaziPlus, nearby restaurants and food services are automatically available through your booking dashboard.</p>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <h2>Services Offered</h2>
        </div>
        <div className="food-categories-grid">
          <div className="food-category-card reveal-item" style={{ '--stagger': 0 }}>
            <span className="food-cat-icon">🍽️</span>
            <strong>Restaurant meal delivery</strong>
          </div>
          <div className="food-category-card reveal-item" style={{ '--stagger': 1 }}>
            <span className="food-cat-icon">🛒</span>
            <strong>Grocery & convenience item delivery</strong>
          </div>
          <div className="food-category-card reveal-item" style={{ '--stagger': 2 }}>
            <span className="food-cat-icon">🍱</span>
            <strong>Office lunch delivery</strong>
          </div>
          <div className="food-category-card reveal-item" style={{ '--stagger': 3 }}>
            <span className="food-cat-icon">🏘️</span>
            <strong>Apartment & gated-community delivery</strong>
          </div>
          <div className="food-category-card reveal-item" style={{ '--stagger': 4 }}>
            <span className="food-cat-icon">🎉</span>
            <strong>Catering requests for events</strong>
          </div>
          <div className="food-category-card reveal-item" style={{ '--stagger': 5 }}>
            <span className="food-cat-icon">📅</span>
            <strong>Scheduled meal deliveries</strong>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <h2>Why Use Makazi Food?</h2>
        </div>
        <div className="food-steps-grid">
          <div className="food-step-card reveal-item" style={{ '--stagger': 0 }}>
            <span className="food-step-icon">📱</span>
            <strong>Convenient Ordering</strong>
            <p>Order easily from one platform.</p>
          </div>
          <div className="food-step-card reveal-item" style={{ '--stagger': 1 }}>
            <span className="food-step-icon">🏠</span>
            <strong>Direct Delivery</strong>
            <p>Delivery to homes, apartments, and offices.</p>
          </div>
          <div className="food-step-card reveal-item" style={{ '--stagger': 2 }}>
            <span className="food-step-icon">💳</span>
            <strong>Secure Payments</strong>
            <p>Safe and reliable payment options.</p>
          </div>
          <div className="food-step-card reveal-item" style={{ '--stagger': 3 }}>
            <span className="food-step-icon">🤝</span>
            <strong>Reliable Partners</strong>
            <p>Access to local restaurants and verified vendors.</p>
          </div>
        </div>
      </section>

      <section id="restaurants" className="card section-card">
        <div className="section-heading">
          <h2>{t('food_featured_restaurants_title', 'Featured Restaurants (Coming Soon)')}</h2>
          <p>{t('food_featured_restaurants_subtitle', 'Our partner restaurants will be listed here soon.')}</p>
        </div>
        <div className="grid grid-3">
          {[
            { name: "Mama Njeri's Kitchen", cuisine: "Local Cuisine", rating: "4.8", time: "25-35 min" },
            { name: "Coastal Grill", cuisine: "Seafood & BBQ", rating: "4.6", time: "30-40 min" },
            { name: "Zanzibar Spice House", cuisine: "Swahili Cuisine", rating: "4.9", time: "20-30 min" },
            { name: "Diani Fresh Bites", cuisine: "Healthy & Fresh", rating: "4.5", time: "15-25 min" },
            { name: "Mombasa Street Food", cuisine: "Street Food", rating: "4.7", time: "20-30 min" },
            { name: "Pwani Café", cuisine: "Coffee & Brunch", rating: "4.4", time: "15-20 min" },
          ].map((rest, idx) => (
            <article key={rest.name} className="food-restaurant-card reveal-item" style={{ '--stagger': idx }}>
              <div className="food-rest-header">
                <strong>{rest.name}</strong>
                <span className="food-rest-rating">★ {rest.rating}</span>
              </div>
              <p className="food-rest-cuisine">{rest.cuisine}</p>
              <div className="food-rest-footer">
                <span className="food-rest-time">⏱️ {rest.time}</span>
                <a href="https://wa.me/254725301031" className="btn btn-primary btn-sm" target="_blank" rel="noreferrer">{t('cta_order_now', 'Order Now')}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="food-providers-section">
        <div className="section-heading">
          <h2>Partner with Makazi Plus</h2>
          <p>Join our network of trusted service providers and grow your business.</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/providers" className="btn btn-accent">Register as a Service Provider</Link>
        </div>
      </section>
    </div>
  )
}
