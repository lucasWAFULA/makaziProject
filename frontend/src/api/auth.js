import api from './client'

export async function register(data) {
  const res = await api.post('/auth/register/', data)
  return res.data
}

export async function login(emailOrUsername, password) {
  const res = await api.post('/auth/login/', { username: emailOrUsername, password })
  return res.data
}

export function setTokens(access, refresh) {
  if (access) localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}

export function getAccessToken() {
  return localStorage.getItem('access_token')
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export async function getMe() {
  const res = await api.get('/auth/me/')
  return res.data
}
