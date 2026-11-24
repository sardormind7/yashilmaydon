import { create } from 'zustand'
import { api } from '../services/api'
import type { User } from '../types'
interface AuthState {
  user: User | null
  loading: boolean
  hydrate: () => Promise<void>
  login: (phone: string, password: string) => Promise<void>
  register: (input: Pick<User, 'name' | 'phone' | 'password'>) => Promise<void>
  logout: () => Promise<void>
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hydrate: async () => {
    const user = await api.getSession()
    set({ user, loading: false })
  },
  login: async (phone, password) => set({ user: await api.login(phone, password) }),
  register: async (input) => set({ user: await api.register(input) }),
  logout: async () => {
    await api.logout()
    set({ user: null })
  },
}))
