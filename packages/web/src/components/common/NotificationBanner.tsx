'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store'
import { requestNotificationPermission } from '@/lib/notifications'
import toast from 'react-hot-toast'

export default function NotificationBanner() {
  const { user } = useStore()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'granted') {
      setEnabled(true)
    }
  }, [user])

  const enableNotifications = async () => {
    if (!user) return
    await requestNotificationPermission(user.uid)
    setEnabled(true)
    toast.success('Daily internship alerts enabled!')
  }

  if (!user || enabled) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔔</span>
        <div>
          <p className="font-medium text-sm">Get Daily Alerts</p>
          <p className="text-xs text-gray-500 mt-1">
            Receive notifications when new internships match your skills.
          </p>
          <button onClick={enableNotifications} className="btn-primary text-xs mt-2 py-1.5 px-3">
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  )
}
