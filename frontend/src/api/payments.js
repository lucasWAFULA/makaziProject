import api from './client'

export async function initiateMpesa(bookingId, phone) {
  const res = await api.post('payments/mpesa/initiate/', {
    booking_id: bookingId,
    phone,
  })
  return res.data
}
