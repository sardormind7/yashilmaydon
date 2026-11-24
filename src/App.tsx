import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format, isBefore, startOfDay, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { ru } from 'date-fns/locale/ru'
import { uz } from 'date-fns/locale/uz'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Goal,
  MapPin,
  Menu,
  Moon,
  Phone,
  Sun,
  Users,
  X,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { stadium, slotPrice } from './config/stadium'
import { api, ApiError, type ApiErrorCode } from './services/api'
import { useAuthStore } from './store/authStore'
import { useBookingStore } from './store/bookingStore'
import { useThemeStore } from './store/themeStore'
import { I18nProvider, useI18n, type TranslationKey } from './i18n/I18nProvider'
import { FootballFieldBackground } from './components/effects/FootballFieldBackground'
import { CustomCursor } from './components/effects/CustomCursor'
import type { Booking, ContactMessage } from './types'
import './index.css'

const apiErrorTranslations: Record<ApiErrorCode, TranslationKey> = {
  PHONE_TAKEN: 'error.phoneTaken',
  INVALID_CREDENTIALS: 'error.credentialsInvalid',
  SLOT_TAKEN: 'error.slotTaken',
  BOOKING_NOT_FOUND: 'error.bookingMissing',
}

function getErrorMessage(error: unknown, t: (key: TranslationKey) => string) {
  if (error instanceof ApiError) return t(apiErrorTranslations[error.code])
  return error instanceof Error ? error.message : t('error.generic')
}

function Protected({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()
  if (loading)
    return (
      <div className="page-wrap loading">
        <span className="spinner" />
      </div>
    )
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function Header() {
  const { user, logout } = useAuthStore()
  const { theme, toggle, setTheme } = useThemeStore()
  const { language, setLanguage, t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement as HTMLElement & {
      startViewTransition?: (callback: () => void) => void
    }
    if (root.startViewTransition) root.startViewTransition(() => setTheme(next))
    else toggle()
  }
  const signOut = async () => {
    await logout()
    toast.success(t('nav.logout'))
    navigate('/')
  }
  const nav = (
    <>
      <Link to="/">{t('nav.home')}</Link>
      <Link to="/schedule">{t('nav.schedule')}</Link>
      <Link to="/contact">{t('nav.contact')}</Link>
      {user && <Link to="/my-bookings">{t('nav.bookings')}</Link>}
      {user?.role === 'admin' && <Link to="/admin">{t('nav.admin')}</Link>}
    </>
  )
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <CircleDot size={21} />
          </span>
          <span>
            YASHIL<span className="brand-light">MAYDON</span>
          </span>
        </Link>
        <nav
          className={`main-nav ${menuOpen ? 'nav-open' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          {nav}
        </nav>
        <div className="nav-actions">
          <select
            aria-label={t('common.language')}
            className="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value as 'uz' | 'ru' | 'en')}
          >
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          <button
            className="icon-btn theme-toggle"
            aria-label={t('common.theme')}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <button className="nav-login" onClick={() => void signOut()}>
              {t('nav.logout')}
            </button>
          ) : (
            <Link className="nav-login" to="/login">
              {t('nav.login')}
            </Link>
          )}
          <button
            className="icon-btn menu-toggle"
            aria-label={t('common.menu')}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <Link to="/" className="brand">
        <span className="brand-mark">
          <CircleDot size={19} />
        </span>
        <span>
          YASHIL<span className="brand-light">MAYDON</span>
        </span>
      </Link>
      <p>
        {t('footer.text')} © {new Date().getFullYear()}
      </p>
      <Link to="/contact">
        {t('nav.contact')} <ArrowRight size={14} />
      </Link>
    </footer>
  )
}

function FloatingContact() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  return (
    <div className="floating-wrap">
      <AnimatePresence>
        {open && (
          <motion.div
            className="quick-links"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <a href={stadium.telegram} target="_blank" rel="noreferrer">
              Telegram <ArrowRight size={15} />
            </a>
            <a href={`tel:${stadium.phoneLink}`}>
              {stadium.phone} <Phone size={15} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="floating-button"
        aria-label={t('contact.title')}
      >
        {open ? <X size={20} /> : <Phone size={19} />}
        <span>{t('nav.contact')}</span>
      </button>
    </div>
  )
}

function Layout() {
  const { user } = useAuthStore()
  const location = useLocation()
  const { load } = useBookingStore()
  useEffect(() => {
    void load()
  }, [load, location.pathname])
  return (
    <>
      <FootballFieldBackground />
      <Header />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="route-frame"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route
                path="/my-bookings"
                element={
                  <Protected>
                    <MyBookings />
                  </Protected>
                }
              />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/login"
                element={user ? <Navigate to="/schedule" replace /> : <AuthPage mode="login" />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/schedule" replace /> : <AuthPage mode="register" />}
              />
              <Route
                path="/admin"
                element={
                  <Protected admin>
                    <Admin />
                  </Protected>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingContact />
      <CustomCursor />
      <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
    </>
  )
}

function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow?: string
  title: string
  text?: string
}) {
  return (
    <div className="section-title">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

function Home() {
  const { t, language } = useI18n()
  const { bookings } = useBookingStore()
  const today = startOfDay(new Date())
  const available =
    Array.from({ length: 7 }, (_, index) => addDays(today, index)).find(
      (date) =>
        bookings.filter(
          (item) => item.date === format(date, 'yyyy-MM-dd') && item.status !== 'cancelled',
        ).length < 16,
    ) ?? today
  const dateLocale = language === 'ru' ? ru : language === 'en' ? enUS : uz
  return (
    <div className="home-page">
      <section className="hero-section">
        <motion.div
          className="hero-copy"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span
            className="eyebrow"
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          >
            <span className="live-dot" />
            {t('home.tag')}
          </motion.span>
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 24 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
          >
            {t('home.title')}
          </motion.h1>
          <motion.p variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
            {t('home.desc')}
          </motion.p>
          <motion.div
            className="hero-actions"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          >
            <Link to="/schedule" className="button button-primary">
              {t('home.book')} <ArrowRight size={17} />
            </Link>
            <a className="text-link" href="#about">
              {t('home.about')} <ArrowDown size={16} />
            </a>
          </motion.div>
          <div className="hero-meta">
            <span>
              <Users size={16} /> {t('common.pitchSize')}
            </span>
            <span>
              <Clock3 size={16} /> 08:00 – 00:00
            </span>
            <span>
              <MapPin size={16} /> {t('common.city')}
            </span>
          </div>
        </motion.div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="hero-image">
            <div className="pitch-lines">
              <span />
              <i />
              <b />
            </div>
            <div className="hero-badge">
              <Goal size={19} />
              <span>
                <b>Yashil maydon</b>
                <small>{t('home.pitchTagline')}</small>
              </span>
            </div>
          </div>
          <div className="hero-stat">
            <span className="stat-icon">
              <Check size={17} />
            </span>
            <span>
              <b>7</b>
              <small>{t('common.daysOpen')}</small>
            </span>
          </div>
        </motion.div>
        <span className="hero-index">01 — 03</span>
      </section>
      <section id="about" className="about-section">
        <div className="about-number">
          01<span>/03</span>
        </div>
        <div>
          <span className="eyebrow">{t('home.about')}</span>
          <h2>{t('home.aboutText')}</h2>
        </div>
        <div className="about-mark">
          <CircleDot size={44} />
        </div>
      </section>
      <section className="features-section">
        <SectionTitle eyebrow="02 / 03" title={t('home.features')} />
        <div className="feature-grid">
          {[t('home.feature1'), t('home.feature2'), t('home.feature3')].map((feature, index) => (
            <motion.article
              className="feature-card"
              key={feature}
              whileHover={{ y: -6, rotateX: 2 }}
            >
              <span className="feature-number">0{index + 1}</span>
              <div className="feature-icon">
                {[<Goal key="goal" />, <Sun key="sun" />, <CalendarDays key="calendar" />][index]}
              </div>
              <h3>{feature}</h3>
              <p>{t('home.aboutText')}</p>
            </motion.article>
          ))}
        </div>
      </section>
      <section className="preview-section">
        <div className="preview-heading">
          <SectionTitle
            eyebrow="03 / 03"
            title={t('home.preview')}
            text={format(available, 'EEEE, d MMMM', { locale: dateLocale })}
          />
          <Link to="/schedule" className="text-link">
            {t('home.allSlots')} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="preview-slots">
          {[9, 11, 16, 18, 20].map((hour) => (
            <Link to="/schedule" className="preview-slot" key={hour}>
              <span>{String(hour).padStart(2, '0')}:00</span>
              <b>{slotPrice(hour).toLocaleString()} so‘m</b>
              <span className="slot-dot" />
            </Link>
          ))}
        </div>
      </section>
      <section className="cta-panel">
        <div>
          <span className="eyebrow">{t('home.tag')}</span>
          <h2>{t('home.title')}</h2>
        </div>
        <Link to="/schedule" className="button button-light">
          {t('home.book')} <ArrowRight size={17} />
        </Link>
        <CircleDot className="cta-ball" size={170} />
      </section>
    </div>
  )
}

function Schedule() {
  const { t, language } = useI18n()
  const { user } = useAuthStore()
  const { bookings, add, update, loading } = useBookingStore()
  const [week, setWeek] = useState(0)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const dates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), week * 7 + i),
      ),
    [week],
  )
  const locale = language === 'ru' ? ru : language === 'en' ? enUS : uz
  const chosen = bookings.find(
    (item) =>
      item.date === selectedDate && item.hour === selectedHour && item.status !== 'cancelled',
  )
  const currentDate = new Date(`${selectedDate}T00:00:00`)
  const openSlot = (hour: number) => {
    if (hour < new Date().getHours() && selectedDate === format(new Date(), 'yyyy-MM-dd')) return
    setSelectedHour(hour)
    setNote('')
  }
  const bookSlot = async () => {
    if (!user || selectedHour === null) return
    try {
      await add({
        userId: user.id,
        userName: user.name,
        phone: user.phone,
        date: selectedDate,
        hour: selectedHour,
        note,
        price: slotPrice(selectedHour),
      })
      toast.success(t('toast.bookingCreated'))
      setSelectedHour(null)
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  const cancelBooking = async (booking: Booking) => {
    try {
      await update(booking.id, 'cancelled')
      toast.success(t('toast.bookingCancelled'))
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  return (
    <div className="page-wrap schedule-page">
      <SectionTitle
        eyebrow="YASHIL MAYDON / BOOKING"
        title={t('schedule.title')}
        text={t('schedule.subtitle')}
      />
      <div className="schedule-tools">
        <div className="week-controls">
          <button
            className="icon-btn"
            aria-label={t('schedule.prev')}
            onClick={() => {
              setWeek(week - 1)
              setSelectedDate(
                format(addDays(new Date(`${selectedDate}T00:00:00`), -7), 'yyyy-MM-dd'),
              )
            }}
          >
            <ChevronLeft />
          </button>
          <span>
            {format(dates[0], 'd MMM', { locale })} — {format(dates[6], 'd MMM yyyy', { locale })}
          </span>
          <button
            className="icon-btn"
            aria-label={t('schedule.next')}
            onClick={() => {
              setWeek(week + 1)
              setSelectedDate(
                format(addDays(new Date(`${selectedDate}T00:00:00`), 7), 'yyyy-MM-dd'),
              )
            }}
          >
            <ChevronRight />
          </button>
        </div>
        <div className="legend">
          <span>
            <i className="legend-free" />
            {t('schedule.free')}
          </span>
          <span>
            <i className="legend-booked" />
            {t('schedule.booked')}
          </span>
          <span>
            <i className="legend-mine" />
            {t('schedule.mine')}
          </span>
          <span>
            <i className="legend-past" />
            {t('schedule.past')}
          </span>
          <span>
            <i className="legend-past" />
            {t('schedule.close')}
          </span>
        </div>
      </div>
      <div className="day-tabs">
        {dates.map((date) => {
          const dateText = format(date, 'yyyy-MM-dd')
          return (
            <button
              className={`day-tab ${selectedDate === dateText ? 'day-active' : ''}`}
              key={dateText}
              onClick={() => setSelectedDate(dateText)}
            >
              <span>{format(date, 'EEE', { locale })}</span>
              <b>{format(date, 'd')}</b>
              <small>{format(date, 'MMM', { locale })}</small>
            </button>
          )
        })}
      </div>
      {loading ? (
        <div className="slot-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="slot-skeleton" />
          ))}
        </div>
      ) : (
        <div className="slot-grid">
          {Array.from(
            { length: stadium.closeAt - stadium.openAt },
            (_, index) => stadium.openAt + index,
          ).map((hour) => {
            const booking = bookings.find(
              (item) =>
                item.date === selectedDate && item.hour === hour && item.status !== 'cancelled',
            )
            const isPast =
              isBefore(currentDate, startOfDay(new Date())) ||
              (selectedDate === format(new Date(), 'yyyy-MM-dd') && hour <= new Date().getHours())
            const mine = Boolean(booking && user && booking.userId === user.id)
            const status = isPast
              ? 'past'
              : mine
                ? 'mine'
                : booking?.status === 'blocked'
                  ? 'closed'
                  : booking
                    ? 'booked'
                    : 'free'
            return (
              <button
                key={hour}
                disabled={isPast || Boolean(booking && !mine)}
                onClick={() => (mine && booking ? void cancelBooking(booking) : openSlot(hour))}
                className={`slot-card slot-${status}`}
              >
                <span className="slot-time">{String(hour).padStart(2, '0')}:00</span>
                <span className="slot-status">
                  {mine ? (
                    <>
                      {t('schedule.mine')} · {t('schedule.cancel')}
                    </>
                  ) : (
                    t(
                      `schedule.${status}` as
                        | 'schedule.free'
                        | 'schedule.booked'
                        | 'schedule.mine'
                        | 'schedule.past'
                        | 'schedule.close',
                    )
                  )}
                </span>
                <b>
                  {slotPrice(hour).toLocaleString()} <small>so‘m</small>
                </b>
              </button>
            )
          })}
        </div>
      )}
      <p className="schedule-hint">
        <span className="live-dot" /> {t('schedule.free')} · {stadium.openAt}:00 – 24:00
      </p>
      <AnimatePresence>
        {selectedHour !== null && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedHour(null)
            }}
          >
            <motion.section
              className="booking-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-heading"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
            >
              <button
                className="modal-close icon-btn"
                aria-label={t('common.close')}
                onClick={() => setSelectedHour(null)}
              >
                <X size={20} />
              </button>
              <span className="eyebrow">{t('schedule.book')}</span>
              <h2 id="modal-heading">{format(currentDate, 'EEEE, d MMMM yyyy', { locale })}</h2>
              <p className="modal-time">
                <Clock3 size={18} /> {String(selectedHour).padStart(2, '0')}:00 —{' '}
                {String(selectedHour + 1).padStart(2, '0')}:00
              </p>
              <div className="price-row">
                <span>{t('schedule.price')}</span>
                <b>{slotPrice(selectedHour).toLocaleString()} so‘m</b>
              </div>
              {chosen?.status === 'blocked' ? (
                <p>{t('schedule.close')}</p>
              ) : (
                <>
                  <label className="field-label">
                    {t('schedule.note')}
                    <textarea
                      className="input-control"
                      rows={3}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </label>
                  {user ? (
                    <button
                      className="button button-primary full-button"
                      onClick={() => void bookSlot()}
                    >
                      {t('schedule.confirm')} <ArrowRight size={17} />
                    </button>
                  ) : (
                    <Link className="button button-primary full-button" to="/login">
                      {t('nav.login')} <ArrowRight size={17} />
                    </Link>
                  )}
                </>
              )}
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

type AuthFields = { name: string; phone: string; password: string; confirm: string }
function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useI18n()
  const registerMode = mode === 'register'
  const login = useAuthStore((state) => state.login),
    registerUser = useAuthStore((state) => state.register)
  const navigate = useNavigate()
  const schema = z
    .object({
      name: z.string(),
      phone: z.string().regex(/^\+998\d{9}$/, t('error.phone')),
      password: z.string().min(6, t('error.password')),
      confirm: z.string(),
    })
    .superRefine((data, context) => {
      if (registerMode && data.name.trim().length < 2)
        context.addIssue({
          code: 'custom',
          path: ['name'],
          message: t('error.name'),
        })
      if (registerMode && data.confirm.length === 0)
        context.addIssue({ code: 'custom', path: ['confirm'], message: t('error.confirm') })
      else if (registerMode && data.password !== data.confirm)
        context.addIssue({ code: 'custom', path: ['confirm'], message: t('error.match') })
    })
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AuthFields>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '+998', name: '', confirm: '' },
  })
  const submit = async (values: AuthFields) => {
    try {
      if (registerMode)
        await registerUser({
          name: values.name ?? '',
          phone: values.phone,
          password: values.password,
        })
      else await login(values.phone, values.password)
      toast.success(registerMode ? t('toast.registered') : t('toast.welcome'))
      navigate('/schedule')
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  const phoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '')
    const national = digits.startsWith('998') ? digits.slice(3, 12) : digits.slice(0, 9)
    return `+998${national}`
  }
  return (
    <div className="auth-page">
      <motion.form
        className="auth-card"
        onSubmit={(event: FormEvent<HTMLFormElement>) => void handleSubmit(submit)(event)}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="auth-icon">
          <CircleDot size={27} />
        </span>
        <span className="eyebrow">YASHIL MAYDON / {t('common.account')}</span>
        <h1>{registerMode ? t('auth.register') : t('auth.login')}</h1>
        <p className="auth-subtitle">
          {registerMode ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
          <Link to={registerMode ? '/login' : '/register'}>
            {registerMode ? t('nav.login') : t('nav.register')}
          </Link>
        </p>
        {registerMode && (
          <label className="field-label">
            {t('auth.name')}
            <input
              className="input-control"
              autoComplete="name"
              {...register('name')}
              placeholder={t('common.namePlaceholder')}
            />
            {errors.name && <small className="field-error">{errors.name.message}</small>}
          </label>
        )}
        <label className="field-label">
          {t('auth.phone')}
          <input
            className="input-control"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            {...register('phone', {
              onChange: (event) =>
                setValue('phone', phoneMask(event.target.value), { shouldValidate: true }),
            })}
            placeholder={t('common.phonePlaceholder')}
          />
          {errors.phone && <small className="field-error">{errors.phone.message}</small>}
        </label>
        <label className="field-label">
          {t('auth.password')}
          <input
            className="input-control"
            type="password"
            autoComplete={registerMode ? 'new-password' : 'current-password'}
            {...register('password')}
            placeholder="••••••••"
          />
          {errors.password && <small className="field-error">{errors.password.message}</small>}
        </label>
        {registerMode && (
          <label className="field-label">
            {t('auth.confirm')}
            <input
              className="input-control"
              type="password"
              autoComplete="new-password"
              {...register('confirm')}
              placeholder="••••••••"
            />
            {errors.confirm && <small className="field-error">{errors.confirm.message}</small>}
          </label>
        )}
        <button className="button button-primary full-button" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="spinner spinner-small" />
          ) : registerMode ? (
            t('auth.submitRegister')
          ) : (
            t('auth.submitLogin')
          )}{' '}
          <ArrowRight size={17} />
        </button>
        {!registerMode && <p className="demo-hint">{t('admin.demoHint')}</p>}
      </motion.form>
    </div>
  )
}

function MyBookings() {
  const { t, language } = useI18n()
  const locale = language === 'ru' ? ru : language === 'en' ? enUS : uz
  const { user } = useAuthStore()
  const { bookings, update } = useBookingStore()
  const now = format(new Date(), 'yyyy-MM-dd')
  const mine = bookings.filter(
    (booking) => booking.userId === user?.id && booking.status !== 'cancelled',
  )
  const upcoming = mine
    .filter((booking) => booking.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date))
  const past = mine.filter((booking) => booking.date < now)
  const cancel = async (booking: Booking) => {
    try {
      await update(booking.id, 'cancelled')
      toast.success(t('toast.bookingCancelled'))
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  const list = (items: Booking[]) =>
    items.length ? (
      <div className="my-booking-list">
        {items.map((booking) => (
          <article className="my-booking-card" key={booking.id}>
            <div className="booking-date-icon">
              <CalendarDays size={21} />
            </div>
            <div className="my-booking-info">
              <b>{format(new Date(`${booking.date}T12:00:00`), 'd MMMM yyyy', { locale })}</b>
              <span>
                <Clock3 size={14} /> {String(booking.hour).padStart(2, '0')}:00 –{' '}
                {String(booking.hour + 1).padStart(2, '0')}:00
              </span>
            </div>
            <div className="booking-detail">
              <span className={`status-pill status-${booking.status}`}>
                {t(
                  `status.${booking.status}` as
                    'status.pending' | 'status.confirmed' | 'status.cancelled' | 'status.blocked',
                )}
              </span>
              <b>{booking.price.toLocaleString()} so‘m</b>
            </div>
            {booking.date >= now && (
              <button className="button button-quiet" onClick={() => void cancel(booking)}>
                {t('schedule.cancel')}
              </button>
            )}
          </article>
        ))}
      </div>
    ) : (
      <p className="empty-state">{t('my.empty')}</p>
    )
  return (
    <div className="page-wrap">
      <SectionTitle eyebrow="YASHIL MAYDON / ACCOUNT" title={t('my.title')} />
      <section className="booking-group">
        <h3>{t('my.upcoming')}</h3>
        {list(upcoming)}
      </section>
      <section className="booking-group">
        <h3>{t('my.past')}</h3>
        {list(past)}
      </section>
    </div>
  )
}

function Contact() {
  const { t } = useI18n()
  const contactSchema = z.object({
    name: z.string().min(2, t('error.contactName')),
    phone: z.string().regex(/^\+998\d{9}$/, t('error.phone')),
    message: z.string().min(5, t('error.message')),
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string; phone: string; message: string }>({
    resolver: zodResolver(contactSchema),
    defaultValues: { phone: '+998' },
  })
  const submit = async (values: { name: string; phone: string; message: string }) => {
    try {
      await api.createMessage(values)
      toast.success(t('toast.messageSent'))
      reset({ name: '', phone: '+998', message: '' })
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  return (
    <div className="page-wrap contact-page">
      <SectionTitle
        eyebrow="YASHIL MAYDON / CONTACT"
        title={t('contact.title')}
        text={t('contact.subtitle')}
      />
      <div className="contact-grid">
        <form
          className="contact-form panel"
          onSubmit={(event: FormEvent<HTMLFormElement>) => void handleSubmit(submit)(event)}
        >
          <label className="field-label">
            {t('auth.name')}
            <input
              className="input-control"
              {...register('name')}
              placeholder={t('common.namePlaceholder')}
            />
            {errors.name && <small className="field-error">{errors.name.message}</small>}
          </label>
          <label className="field-label">
            {t('auth.phone')}
            <input
              className="input-control"
              {...register('phone')}
              placeholder={t('common.phonePlaceholder')}
            />
            {errors.phone && <small className="field-error">{errors.phone.message}</small>}
          </label>
          <label className="field-label">
            {t('contact.message')}
            <textarea
              className="input-control"
              rows={5}
              {...register('message')}
              placeholder={t('contact.subtitle')}
            />
            {errors.message && <small className="field-error">{errors.message.message}</small>}
          </label>
          <button className="button button-primary" disabled={isSubmitting}>
            {t('contact.send')} <ArrowRight size={17} />
          </button>
        </form>
        <aside className="contact-info">
          <a className="contact-row" href={`tel:${stadium.phoneLink}`}>
            <span className="contact-icon">
              <Phone size={19} />
            </span>
            <span>
              <small>{t('auth.phone')}</small>
              <b>{stadium.phone}</b>
            </span>
            <ArrowRight size={16} />
          </a>
          <a className="contact-row" href={stadium.telegram} target="_blank" rel="noreferrer">
            <span className="contact-icon">
              <ArrowRight size={19} />
            </span>
            <span>
              <small>Telegram</small>
              <b>@yashilmaydon</b>
            </span>
            <ArrowRight size={16} />
          </a>
          <div className="contact-row">
            <span className="contact-icon">
              <MapPin size={19} />
            </span>
            <span>
              <small>{t('contact.address')}</small>
              <b>{stadium.address}</b>
            </span>
          </div>
          <div className="contact-row">
            <span className="contact-icon">
              <Clock3 size={19} />
            </span>
            <span>
              <small>{t('contact.hours')}</small>
              <b>{stadium.hours}</b>
            </span>
          </div>
          <div className="map-frame">
            <iframe
              title="Yashil Maydon manzili xaritasi"
              src="https://maps.google.com/maps?q=Chilonzor%20Tashkent&t=&z=13&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

function Admin() {
  const { t } = useI18n()
  const { bookings, update } = useBookingStore()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [blockDate, setBlockDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [blockHour, setBlockHour] = useState('22')
  const [slotAction, setSlotAction] = useState<Booking['status']>('blocked')
  useEffect(() => {
    void api.getMessages().then(setMessages)
  }, [])
  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const visible = bookings
    .filter(
      (item) =>
        (item.userName.toLowerCase().includes(search.toLowerCase()) ||
          item.phone.includes(search)) &&
        (!filterDate || item.date === filterDate) &&
        (filterStatus === 'all' || item.status === filterStatus),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
  const revenue = bookings
    .filter((item) => item.status === 'confirmed')
    .reduce((sum, item) => sum + item.price, 0)
  const changeStatus = async (id: string, status: Booking['status']) => {
    try {
      await update(id, status)
      toast.success(t('toast.statusUpdated'))
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  const toggleRead = async (id: string) => {
    try {
      await api.markMessageRead(id)
      setMessages(await api.getMessages())
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  const closeSlot = async () => {
    try {
      await api.setSlot(blockDate, Number(blockHour), slotAction)
      await useBookingStore.getState().load()
      toast.success(slotAction === 'blocked' ? t('schedule.close') : t('admin.occupy'))
    } catch (error) {
      toast.error(getErrorMessage(error, t))
    }
  }
  return (
    <div className="page-wrap admin-page">
      <SectionTitle eyebrow="YASHIL MAYDON / ADMIN" title={t('admin.title')} />
      <div className="stats-grid">
        {[
          [
            t('admin.today'),
            bookings.filter((item) => item.date === today && item.status !== 'cancelled').length,
            <CalendarDays key="date" />,
          ],
          [
            t('admin.week'),
            bookings.filter((item) => item.date >= weekStart && item.status !== 'cancelled').length,
            <Users key="users" />,
          ],
          [t('admin.revenue'), `${revenue.toLocaleString()} so‘m`, <Check key="check" />],
        ].map(([label, value, icon]) => (
          <article className="stat-card" key={String(label)}>
            <span className="stat-card-icon">{icon}</span>
            <small>{label}</small>
            <b>{value}</b>
          </article>
        ))}
      </div>
      <section className="admin-section">
        <div className="admin-section-title">
          <div>
            <span className="eyebrow">{t('admin.management')}</span>
            <h2>{t('admin.bookings')}</h2>
          </div>
          <div className="filters">
            <input
              aria-label={t('admin.search')}
              className="input-control"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('admin.search')}
            />
            <input
              aria-label={t('admin.date')}
              className="input-control"
              type="date"
              value={filterDate}
              onChange={(event) => setFilterDate(event.target.value)}
            />
            <select
              aria-label={t('admin.status')}
              className="input-control"
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
            >
              <option value="all">{t('admin.status')}</option>
              {(['pending', 'confirmed', 'cancelled', 'blocked'] as const).map((status) => (
                <option key={status} value={status}>
                  {t(
                    `status.${status}` as
                      'status.pending' | 'status.confirmed' | 'status.cancelled' | 'status.blocked',
                  )}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t('admin.date')}</th>
                <th>{t('auth.name')}</th>
                <th>{t('auth.phone')}</th>
                <th>{t('common.time')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('schedule.price')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.date}</td>
                  <td>{booking.userName}</td>
                  <td>{booking.phone || '—'}</td>
                  <td>{String(booking.hour).padStart(2, '0')}:00</td>
                  <td>
                    <span className={`status-pill status-${booking.status}`}>
                      {t(
                        `status.${booking.status}` as
                          | 'status.pending'
                          | 'status.confirmed'
                          | 'status.cancelled'
                          | 'status.blocked',
                      )}
                    </span>
                  </td>
                  <td>{booking.price.toLocaleString()}</td>
                  <td className="table-actions">
                    {booking.status === 'pending' && (
                      <button
                        className="tiny-action"
                        onClick={() => void changeStatus(booking.id, 'confirmed')}
                      >
                        {t('admin.approve')}
                      </button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <button
                        className="tiny-action tiny-danger"
                        onClick={() => void changeStatus(booking.id, 'cancelled')}
                      >
                        {t('admin.cancel')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="empty-state">{t('admin.empty')}</p>}
        </div>
      </section>
      <section className="admin-section block-tools">
        <div>
          <span className="eyebrow">{t('admin.scheduleControl')}</span>
          <h2>{t('admin.block')}</h2>
        </div>
        <div className="block-form">
          <label className="field-label">
            {t('admin.date')}
            <input
              className="input-control"
              type="date"
              value={blockDate}
              onChange={(event) => setBlockDate(event.target.value)}
            />
          </label>
          <label className="field-label">
            {t('common.time')}
            <select
              className="input-control"
              value={blockHour}
              onChange={(event) => setBlockHour(event.target.value)}
            >
              {Array.from({ length: 16 }, (_, i) => i + 8).map((hour) => (
                <option key={hour} value={hour}>
                  {String(hour).padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            {t('admin.setStatus')}
            <select
              className="input-control"
              value={slotAction}
              onChange={(event) => setSlotAction(event.target.value as Booking['status'])}
            >
              <option value="blocked">{t('admin.block')}</option>
              <option value="confirmed">{t('admin.occupy')}</option>
            </select>
          </label>
          <button className="button button-primary" onClick={() => void closeSlot()}>
            {slotAction === 'blocked' ? t('admin.block') : t('admin.occupy')}
          </button>
        </div>
      </section>
      <section className="admin-section">
        <div className="admin-section-title">
          <div>
            <span className="eyebrow">{t('admin.inbox')}</span>
            <h2>
              {t('admin.messages')}{' '}
              <span className="message-count">
                {messages.filter((message) => !message.read).length}
              </span>
            </h2>
          </div>
        </div>
        {messages.length ? (
          <div className="message-list">
            {messages.map((message) => (
              <article
                className={`message-card ${message.read ? 'message-read' : ''}`}
                key={message.id}
              >
                <div className="message-head">
                  <b>{message.name}</b>
                  <span>{format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm')}</span>
                </div>
                <a href={`tel:${message.phone}`}>{message.phone}</a>
                <p>{message.message}</p>
                <button className="tiny-action" onClick={() => void toggleRead(message.id)}>
                  {t('admin.read')}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">{t('admin.noMessages')}</p>
        )}
      </section>
    </div>
  )
}

function NotFound() {
  const { t } = useI18n()
  return (
    <div className="not-found">
      <motion.div
        className="not-found-ball"
        animate={{ y: [0, -26, 0], rotate: [0, 80, 180] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        <CircleDot size={80} />
      </motion.div>
      <span className="eyebrow">{t('notFound.eyebrow')}</span>
      <h1>{t('notFound.title')}</h1>
      <Link to="/" className="button button-primary">
        <ArrowLeft size={17} /> {t('notFound.home')}
      </Link>
    </div>
  )
}

function App() {
  const hydrate = useAuthStore((state) => state.hydrate)
  useEffect(() => {
    void hydrate()
  }, [hydrate])
  return (
    <I18nProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout />
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App
