import api from './client'

export async function sendAiChat(payload) {
  const res = await api.post('chat/ai/chat/', payload)
  return res.data
}

export async function getAiConversation(conversationId, clientId) {
  const res = await api.get(`chat/ai/conversations/${conversationId}/`, {
    params: { client_id: clientId },
  })
  return res.data
}
