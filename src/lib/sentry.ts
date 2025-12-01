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
 * - Session replay on errors
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

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment,
      
      // ✅ INTEGRATIONS (Browser Tracing + Replay)
      integrations: [
        new BrowserTracing({
          // Trace propagation targets (APIs que queremos monitorar)
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/versixnorma\.com\.br/,
            /^https:\/\/.*\.supabase\.co/,
            /^https:\/\/.*\.qdrant\.io/
          ],
        }),
        new Sentry.Replay({
          // Mascarar textos sensíveis
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // ✅ PERFORMANCE MONITORING
      // Set sample rate for performance monitoring (20% in production)
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,

      // ✅ SESSION REPLAY
      // Capture 10% of sessions for replay
      replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0.2,
      // Capture 100% of sessions with errors
      replaysOnErrorSampleRate: 1.0,

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

        // Remove sensitive data from requests
        if (event.request?.data) {
          try {
            const data = JSON.parse(event.request.data as string)
            delete data.password
            delete data.token
            delete data.api_key
            event.request.data = JSON.stringify(data)
          } catch (e) {
            // Ignore parse errors
          }
        }

        return event
      },

      // ✅ INITIAL SCOPE - Tags padrão
      initialScope: {
        tags: {
          app: 'versix-norma',
          platform: 'web'
        }
      }
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

    console.log(`✅ Sentry initialized (${environment}) with Tracing + Replay`)
  } catch (err) {
    console.warn('⚠️ Sentry initialization failed:', err)
  }
}

/**
 * Capture a custom error event with context
 * Usage: captureError(new Error('My error'), { extra: 'data' })
 */
export function captureError(error: Error, context?: Record<string, any>): void {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('custom', context)
    }
    Sentry.captureException(error)
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

/**
 * Set user context (should be called after login)
 * Usage: setUserContext({ id: '123', email: 'user@example.com', role: 'admin' })
 */
export function setUserContext(user: { id: string; email: string; role?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.email.split('@')[0],
    ...(user.role && { role: user.role })
  })
}

/**
 * Track a performance transaction
 * Usage: const transaction = trackTransaction('page-load', 'navigation')
 *        // ... do work ...
 *        transaction.finish()
 */
export function trackTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op })
}

export default Sentry
