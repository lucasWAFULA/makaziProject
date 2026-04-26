import api from './client'

export async function createReview(bookingId, rating, commentSw) {
  const res = await api.post('/reviews/', {
    booking: bookingId,
    rating,
    comment_sw: commentSw,
  })
  return res.data
}
