export function isOwnerDashboardUser(user) {
  if (!user) return false
  const r = user.role
  return (
    r === 'host'
    || r === 'hotel_admin'
    || r === 'admin'
    || r === 'agent'
    || !!user.is_staff
  )
}

/** Post-login route: owners/agents → owner hub; everyone else → explore stays */
export function getPostLoginPath(user) {
  if (!user) return '/stays'
  if (isOwnerDashboardUser(user)) return '/owner-dashboard'
  return '/stays'
}

/** Display name: first + last if present, else username/email prefix */
export function getUserDisplayName(user) {
  if (!user) return ''
  const fn = (user.first_name || '').trim()
  const ln = (user.last_name || '').trim()
  if (fn && ln) return `${fn} ${ln}`
  if (fn) return fn
  const u = (user.username || '').trim()
  if (u) return u
  const em = (user.email || '').split('@')[0]
  return em || 'Guest'
}

export function getUserInitials(user) {
  const name = getUserDisplayName(user)
  const parts = name.split(/[\s._-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  }
  return name.slice(0, 2).toUpperCase() || '?'
}
