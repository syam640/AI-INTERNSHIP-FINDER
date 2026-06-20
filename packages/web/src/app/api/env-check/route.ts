import { NextResponse } from 'next/server'
import { validateEnv } from '@/lib/env'

export async function GET() {
  const result = validateEnv()

  if (!result.ok) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Missing required environment variables',
        missing: result.missing,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ status: 'ok', message: 'All required env vars are set' })
}
