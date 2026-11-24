import { create } from 'zustand'
import { api } from '../services/api'
import type { Booking } from '../types'
interface BookingState {
  bookings: Booking[]
  loading: boolean
  load: () => Promise<void>
  add: (input: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Promise<void>
  update: (id: string, status: Booking['status']) => Promise<void>
}
export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  loading: false,
  load: async () => {
    set({ loading: true })
    try {
      set({ bookings: await api.getBookings() })
    } finally {
      set({ loading: false })
    }
  },
  add: async (input) => {
    await api.createBooking(input)
    await get().load()
  },
  update: async (id, status) => {
    await api.updateBooking(id, status)
    await get().load()
  },
}))
