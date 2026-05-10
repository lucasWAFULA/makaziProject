/**
 * GooglePlacePicker
 * Autocomplete input that uses the Google Places API to let agents
 * pick any location and returns { formatted_address, lat, lng, country, city, place_name }.
 *
 * Requires:
 *   VITE_GOOGLE_MAPS_KEY env variable to be set.
 *   The Maps JS script is loaded lazily on first render.
 */
import { useEffect, useRef, useState } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

let scriptLoaded = false
let scriptLoading = false
const callbacks = []

function loadGoogleMaps(cb) {
  if (scriptLoaded) { cb(); return }
  callbacks.push(cb)
  if (scriptLoading) return
  scriptLoading = true
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`
  script.async = true
  script.defer = true
  script.onload = () => {
    scriptLoaded = true
    callbacks.forEach((fn) => fn())
    callbacks.length = 0
  }
  document.head.appendChild(script)
}

/**
 * @param {Object} props
 * @param {string}   props.value          — current formatted address string
 * @param {Function} props.onChange        — called with { address, lat, lng, country, city }
 * @param {string}   [props.placeholder]
 * @param {string}   [props.className]
 */
export function GooglePlacePicker({ value, onChange, placeholder = 'Search for a location…', className = '' }) {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const [inputValue, setInputValue] = useState(value || '')
  const [ready, setReady] = useState(scriptLoaded)

  // Keep display value in sync when parent clears it
  useEffect(() => { setInputValue(value || '') }, [value])

  useEffect(() => {
    if (!API_KEY) return // No key — plain text input fallback
    loadGoogleMaps(() => {
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return
    if (!window.google?.maps?.places) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      // Bias toward East Africa but allow global
      componentRestrictions: null,
      fields: ['formatted_address', 'geometry', 'address_components', 'name'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const formatted = place.formatted_address || place.name || ''

      // Extract country and city from address_components
      let country = ''
      let city = ''
      for (const comp of place.address_components || []) {
        if (comp.types.includes('country')) country = comp.short_name
        if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')) city = comp.long_name
      }

      setInputValue(formatted)
      onChange({ address: formatted, lat, lng, country, city, place_name: place.name || '' })
    })

    autocompleteRef.current = autocomplete
  }, [ready])

  if (!API_KEY) {
    // Graceful fallback — plain input, no geocoding
    return (
      <div className="google-place-picker-wrap">
        <input
          type="text"
          className={`google-place-input ${className}`}
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            setInputValue(e.target.value)
            onChange({ address: e.target.value, lat: null, lng: null, country: '', city: '' })
          }}
        />
        <small className="place-picker-note">⚠️ Google Maps key not set — free-text only.</small>
      </div>
    )
  }

  return (
    <div className="google-place-picker-wrap">
      <span className="place-picker-pin" aria-hidden="true">📍</span>
      <input
        ref={inputRef}
        type="text"
        className={`google-place-input ${className}`}
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => setInputValue(e.target.value)}
        autoComplete="off"
      />
      {inputValue && (
        <button
          type="button"
          className="place-picker-clear"
          onClick={() => {
            setInputValue('')
            onChange({ address: '', lat: null, lng: null, country: '', city: '' })
          }}
          aria-label="Clear location"
        >
          ×
        </button>
      )}
    </div>
  )
}
