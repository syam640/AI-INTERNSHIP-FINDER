import { NextResponse } from 'next/server'
import { getEnvStatus } from '@/lib/env'

declare global {
  var __healthStart: number | undefined
}

export async function GET() {
  const env = getEnvStatus()
  const startTime = globalThis.__healthStart ?? Date.now()

  return NextResponse.json({
    status: env.allSet ? 'healthy' : 'degraded',
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    env: {
      allSet: env.allSet,
      required: env.required.map((r) => ({ name: r.name, set: r.set })),
      optional: env.optional.map((r) => ({ name: r.name, set: r.set })),
    },
  })
}

globalThis.__healthStart = Date.now()
