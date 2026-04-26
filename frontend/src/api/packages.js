import api from './client'

export async function getPackages(params = {}) {
  const res = await api.get('/packages/', { params })
  return res.data
}
