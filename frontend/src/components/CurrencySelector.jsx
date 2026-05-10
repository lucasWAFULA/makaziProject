import { useState, useRef, useEffect } from 'react'
import { useCurrency } from '../context/CurrencyContext'

export function CurrencySelector() {
  const { currencies, activeCurrency, setCurrency, loading } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (loading || currencies.length === 0) return null

  return (
    <div className="currency-selector" ref={menuRef}>
      <button
        className="currency-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <span className="currency-flag">{activeCurrency.flag_emoji}</span>
        <span className="currency-code">{activeCurrency.code}</span>
      </button>

      {isOpen && (
        <ul className="currency-menu">
          <li className="currency-menu-header">Display Currency</li>
          {currencies.map((c) => (
            <li key={c.code}>
              <button
                className={`currency-option ${c.code === activeCurrency.code ? 'is-active' : ''}`}
                onClick={() => {
                  setCurrency(c.code)
                  setIsOpen(false)
                }}
              >
                <span className="curr-flag">{c.flag_emoji}</span>
                <span className="curr-code">{c.code}</span>
                <span className="curr-name">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
