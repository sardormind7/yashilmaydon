import { addDays, format, startOfWeek } from 'date-fns'
import { stadium, slotPrice } from '../config/stadium'
import type { Booking, BookingStatus, ContactMessage, User } from '../types'

const keys = {
  users: 'ym_users',
  session: 'ym_session',
  bookings: 'ym_bookings',
  messages: 'ym_messages',
} as const
export type ApiErrorCode =
  'PHONE_TAKEN' | 'INVALID_CREDENTIALS' | 'SLOT_TAKEN' | 'BOOKING_NOT_FOUND'
export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode) {
    super(code)
    this.name = 'ApiError'
    this.code = code
  }
}
const delay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 180))
const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
const write = <T>(key: string, value: T) => localStorage.setItem(key, JSON.stringify(value))
const seed = () => {
  if (!localStorage.getItem(keys.users))
    write<User[]>(keys.users, [
      {
        id: 'admin',
        name: 'Administrator',
        phone: '+998900000000',
        password: 'admin123',
        role: 'admin',
      },
    ])
  if (!localStorage.getItem(keys.bookings)) {
    const today = new Date()
    const week = startOfWeek(today, { weekStartsOn: 1 })
    const samples: Booking[] = [
      {
        id: 'seed-1',
        userId: 'sample',
        userName: 'Azizbek',
        phone: '+998901112233',
        date: format(addDays(week, 1), 'yyyy-MM-dd'),
        hour: 18,
        status: 'confirmed',
        note: '',
        price: slotPrice(18),
        createdAt: today.toISOString(),
      },
      {
        id: 'seed-2',
        userId: 'sample',
        userName: 'Javohir',
        phone: '+998907778899',
        date: format(addDays(week, 3), 'yyyy-MM-dd'),
        hour: 20,
        status: 'pending',
        note: '',
        price: slotPrice(20),
        createdAt: today.toISOString(),
      },
    ]
    write(keys.bookings, samples)
  }
  if (!localStorage.getItem(keys.messages)) write<ContactMessage[]>(keys.messages, [])
}
seed()

export const api = {
  async getSession(): Promise<User | null> {
    await delay()
    return read<User | null>(keys.session, null)
  },
  async register(input: Pick<User, 'name' | 'phone' | 'password'>): Promise<User> {
    await delay()
    const users = read<User[]>(keys.users, [])
    if (users.some((user) => user.phone === input.phone)) throw new ApiError('PHONE_TAKEN')
    const user: User = { ...input, id: crypto.randomUUID(), role: 'user' }
    write(keys.users, [...users, user])
    write(keys.session, user)
    return user
  },
  async login(phone: string, password: string): Promise<User> {
    await delay()
    const user = read<User[]>(keys.users, []).find(
      (item) => item.phone === phone && item.password === password,
    )
    if (!user) throw new ApiError('INVALID_CREDENTIALS')
    write(keys.session, user)
    return user
  },
  async logout(): Promise<void> {
    await delay()
    localStorage.removeItem(keys.session)
  },
  async getBookings(): Promise<Booking[]> {
    await delay()
    return read<Booking[]>(keys.bookings, [])
  },
  async createBooking(input: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
    await delay()
    const all = read<Booking[]>(keys.bookings, [])
    if (
      all.some(
        (item) =>
          item.date === input.date && item.hour === input.hour && item.status !== 'cancelled',
      )
    )
      throw new ApiError('SLOT_TAKEN')
    const booking: Booking = {
      ...input,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    write(keys.bookings, [...all, booking])
    return booking
  },
  async updateBooking(id: string, status: BookingStatus): Promise<void> {
    await delay()
    const all = read<Booking[]>(keys.bookings, [])
    if (!all.some((item) => item.id === id)) throw new ApiError('BOOKING_NOT_FOUND')
    write(
      keys.bookings,
      all.map((item) => (item.id === id ? { ...item, status } : item)),
    )
  },
  async createMessage(input: Pick<ContactMessage, 'name' | 'phone' | 'message'>): Promise<void> {
    await delay()
    const all = read<ContactMessage[]>(keys.messages, [])
    write(keys.messages, [
      { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false },
      ...all,
    ])
  },
  async getMessages(): Promise<ContactMessage[]> {
    await delay()
    return read<ContactMessage[]>(keys.messages, [])
  },
  async markMessageRead(id: string): Promise<void> {
    const messages = read<ContactMessage[]>(keys.messages, [])
    write(
      keys.messages,
      messages.map((message) =>
        message.id === id ? { ...message, read: !message.read } : message,
      ),
    )
  },
  async setSlot(date: string, hour: number, status: BookingStatus): Promise<void> {
    await delay()
    const bookings = read<Booking[]>(keys.bookings, []).filter(
      (item) => !(item.date === date && item.hour === hour && item.status !== 'cancelled'),
    )
    write(keys.bookings, [
      ...bookings,
      {
        id: crypto.randomUUID(),
        userId: 'admin',
        userName: stadium.name,
        phone: '',
        date,
        hour,
        status,
        note: '',
        price: slotPrice(hour),
        createdAt: new Date().toISOString(),
      },
    ])
  },
}
