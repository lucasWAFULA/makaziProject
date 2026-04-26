import api from './client'

export async function getDestinations(params = {}) {
  const res = await api.get('/destinations/', { params })
  return res.data
}

export async function getDestinationBySlug(slug) {
  const res = await api.get(`/destinations/${slug}/`)
  return res.data
}

export async function getFeaturedDestinations() {
  const res = await api.get('/destinations/', { params: { featured: 1 } })
  return res.data
}
