const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'

type EventName =
  | 'page_view'
  | 'auth_login'
  | 'auth_signup'
  | 'auth_logout'
  | 'resume_upload'
  | 'resume_analyze'
  | 'cover_letter_generate'
  | 'internship_search'
  | 'internship_scrape'
  | 'internship_apply'
  | 'profile_update'
  | 'error'

interface Event {
  name: EventName
  properties?: Record<string, string | number | boolean>
  timestamp?: string
}

function sendEvent(event: Event) {
  if (!ANALYTICS_ENABLED) return

  const payload = { ...event, timestamp: event.timestamp || new Date().toISOString() }

  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    navigator.sendBeacon('/api/analytics', JSON.stringify(payload))
  } else {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }
}

export const analytics = {
  track(eventName: EventName, properties?: Event['properties']) {
    sendEvent({ name: eventName, properties })
  },
  pageView() {
    sendEvent({ name: 'page_view', properties: { path: window.location.pathname } })
  },
}
