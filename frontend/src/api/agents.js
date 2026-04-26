import api from './client'

export async function getAgents(params = {}) {
  const res = await api.get('/agents/profiles/', { params })
  return res.data
}
