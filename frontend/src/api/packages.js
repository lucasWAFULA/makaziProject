import api from './client'
import { asList } from './normalizeList'

export async function getPackages(params = {}) {
  const res = await api.get('packages/', { params })
  return asList(res.data)
}
