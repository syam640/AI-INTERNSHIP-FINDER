const REQUIRED_VARS = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

const OPTIONAL_VARS = [
  'NVIDIA_API_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_FIREBASE_VAPID_KEY',
  'NEXT_PUBLIC_LOG_LEVEL',
  'NEXT_PUBLIC_ANALYTICS_ENABLED',
]

export function validateEnv(): { ok: boolean; missing: string[] } {
  if (typeof window !== 'undefined') return { ok: true, missing: [] }

  const missing = REQUIRED_VARS.filter((v) => !process.env[v])
  return { ok: missing.length === 0, missing }
}

export function getEnvStatus() {
  const required = REQUIRED_VARS.map((v) => ({
    name: v,
    set: !!process.env[v],
    value: process.env[v]?.slice(0, 20) + '...',
  }))

  const optional = OPTIONAL_VARS.map((v) => ({
    name: v,
    set: !!process.env[v],
  }))

  const allSet = required.every((r) => r.set)

  return { allSet, required, optional }
}
