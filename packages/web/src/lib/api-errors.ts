import { showToast } from '@/components/ui/Toast'

const HTTP_MESSAGES: Record<number, string> = {
  400: 'Bad request. Please check your input.',
  401: 'Session expired. Please sign in again.',
  403: 'Access denied. You do not have permission.',
  404: 'Resource not found.',
  429: 'Too many requests. Please slow down.',
  500: 'Server error. Please try again later.',
  502: 'Server is temporarily unavailable.',
  503: 'Service is down for maintenance.',
}

export function getHttpErrorMessage(status: number): string {
  return HTTP_MESSAGES[status] || `Request failed with status ${status}`
}

export async function fetchWithNotifications(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init)

  if (!res.ok && res.status >= 400) {
    const body = await res.clone().json().catch(() => ({}))
    const message = body.error || getHttpErrorMessage(res.status)
    showToast(message, 'error')
  }

  return res
}
