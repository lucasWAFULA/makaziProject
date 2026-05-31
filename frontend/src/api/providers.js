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
