import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// =============================================================================
// Types
// =============================================================================

export type Theme = 'dark' | 'light'
export type Locale = 'en' | 'id'

export type ModalId =
  | 'project-detail'
  | 'image-lightbox'
  | 'contact-success'
  | 'contact-error'
  | 'mobile-menu'
  | null

export interface UIStore {
  // ---------------------------------------------------------------------------
  // Theme
  // ---------------------------------------------------------------------------
  theme: Theme
  /** Toggles between 'dark' and 'light'. */
  toggleTheme: () => void
  /** Explicitly sets the theme. */
  setTheme: (theme: Theme) => void

  // ---------------------------------------------------------------------------
  // Locale
  // ---------------------------------------------------------------------------
  locale: Locale
  /** Sets the active locale. */
  setLocale: (locale: Locale) => void

  // ---------------------------------------------------------------------------
  // Mobile menu
  // ---------------------------------------------------------------------------
  isMenuOpen: boolean
  /** Opens the mobile navigation menu. */
  openMenu: () => void
  /** Closes the mobile navigation menu. */
  closeMenu: () => void
  /** Toggles the mobile navigation menu. */
  toggleMenu: () => void

  // ---------------------------------------------------------------------------
  // Modal system
  // ---------------------------------------------------------------------------
  activeModal: ModalId
  modalPayload: Record<string, unknown>
  /** Opens a modal by id, with an optional data payload. */
  openModal: (id: ModalId, payload?: Record<string, unknown>) => void
  /** Closes the currently open modal and clears the payload. */
  closeModal: () => void

  // ---------------------------------------------------------------------------
  // Scroll state (read from useScrollProgress hook, stored here for global access)
  // ---------------------------------------------------------------------------
  scrollProgress: number
  /** Updates the global scroll progress (0–1). */
  setScrollProgress: (progress: number) => void

  isNavbarVisible: boolean
  /** Controls navbar visibility (used by scroll-aware logic). */
  setNavbarVisible: (visible: boolean) => void

  // ---------------------------------------------------------------------------
  // Page loading
  // ---------------------------------------------------------------------------
  isPageLoading: boolean
  setPageLoading: (loading: boolean) => void

  // ---------------------------------------------------------------------------
  // 3D / WebGL feature flag (runtime detected)
  // ---------------------------------------------------------------------------
  webGLSupported: boolean
  setWebGLSupported: (supported: boolean) => void

  // ---------------------------------------------------------------------------
  // Notification / toast queue
  // ---------------------------------------------------------------------------
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  createdAt: number
}

// =============================================================================
// Helpers
// =============================================================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Syncs the <html> data-theme attribute so Tailwind's `dark` class strategy works. */
function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }

  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
}

// =============================================================================
// Store
// =============================================================================

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // -----------------------------------------------------------------------
        // Theme
        // -----------------------------------------------------------------------
        theme: 'dark',

        toggleTheme: () => {
          const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
          applyThemeToDocument(next)
          set({ theme: next }, false, 'toggleTheme')
        },

        setTheme: (theme) => {
          applyThemeToDocument(theme)
          set({ theme }, false, 'setTheme')
        },

        // -----------------------------------------------------------------------
        // Locale
        // -----------------------------------------------------------------------
        locale: 'en',

        setLocale: (locale) => {
          set({ locale }, false, 'setLocale')
        },

        // -----------------------------------------------------------------------
        // Mobile menu
        // -----------------------------------------------------------------------
        isMenuOpen: false,

        openMenu: () => {
          // Prevent body scroll while menu is open
          if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden'
          }
          set({ isMenuOpen: true }, false, 'openMenu')
        },

        closeMenu: () => {
          if (typeof document !== 'undefined') {
            document.body.style.overflow = ''
          }
          set({ isMenuOpen: false }, false, 'closeMenu')
        },

        toggleMenu: () => {
          const next = !get().isMenuOpen
          if (typeof document !== 'undefined') {
            document.body.style.overflow = next ? 'hidden' : ''
          }
          set({ isMenuOpen: next }, false, 'toggleMenu')
        },

        // -----------------------------------------------------------------------
        // Modal system
        // -----------------------------------------------------------------------
        activeModal: null,
        modalPayload: {},

        openModal: (id, payload = {}) => {
          set({ activeModal: id, modalPayload: payload }, false, 'openModal')
        },

        closeModal: () => {
          set({ activeModal: null, modalPayload: {} }, false, 'closeModal')
        },

        // -----------------------------------------------------------------------
        // Scroll state
        // -----------------------------------------------------------------------
        scrollProgress: 0,

        setScrollProgress: (progress) => {
          set({ scrollProgress: progress }, false, 'setScrollProgress')
        },

        isNavbarVisible: true,

        setNavbarVisible: (visible) => {
          set({ isNavbarVisible: visible }, false, 'setNavbarVisible')
        },

        // -----------------------------------------------------------------------
        // Page loading
        // -----------------------------------------------------------------------
        isPageLoading: false,

        setPageLoading: (loading) => {
          set({ isPageLoading: loading }, false, 'setPageLoading')
        },

        // -----------------------------------------------------------------------
        // WebGL feature flag
        // -----------------------------------------------------------------------
        webGLSupported: true, // optimistic default; set to false at runtime if needed

        setWebGLSupported: (supported) => {
          set({ webGLSupported: supported }, false, 'setWebGLSupported')
        },

        // -----------------------------------------------------------------------
        // Notifications
        // -----------------------------------------------------------------------
        notifications: [],

        addNotification: (notification) => {
          const id = generateId()
          const entry: Notification = {
            ...notification,
            id,
            duration: notification.duration ?? 5000,
            createdAt: Date.now(),
          }

          set(
            (state) => ({ notifications: [...state.notifications, entry] }),
            false,
            'addNotification'
          )

          // Auto-remove after duration
          if (entry.duration && entry.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id)
            }, entry.duration)
          }
        },

        removeNotification: (id) => {
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'removeNotification'
          )
        },

        clearNotifications: () => {
          set({ notifications: [] }, false, 'clearNotifications')
        },
      }),
      {
        name: 'portfolio-ui-store',
        // Only persist theme and locale — transient UI state should reset on reload
        partialize: (state) => ({
          theme: state.theme,
          locale: state.locale,
        }),
        // Re-apply theme class to <html> when store hydrates from localStorage
        onRehydrateStorage: () => (state) => {
          if (state) {
            applyThemeToDocument(state.theme)
          }
        },
      }
    ),
    {
      name: 'UIStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
)

// =============================================================================
// Selector hooks (avoids unnecessary re-renders with granular subscriptions)
// =============================================================================

export const useTheme = () => useUIStore((s) => s.theme)
export const useToggleTheme = () => useUIStore((s) => s.toggleTheme)
export const useSetTheme = () => useUIStore((s) => s.setTheme)

export const useLocale = () => useUIStore((s) => s.locale)
export const useSetLocale = () => useUIStore((s) => s.setLocale)

export const useIsMenuOpen = () => useUIStore((s) => s.isMenuOpen)
export const useMenuActions = () =>
  useUIStore((s) => ({
    openMenu: s.openMenu,
    closeMenu: s.closeMenu,
    toggleMenu: s.toggleMenu,
  }))

export const useActiveModal = () => useUIStore((s) => s.activeModal)
export const useModalPayload = () => useUIStore((s) => s.modalPayload)
export const useModalActions = () =>
  useUIStore((s) => ({
    openModal: s.openModal,
    closeModal: s.closeModal,
  }))

export const useScrollProgress = () => useUIStore((s) => s.scrollProgress)
export const useIsNavbarVisible = () => useUIStore((s) => s.isNavbarVisible)

export const useIsPageLoading = () => useUIStore((s) => s.isPageLoading)
export const useWebGLSupported = () => useUIStore((s) => s.webGLSupported)

export const useNotifications = () => useUIStore((s) => s.notifications)
export const useNotificationActions = () =>
  useUIStore((s) => ({
    addNotification: s.addNotification,
    removeNotification: s.removeNotification,
    clearNotifications: s.clearNotifications,
  }))
