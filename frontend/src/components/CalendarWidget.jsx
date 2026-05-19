import { useState, useMemo } from 'react'

export function CalendarWidget({ availableDates = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Get first day of month (0 = Sunday)
    const firstDay = new Date(year, month, 1).getDay()
    // Get total days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    
    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      // Check if this date is in availableDates array
      const isAvailable = availableDates.some(d => d.date === dateStr)
      days.push({ day: i, dateStr, isAvailable })
    }

    return days
  }, [currentDate, availableDates])

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="calendar-widget" style={{ padding: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&larr;</button>
        <strong style={{ fontSize: '1.1rem' }}>{monthName}</strong>
        <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&rarr;</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
        {calendarDays.map((dayObj, index) => {
          if (!dayObj) return <div key={`empty-${index}`} />
          
          return (
            <button
              key={dayObj.dateStr}
              type="button"
              disabled={!dayObj.isAvailable}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1px solid transparent',
                background: dayObj.isAvailable ? '#f8fafc' : '#fff',
                color: dayObj.isAvailable ? 'var(--color-text)' : '#cbd5e1',
                cursor: dayObj.isAvailable ? 'pointer' : 'not-allowed',
                fontWeight: dayObj.isAvailable ? '600' : '400',
                textDecoration: dayObj.isAvailable ? 'none' : 'line-through'
              }}
              onMouseEnter={(e) => { if(dayObj.isAvailable) { e.currentTarget.style.border = '1px solid var(--color-primary)' } }}
              onMouseLeave={(e) => { if(dayObj.isAvailable) { e.currentTarget.style.border = '1px solid transparent' } }}
            >
              {dayObj.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
