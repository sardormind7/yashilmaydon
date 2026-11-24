import { create } from 'zustand'
type Theme = 'light' | 'dark'
interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}
const initialTheme: Theme =
  (localStorage.getItem('ym_theme') as Theme | null) ??
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    localStorage.setItem('ym_theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    set({ theme })
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))
