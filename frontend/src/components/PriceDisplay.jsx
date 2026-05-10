import { useCurrency } from '../context/CurrencyContext'

/**
 * Renders a primary price + an estimated converted price (if currencies differ).
 * Example:
 *  If base=KES, active=USD:
 *    Primary: KES 12,000/night
 *    Secondary: ≈ $93
 */
export function PriceDisplay({ amount, baseCurrency, suffix = '/night', className = '' }) {
  const { convertAndFormat, activeCode } = useCurrency()

  const safeAmount = parseFloat(amount) || 0
  const isSame = !baseCurrency || baseCurrency === activeCode
  const conversion = convertAndFormat(amount, baseCurrency)

  return (
    <div className={`price-display-wrapper ${className}`}>
      {isSame ? (
        <div className="price-primary">
          <span className="price-amount">{conversion.formatted}</span>
          {suffix && <span className="price-suffix">{suffix}</span>}
        </div>
      ) : (
        <>
          <div className="price-primary is-converted">
            <span className="price-amount">{conversion.formatted}</span>
            {suffix && <span className="price-suffix">{suffix}</span>}
          </div>
          <div className="price-secondary" title="Estimated conversion. Actual price set by host.">
            <span className="price-amount-original">{baseCurrency} {safeAmount.toLocaleString()}</span>
          </div>
        </>
      )}
    </div>
  )
}
