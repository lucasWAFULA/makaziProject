import api from './client'
import { asList } from './normalizeList'

export async function getProperties(params = {}) {
  const res = await api.get('properties/', { params })
  return asList(res.data)
}

export async function getProperty(id) {
  const res = await api.get(`properties/${id}/`)
  return res.data
}

export async function createProperty(data) {
  const res = await api.post('properties/', data)
  return res.data
}

export async function updateProperty(id, data) {
  const res = await api.patch(`properties/${id}/`, data)
  return res.data
}

export async function getMyProperties() {
  const res = await api.get('properties/', { params: { mine: 1 } })
  return asList(res.data)
}

export async function getAvailability(propertyId) {
  const res = await api.get(`bookings/availability/${propertyId}/`)
  return asList(res.data)
}

export async function getPropertyReviews(propertyId) {
  const res = await api.get(`reviews/property/${propertyId}/`)
  return asList(res.data)
}

// ── Taxonomy catalogue endpoints ──────────────────────────────────────────────

export async function getPropertyCategories() {
  const res = await api.get('properties/categories/')
  return Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
}

export async function getPropertyFeatures(group = null) {
  const params = group ? { group } : {}
  const res = await api.get('properties/features/', { params })
  return Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
}

export async function importPropertyFromUrl(url) {
  const res = await api.post('properties/import-url/', { url })
  return res.data
}
