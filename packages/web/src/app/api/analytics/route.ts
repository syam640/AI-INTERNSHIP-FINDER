import { NextRequest, NextResponse } from 'next/server'

const events: Record<string, number> = {}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, properties, timestamp } = body

    if (!name) {
      return NextResponse.json({ error: 'Event name required' }, { status: 400 })
    }

    events[name] = (events[name] || 0) + 1

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${name}`, properties || '', timestamp || '')
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    events,
    total: Object.values(events).reduce((a, b) => a + b, 0),
  })
}
