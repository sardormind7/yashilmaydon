import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import uz from './uz.json'
import ru from './ru.json'
import en from './en.json'

type Language = 'uz' | 'ru' | 'en'
export type TranslationKey = keyof typeof uz
const dictionaries = { uz, ru, en } as const
interface I18nValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}
const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('ym_language') as Language | null) ?? 'uz',
  )
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
  const setLanguage = (next: Language) => {
    localStorage.setItem('ym_language', next)
    setLanguageState(next)
  }
  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => dictionaries[language][key] ?? uz[key],
    }),
    [language],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n I18nProvider ichida ishlatilishi kerak.')
  return context
}
