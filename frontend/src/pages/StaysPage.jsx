import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getProperties } from '../api/properties'
import { PriceDisplay } from '../components/PriceDisplay'

const priceChips = [
  { labelKey: 'stays_price_all', value: '' },
  { labelKey: 'stays_price_budget', value: 'budget' },
  { labelKey: 'stays_price_standard', value: 'standard' },
  { labelKey: 'stays_price_premium', value: 'premium' },
  { labelKey: 'stays_price_luxury', value: 'luxury' },
]

const experienceChips = [
  { labelKey: 'stays_exp_all', value: '' },
  { labelKey: 'stays_exp_beachfront', value: 'beachfront' },
  { labelKey: 'stays_exp_city_convenience', value: 'city_convenience' },
  { labelKey: 'stays_exp_family_friendly', value: 'family_friendly' },
  { labelKey: 'stays_exp_work_friendly', value: 'work_friendly' },
  { labelKey: 'stays_exp_luxury', value: 'luxury' },
]

const typeChips = [
  { labelKey: 'stays_type_all', value: '' },
  { labelKey: 'stays_type_apartment', value: 'apartment' },
  { labelKey: 'stays_type_villa', value: 'villa' },
  { labelKey: 'stays_type_bnb', value: 'bnb' },
  { labelKey: 'stays_type_hotel', value: 'hotel' },
  { labelKey: 'stays_type_house', value: 'house' },
]

function formatTag(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getVerificationBadgeKey(item) {
  const tier = String(item?.verification_tier || '').toLowerCase()
  if (tier === 'premium_verified') return 'stays_badge_premium_verified'
  if (tier === 'remote_verified') return 'stays_badge_remote_verified'
  if (tier === 'unverified') return 'stays_badge_unverified'
  return ''
}

function StayCard({ item }) {
  const { t, i18n } = useTranslation()
  const verificationBadgeKey = getVerificationBadgeKey(item)
  const verificationBadge = verificationBadgeKey ? t(verificationBadgeKey) : ''

  const tags = Array.isArray(item.experience_tags) && item.experience_tags.length
    ? item.experience_tags.slice(0, 3).map((tag) => {
        const key = `stays_exp_${tag}`
        return i18n.exists(key) ? t(key) : formatTag(tag)
      })
    : [
        item.price_tier ? (i18n.exists(`stays_price_${item.price_tier}`) ? t(`stays_price_${item.price_tier}`) : formatTag(item.price_tier)) : t('stays_tag_verified_stay'),
        item.listing_type ? (i18n.exists(`stays_type_${item.listing_type}`) ? t(`stays_type_${item.listing_type}`) : formatTag(item.listing_type)) : t('stays_tag_makazi_plus')
      ]

  return (
    <article className="premium-listing-card">
      <div className="premium-listing-media">
        {item.first_image ? <img src={item.first_image} alt="" loading="lazy" /> : <span className="no-image" />}
      </div>
      <div className="premium-listing-body">
        <strong>{item.title_sw || item.title}</strong>
        <p className="property-card-meta">{item.location || item.town || item.region}</p>
        <div className="listing-tags">
          {verificationBadge && <span>{verificationBadge}</span>}
          {tags.map((tag) => <span key={`${item.id}-${tag}`}>{tag}</span>)}
        </div>
        <div className="listing-card-footer">
          <PriceDisplay amount={item.price_per_night} baseCurrency={item.base_currency} />
          <Link to={`/property/${item.id}${item.slug ? '-' + item.slug : ''}`} className="btn btn-secondary btn-sm">{t('stays_view_details')}</Link>
        </div>
      </div>
    </article>
  )
}

export function StaysPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({
    location: '',
    priceTier: '',
    experience: '',
    listingType: '',
  })

  const queryParams = useMemo(() => ({
    location: filters.location || undefined,
    price_tier: filters.priceTier || undefined,
    experience: filters.experience || undefined,
    listing_type: filters.listingType || undefined,
  }), [filters])

  const { data: stays = [], isLoading } = useQuery({
    queryKey: ['stays-page', queryParams],
    queryFn: () => getProperties(queryParams),
  })

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="page-stack">
      <section className="page-hero-card stays-page-hero">
        <span className="section-kicker">{t('stays_hero_kicker')}</span>
        <h1>{t('stays_hero_title')}</h1>
        <p>{t('stays_hero_desc')}</p>
        <div className="page-search-row">
          <input
            value={filters.location}
            onChange={(event) => updateFilter('location', event.target.value)}
            placeholder={t('stays_search_placeholder')}
          />
          <button type="button" className="btn btn-accent">{t('stays_search_btn')}</button>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t('stays_filter_kicker')}</span>
            <h2>{t('stays_filter_title')}</h2>
          </div>
        </div>
        <div className="filter-panel-grid">
          <div>
            <strong>{t('stays_filter_price')}</strong>
            <div className="filter-chip-row">
              {priceChips.map((chip) => (
                <button key={chip.value || 'all-price'} type="button" className={filters.priceTier === chip.value ? 'is-active' : ''} onClick={() => updateFilter('priceTier', chip.value)}>
                  {t(chip.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <strong>{t('stays_filter_experience')}</strong>
            <div className="filter-chip-row">
              {experienceChips.map((chip) => (
                <button key={chip.value || 'all-experience'} type="button" className={filters.experience === chip.value ? 'is-active' : ''} onClick={() => updateFilter('experience', chip.value)}>
                  {t(chip.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <strong>{t('stays_filter_type')}</strong>
            <div className="filter-chip-row">
              {typeChips.map((chip) => (
                <button key={chip.value || 'all-type'} type="button" className={filters.listingType === chip.value ? 'is-active' : ''} onClick={() => updateFilter('listingType', chip.value)}>
                  {t(chip.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <span className="section-kicker">{t('stays_list_kicker')}</span>
            <h2>{isLoading ? t('stays_list_loading_title') : t('stays_list_found_title', { count: stays.length })}</h2>
          </div>
        </div>
        {isLoading ? (
          <p>{t('stays_loading')}</p>
        ) : stays.length === 0 ? (
          <p>{t('stays_none_found')}</p>
        ) : (
          <div className="grid grid-3">
            {stays.map((item) => <StayCard key={item.id} item={item} />)}
          </div>
        )}
      </section>
    </div>
  )
}

