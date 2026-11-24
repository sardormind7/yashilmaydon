export type Role = 'user' | 'admin'
export interface User {
  id: string
  name: string
  phone: string
  password: string
  role: Role
}
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'blocked'
export interface Booking {
  id: string
  userId: string
  userName: string
  phone: string
  date: string
  hour: number
  status: BookingStatus
  note: string
  price: number
  createdAt: string
}
export interface ContactMessage {
  id: string
  name: string
  phone: string
  message: string
  createdAt: string
  read: boolean
}
