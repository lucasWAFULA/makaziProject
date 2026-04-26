import api from './client'

export async function createBooking(propertyId, checkIn, checkOut) {
  const res = await api.post('/bookings/', {
    property: propertyId,
    check_in: checkIn,
    check_out: checkOut,
  })
  return res.data
}

export async function getMyBookings() {
  const res = await api.get('/bookings/my/')
  return res.data
}
