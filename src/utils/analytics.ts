type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

let gaInitialized = false

export function initGoogleAnalytics() {
  if (!GA_ID || gaInitialized || typeof window === 'undefined') return

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    send_page_view: true,
  })

  gaInitialized = true
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return

  const safeParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  )

  window.gtag('event', name, safeParams)
}

export function getLaunchMode() {
  if (typeof window === 'undefined') return 'unknown'
  return window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
}
