import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import api from '../api/client'

const CurrencyContext = createContext()

// Map timezones to default currencies for Africa
function getLocalCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz.includes('Nairobi')) return 'KES'
    if (tz.includes('Dar_es_Salaam')) return 'TZS'
    if (tz.includes('Kampala')) return 'UGX'
    if (tz.includes('Kigali')) return 'RWF'
    if (tz.includes('Addis_Ababa')) return 'ETB'
    return 'USD'
  } catch (e) {
    return 'USD'
  }
}

export function CurrencyProvider({ children }) {
  const [currencies, setCurrencies] = useState([])
  const [rates, setRates] = useState({ USD: 1 }) // fallback base USD
  const [activeCode, setActiveCode] = useState(() => {
    return localStorage.getItem('makazi_currency') || getLocalCurrency()
  })
  const [loading, setLoading] = useState(true)

  // Load currencies and rates on mount
  useEffect(() => {
    async function fetchCurrencyData() {
      try {
        const [currRes, ratesRes] = await Promise.all([
          api.get('currencies/'),
          api.get(`currencies/exchange-rates/?base=${activeCode}`)
        ])
        setCurrencies(currRes.data)
        setRates(ratesRes.data.rates || { [activeCode]: 1 })
      } catch (err) {
        console.error('Failed to load currency data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCurrencyData()
  }, [activeCode])

  // When user changes currency manually
  const setCurrency = (code) => {
    setActiveCode(code)
    localStorage.setItem('makazi_currency', code)
  }

  const activeCurrency = useMemo(() => {
    return currencies.find((c) => c.code === activeCode) || { code: activeCode, symbol: activeCode }
  }, [currencies, activeCode])

  const value = {
    currencies,
    rates,
    activeCode,
    activeCurrency,
    setCurrency,
    loading
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }

  // Helper to format a base price/currency into the active UI currency
  const convertAndFormat = (amount, baseCurrencyCode) => {
    amount = parseFloat(amount) || 0
    if (!baseCurrencyCode || baseCurrencyCode === context.activeCode) {
      // Same currency — no conversion needed
      return {
        amount,
        formatted: `${context.activeCurrency.symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        isConverted: false
      }
    }

    // Convert: amount_in_base * rate_base_to_target
    // (Note: rates context is already pivoted so it represents: 1 activeCode = X targetCode)
    // Actually, rates context from API: ?base=KES means 1 KES = X target.
    // So if context.activeCode = USD, rates are 1 USD = X baseCurrencyCode.
    // To convert amount in KES to USD: amount / rate_USD_to_KES
    const rate = context.rates[baseCurrencyCode]
    if (!rate) {
      // Missing rate — fallback to original display
      return {
        amount,
        formatted: `${baseCurrencyCode} ${amount.toLocaleString()}`,
        isConverted: false
      }
    }

    const convertedAmount = amount / rate
    return {
      amount: convertedAmount,
      formatted: `≈ ${context.activeCurrency.symbol} ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      isConverted: true
    }
  }

  return { ...context, convertAndFormat }
}
