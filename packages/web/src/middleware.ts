import { NextRequest, NextResponse } from 'next/server'

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 100
const rateMap = new Map<string, { count: number; resetAt: number }>()

export function middleware(req: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('text/html')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:;"
    )
  }

  // Rate limiting (for API routes)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const entry = rateMap.get(ip)

    if (!entry || now > entry.resetAt) {
      rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    } else {
      entry.count++
      if (entry.count > RATE_LIMIT_MAX) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
