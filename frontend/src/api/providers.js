import api from './client'

export async function getProviderProfile() {
  const { data } = await api.get('/providers/profiles/my_profile/')
  return data
}

export async function registerProvider(formData) {
  // formData should be FormData if uploading files
  const { data } = await api.post('/providers/profiles/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function updateProviderProfile(id, formData) {
  const { data } = await api.patch(`/providers/profiles/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function getServiceRequests() {
  const { data } = await api.get('/providers/requests/')
  return data
}

export async function createServiceRequest(requestData) {
  const { data } = await api.post('/providers/requests/', requestData)
  return data
}

export async function updateServiceRequest(id, requestData) {
  const { data } = await api.patch(`/providers/requests/${id}/`, requestData)
  return data
}

export async function getApprovedProviders() {
  const { data } = await api.get('/providers/profiles/')
  return data
}
