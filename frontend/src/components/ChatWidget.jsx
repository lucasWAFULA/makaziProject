import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAiConversation, sendAiChat } from '../api/ai'

const intentOptions = [
  { key: 'property_search', labelEn: 'Find beach BnB in Diani under KSh 8,000', labelSw: 'Tafuta BnB ya ufukweni Diani chini ya KSh 8,000' },
  { key: 'taxi_booking', labelEn: 'I need a taxi from Moi Airport to Nyali', labelSw: 'Nahitaji teksi kutoka Uwanja wa Moi hadi Nyali' },
  { key: 'agent_request', labelEn: 'Show me verified agents in Mombasa', labelSw: 'Nionyeshe mawakala waliothibitishwa Mombasa' },
]

function ChatIcon() {
  return (
    <svg className="icon icon-chat" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5a1 1 0 0 1 1 1v2.1l1.8-1a1 1 0 1 1 1 1.72l-1.82 1.06 1.85 1.06a1 1 0 0 1-1 1.73l-1.83-1.03v2.06a1 1 0 1 1-2 0V9.12L9.17 10.2a1 1 0 0 1-1-1.73l1.86-1.05-1.84-1.06a1 1 0 0 1 1-1.72L11 5.65V3.5a1 1 0 0 1 1-1m-6 9h12A2.5 2.5 0 0 1 20.5 14v4A2.5 2.5 0 0 1 18 20.5H9.7a1 1 0 0 0-.6.2l-2.8 2a1.2 1.2 0 0 1-1.9-.98V20.5H4A2.5 2.5 0 0 1 1.5 18v-4A2.5 2.5 0 0 1 4 11.5"
      />
    </svg>
  )
}

export function ChatWidget() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isSending, setIsSending] = useState(false)
  const [conversationId, setConversationId] = useState(() => localStorage.getItem('ai_conversation_id') || '')
  const [clientId] = useState(() => {
    const existing = localStorage.getItem('ai_client_id')
    if (existing) return existing
    const generated = `client-${Math.random().toString(36).slice(2)}-${Date.now()}`
    localStorage.setItem('ai_client_id', generated)
    return generated
  })

  const options = useMemo(
    () => intentOptions.map((option) => ({
      ...option,
      label: i18n.language === 'sw' ? option.labelSw : option.labelEn,
    })),
    [i18n.language],
  )

  const addBotReply = (text, structured = null) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, role: 'bot', text, structured }])
  }

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, role: 'user', text }])
  }

  const submitMessage = (text) => {
    if (!text || isSending) return
    setIsSending(true)
    const fallbackReply = () => addBotReply(t('chat_thanks'))

    sendAiChat({
      client_id: clientId,
      message: text,
      conversation_id: conversationId ? Number(conversationId) : undefined,
    })
      .then((payload) => {
        const newConversationId = String(payload.conversation_id || '')
        if (newConversationId && newConversationId !== conversationId) {
          setConversationId(newConversationId)
          localStorage.setItem('ai_conversation_id', newConversationId)
        }
        const userMessage = payload.user_message || {}
        const botMessage = payload.assistant_message || {}
        setMessages((prev) => [
          ...prev,
          { id: userMessage.id || prev.length + 1, role: 'user', text: userMessage.content || text },
          {
            id: botMessage.id || prev.length + 2,
            role: 'bot',
            text: botMessage.content || t('chat_thanks'),
            structured: botMessage.structured_response || null,
          },
        ])
      })
      .catch(() => {
        addUserMessage(text)
        fallbackReply()
      })
      .finally(() => {
        setInput('')
        setIsSending(false)
      })
  }

  const handleIntent = (intentKey, label) => {
    submitMessage(label || intentKey)
  }

  const handleSend = (event) => {
    event.preventDefault()
    submitMessage(input.trim())
  }

  useEffect(() => {
    if (!conversationId) {
      setMessages([
        { id: 1, role: 'bot', text: t('ai_chat_welcome') },
        { id: 2, role: 'bot', text: t('ai_chat_prompt') },
      ])
      return
    }
    getAiConversation(conversationId, clientId)
      .then((conversation) => {
        const mapped = (conversation.messages || []).map((item) => ({
          id: item.id,
          role: item.role === 'user' ? 'user' : 'bot',
          text: item.content,
          structured: item.structured_response || null,
        }))
        setMessages(
          mapped.length > 0
            ? mapped
            : [
                { id: 1, role: 'bot', text: t('ai_chat_welcome') },
                { id: 2, role: 'bot', text: t('ai_chat_prompt') },
              ],
        )
      })
      .catch(() => {
        localStorage.removeItem('ai_conversation_id')
        setConversationId('')
        setMessages([
          { id: 1, role: 'bot', text: t('ai_chat_welcome') },
          { id: 2, role: 'bot', text: t('ai_chat_prompt') },
        ])
      })
  }, [conversationId, clientId, t])

  return (
    <section className="chat-widget" aria-live="polite">
      {!isOpen ? (
        <button type="button" className="btn btn-accent chat-widget-toggle" onClick={() => setIsOpen(true)}>
          <ChatIcon />
          {t('ai_chat_now')}
        </button>
      ) : (
        <div className="chat-panel card">
          <div className="chat-panel-header">
            <strong>{t('ai_assistant_name')}</strong>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label={t('close_chat')}
            >
              ×
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chat-bubble ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                <p>{message.text}</p>
                {message.role === 'bot' && Array.isArray(message.structured?.results) && message.structured.results.length > 0 ? (
                  <div className="ai-results-list">
                    {message.structured.results.slice(0, 3).map((result, idx) => (
                      <article className="ai-result-card" key={`${message.id}-${idx}`}>
                        <strong>{result.title || result.name || t('ai_result_item')}</strong>
                        {result.location ? <p>{result.location}</p> : null}
                        {result.price ? <p>{t('price_per_night')}: {Number(result.price).toLocaleString()}</p> : null}
                        {Array.isArray(result.actions) && result.actions.length > 0 ? (
                          <div className="ai-result-actions">
                            {result.actions.slice(0, 3).map((action) => (
                              <span key={action}>{action}</span>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : null}
                {message.role === 'bot' && Array.isArray(message.structured?.sources) && message.structured.sources.length > 0 ? (
                  <div className="ai-sources">
                    {message.structured.sources.slice(0, 2).map((source, idx) => (
                      <span key={`${message.id}-src-${idx}`}>{source.title || t('ai_source_label')}</span>
                    ))}
                  </div>
                ) : null}
                {message.role === 'bot' && message.structured?.escalate_to_human ? (
                  <a
                    href="https://wa.me/255700000111"
                    target="_blank"
                    rel="noreferrer"
                    className="ai-human-escalation"
                  >
                    {t('ai_talk_to_human')}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
          <div className="chat-intents">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleIntent(option.key, option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <form className="chat-form" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('chat_placeholder')}
              disabled={isSending}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSending}>
              {t('send')}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
