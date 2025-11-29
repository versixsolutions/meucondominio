import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

/**
 * Initialize Sentry for error tracking and performance monitoring
 * 
 * Setup:
 * 1. Create account at https://sentry.io
 * 2. Create project (React)
 * 3. Copy DSN
 * 4. Add to .env.local: VITE_SENTRY_DSN=your-dsn
 * 5. Optional: VITE_SENTRY_ENVIRONMENT=production|staging|development
 * 
 * Features:
 * - Error tracking with full stack traces
 * - Performance monitoring (LCP, FCP, CLS)
 * - User feedback collection
 * - Release tracking
 * - Source maps (automatic from Vercel)
 */

export function initializeSentry(): void {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE

  // Only initialize if DSN is provided
  if (!sentryDsn) {
    if (import.meta.env.DEV) {
      console.log('ℹ️ Sentry DSN not configured. Error tracking disabled.')
      console.log('📖 To enable: Add VITE_SENTRY_DSN to .env.local')
    }
    return
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Set sampling rate for performance monitoring
        tracingOrigins: [/^\//],
        // Capture exceptions from routerChange as well
        shouldCreateSpanForRequest: (url) => {
          return !url.includes('/health')
        },
      }),
    ],

    // Set sample rate for performance monitoring (1% = 0.01)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Capture session replays for 10% of errors in production
    replaysOnErrorSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.05 : 0.1,

    // Release tracking (optional - set via Vercel env or manually)
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    // Do not capture these events
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      // Third-party scripts
      /ga\.js/i,
      /google-analytics/i,
    ],

    // Ignore certain errors (e.g., network timeouts, user actions)
    ignoreErrors: [
      // Random plugins/extensions
      'top\.GLOBALS',
      'chrome-extension://',
      // Facebook errors
      'fb_xd_fragment',
      // Network errors (often not actionable)
      'NetworkError',
      'TimeoutError',
      'Failed to fetch',
      'Load failed',
      // Ignore errors from PWA offline
      'navigator.onLine is false',
      // Ignore ResizeObserver errors (non-critical)
      'ResizeObserver loop limit exceeded',
    ],

    // Before sending to Sentry
    beforeSend(event, hint) {
      // Filter out errors from development tools
      if (import.meta.env.DEV && hint.originalException instanceof Error) {
        if (hint.originalException.message?.includes('ResizeObserver')) {
          return null
        }
      }

      return event
    },
  })

  // Set user context if authenticated
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      Sentry.setUser({
        id: userData.id,
        email: userData.email,
        username: userData.email?.split('@')[0],
      })
    } catch (e) {
      // Ignore parse errors
    }
  }

  console.log(`✅ Sentry initialized (${environment})`)
}

/**
 * Capture a custom error event
 * Usage: captureError('My error', { extra: 'data' })
 */
export function captureError(message: string, context?: Record<string, any>): void {
  Sentry.captureException(new Error(message), {
    contexts: {
      custom: context,
    },
  })
}

/**
 * Capture a custom message
 * Usage: captureMessage('User action', 'info')
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level)
}

/**
 * Set a custom tag for filtering in Sentry
 * Usage: setTag('page', 'dashboard')
 */
export function setTag(key: string, value: string | number): void {
  Sentry.setTag(key, value)
}

export default Sentry
