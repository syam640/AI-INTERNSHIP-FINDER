'use client'

import { useEffect, useState, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function EnvGuard({ children }: Props) {
  const [ready, setReady] = useState(true)

  useEffect(() => {
    const missing: string[] = []
    const required = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ]

    for (const key of required) {
      if (!process.env[key]) {
        missing.push(key)
      }
    }

    if (missing.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('[EnvGuard] Missing env vars:', missing.join(', '))
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="text-4xl mb-4">⚙</div>
          <h1 className="text-xl font-semibold mb-2">Configuration Required</h1>
          <p className="text-gray-500 text-sm">
            Environment variables are not configured. Please set up your .env.local file.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
