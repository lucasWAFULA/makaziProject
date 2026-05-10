import { useTranslation } from 'react-i18next'

export function useLegalLang() {
  const { i18n } = useTranslation()
  const lang = String(i18n.language || 'en').toLowerCase()
  if (lang.startsWith('sw') || lang === 'tz') return 'sw'
  return 'en'
}
