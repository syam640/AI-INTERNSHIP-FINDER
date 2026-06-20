import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import app from './firebase'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

export async function requestNotificationPermission(userId: string) {
  if (!('Notification' in window)) {
    console.log('Notifications not supported')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })

    // Save token to user's document in Firestore
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('./firebase')
    await updateDoc(doc(db, 'users', userId), { fcmToken: token })

    return token
  } catch (err) {
    console.error('FCM error:', err)
    return null
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {}
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}
