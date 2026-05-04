import { useEffect, useState } from 'react'

export function SplashScreen({ onFinish }) {
  const [isLeaving, setIsLeaving] = useState(false)

  const finish = (delay = 320) => {
    setIsLeaving(true)
    window.setTimeout(onFinish, delay)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => finish(520), 1500)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <button
      type="button"
      className={`splash-screen ${isLeaving ? 'is-leaving' : ''}`}
      onClick={() => finish()}
      aria-label="Skip MakaziPlus intro"
    >
      <span className="splash-glow" />
      <img src="/logo.png" alt="MakaziPlus.co" className="splash-logo" />
      <strong>MakaziPlus.co</strong>
      <small>Nyumba. Safari. Mazingira Bora.</small>
      <em>Click to skip</em>
    </button>
  )
}
