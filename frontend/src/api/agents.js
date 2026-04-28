import api from './client'
import { asList } from './normalizeList'

export async function getAgents(params = {}) {
  const res = await api.get('agents/profiles/', { params })
  return asList(res.data)
}
