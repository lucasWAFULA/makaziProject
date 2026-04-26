import api from './client'

export async function createTaxiBooking(payload) {
  const res = await api.post('/taxi/bookings/', payload)
  return res.data
}

export async function getMyTaxiBookings() {
  const res = await api.get('/taxi/bookings/my/')
  return res.data
}

export async function getTransportRoutes(params = {}) {
  const res = await api.get('/taxi/routes/', { params })
  return res.data
}

export async function getTransportPartners(params = {}) {
  const res = await api.get('/taxi/partners/', { params })
  return res.data
}
