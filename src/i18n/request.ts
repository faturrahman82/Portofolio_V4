import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// =============================================================================
// Supported locales
// =============================================================================

export const locales = ['en', 'id'] as const
export type SupportedLocale = (typeof locales)[number]

export const defaultLocale: SupportedLocale = 'en'

/**
 * Human-readable locale labels used in the language switcher UI.
 */
export const localeLabels: Record<
  SupportedLocale,
  { label: string; flag: string; native: string }
> = {
  en: { label: 'English', flag: '🇺🇸', native: 'English' },
  id: { label: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' },
}

/**
 * Returns true if the given string is a valid supported locale.
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (locales as readonly string[]).includes(locale)
}

// =============================================================================
// next-intl server configuration
// =============================================================================

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is supported.
  // If not, trigger Next.js's not-found page.
  if (!isSupportedLocale(locale)) {
    notFound()
  }

  // Dynamically import the message file for the requested locale.
  // Using a dynamic import keeps each locale's JSON out of the initial bundle.
  const messages = (await import(`../../public/locales/${locale}/common.json`)).default

  return {
    locale,
    messages,

    // ---------------------------------------------------------------------------
    // Number & date formatting defaults
    // ---------------------------------------------------------------------------
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
        long: {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
        time: {
          hour: '2-digit',
          minute: '2-digit',
        },
      },
      number: {
        precise: {
          maximumFractionDigits: 2,
        },
        compact: {
          notation: 'compact',
          compactDisplay: 'short',
        },
        percentage: {
          style: 'percent',
          maximumFractionDigits: 1,
        },
      },
      list: {
        enumeration: {
          style: 'long',
          type: 'conjunction',
        },
      },
    },

    // ---------------------------------------------------------------------------
    // Default rich-text renderers (used with t.rich())
    // ---------------------------------------------------------------------------
    defaultTranslationValues: {
      // Allows <b>bold</b> inside translation strings
      b: (chunks) => `<strong>${chunks}</strong>`,
      // Allows <em>emphasis</em>
      em: (chunks) => `<em>${chunks}</em>`,
      // Allows <br /> line breaks
      br: () => '\n',
    },

    // ---------------------------------------------------------------------------
    // Error handling
    // ---------------------------------------------------------------------------

    /**
     * Called when a translation key is missing.
     * In production we return an empty string to avoid UI breakage.
     * In development we surface the key so engineers notice immediately.
     */
    onError(error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[next-intl] Translation error:', error.message)
      }
    },

    /**
     * Controls what is returned for missing keys.
     * Returning the key itself helps spot untranslated strings during dev.
     */
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter(Boolean).join('.')

      if (process.env.NODE_ENV === 'production') {
        return ''
      }

      return `⚠ missing: ${path} (${error.code})`
    },
  }
})
