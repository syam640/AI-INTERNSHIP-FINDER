'use client'

import { useOnlineStatus } from '@/lib/offline'

export default function OfflineBanner() {
  const online = useOnlineStatus()

  if (online) return null

  return (
    <div className="bg-yellow-500 text-white text-center text-sm py-2 px-4 sticky top-0 z-50">
      You are offline. Some features may be unavailable.
    </div>
  )
}
