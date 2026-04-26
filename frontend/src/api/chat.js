import api from './client'

export async function createChatSession(payload) {
  const res = await api.post('/chat/sessions/', payload)
  return res.data
}

export async function getChatSession(sessionId, clientId) {
  const res = await api.get(`/chat/sessions/${sessionId}/`, {
    params: { client_id: clientId },
  })
  return res.data
}

export async function sendChatMessage(sessionId, payload) {
  const res = await api.post(`/chat/sessions/${sessionId}/messages/`, payload)
  return res.data
}
