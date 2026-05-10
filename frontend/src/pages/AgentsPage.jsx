import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getAgents } from '../api/agents'

const fallbackAgents = [
  {
    id: 'fatma',
    agency_name: 'Fatma Ali',
    areas_served: 'Mombasa, Nyali',
    languages: 'Kiswahili,English',
    verified_badge: true,
    rating: 4.8,
    user: { phone_number: '254725301031' },
  },
  {
    id: 'juma',
    agency_name: 'Juma Coastal Homes',
    areas_served: 'Diani, Ukunda',
    languages: 'Kiswahili,English',
    verified_badge: true,
    rating: 4.7,
    user: { phone_number: '254725301031' },
  },
]

function buildAgentWhatsappLink(agent) {
  const phone = (agent.user?.phone_number || '254725301031').replace(/[^\d]/g, '')
  const name = agent.agency_name || agent.user?.username || 'MakaziPlus Agent'
  const message = encodeURIComponent(`Hello ${name}, I found you on MakaziPlus and need help finding a verified stay.`)
  return `https://wa.me/${phone}?text=${message}`
}

function getBadges(agent) {
  const areas = String(agent.areas_served || '').split(',').map((area) => area.trim()).filter(Boolean)
  return [
    ...areas.slice(0, 2),
    agent.verified_badge ? 'Verified' : '',
    Number(agent.rating || 0) >= 4.5 ? 'Available now' : '',
  ].filter(Boolean).slice(0, 4)
}

export function AgentsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { data: agentData = [], isLoading } = useQuery({
    queryKey: ['agents-page'],
    queryFn: () => getAgents({ verified: '1' }),
  })

  const agents = agentData.length ? agentData : fallbackAgents
  const filteredAgents = useMemo(() => agents.filter((agent) => {
    const haystack = [agent.agency_name, agent.areas_served, agent.languages, agent.user?.username].join(' ').toLowerCase()
    const matchesSearch = !search || haystack.includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'available' && (agent.verified_badge || Number(agent.rating || 0) >= 4.5)) || haystack.includes(filter.toLowerCase())
    return matchesSearch && matchesFilter
  }), [agents, filter, search])

  const coverageAreas = [...new Set(agents.flatMap((agent) => String(agent.areas_served || '').split(',').map((area) => area.trim()).filter(Boolean)))]
  const availableAgents = agents.filter((agent) => agent.verified_badge || Number(agent.rating || 0) >= 4.5)
  const filters = ['all', 'available', 'Mombasa', 'Diani', 'Watamu', 'Zanzibar', 'BnB', 'Apartments']

  return (
    <div className="page-stack">
      <section className="page-hero-card agents-page-hero">
        <span className="section-kicker">Trusted coastal booking platform</span>
        <div className="agent-marketplace-head">
          <div>
            <h1>Verified Agents Near You</h1>
            <p>Search by location, property type, or agent name. Every listed agent is checked for contact, coverage, and service quality.</p>
          </div>
          <div className="agent-live-stats">
            <span><strong>{agents.filter((agent) => agent.verified_badge).length}</strong>Verified agents</span>
            <span><strong>{coverageAreas.length || 'Pwani'}</strong>Areas served</span>
            <span><strong>{availableAgents.length}</strong>Available now</span>
            <span><strong>7m</strong>Avg response</span>
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="agent-marketplace-tools">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by location, property type, or agent name..." />
          <div className="agent-filter-chips">
            {filters.map((item) => (
              <button key={item} type="button" className={filter === item ? 'is-active' : ''} onClick={() => setFilter(item)}>
                {item === 'all' ? 'All' : item === 'available' ? 'Available now' : item}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? <p>Loading agents...</p> : null}
        <div className="agent-directory-grid">
          {filteredAgents.map((agent) => (
            <article key={agent.id} className="trust-agent-card agent-live-card">
              <span className="trust-agent-avatar">A</span>
              <div className="trust-agent-content">
                <div className="agent-card-title-row">
                  <strong>{agent.agency_name || agent.user?.username}</strong>
                  {agent.verified_badge && <span className="trust-agent-verified">OK</span>}
                </div>
                <p>Verified Agent - {agent.areas_served || 'Coastal region'}</p>
                <div className="agent-badge-row">
                  {getBadges(agent).map((badge) => <span key={`${agent.id}-${badge}`}>{badge}</span>)}
                </div>
                <p className="trust-agent-meta"><span className="trust-agent-status-dot" /> {Number(agent.rating || 0).toFixed(1)} stars - replies in ~9 mins</p>
                <div className="agent-card-actions">
                  <a className="btn btn-whatsapp btn-sm" href={buildAgentWhatsappLink(agent)} target="_blank" rel="noreferrer">WhatsApp</a>
                  <Link to="/stays" className="btn btn-secondary btn-sm">View listings</Link>
                </div>
              </div>
            </article>
          ))}
          <article className="trust-agent-card agent-live-card agent-join-card">
            <span className="trust-agent-avatar">+</span>
            <div className="trust-agent-content">
              <strong>Grow with MakaziPlus</strong>
              <p>List properties, receive verified leads, and respond through WhatsApp.</p>
              <div className="agent-card-actions">
                <Link to="/register" className="btn btn-accent btn-sm">Register as Agent</Link>
                <Link to="/property/new" className="btn btn-secondary btn-sm">Add property</Link>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
