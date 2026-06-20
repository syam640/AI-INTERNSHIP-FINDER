'use client'

import { useEffect } from 'react'
import { onAuthChange } from '@/lib/auth'
import { getUserProfile } from '@/lib/firestore'
import { useStore } from '@/store'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useStore()

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user)
      if (user) {
        const profile = await getUserProfile(user.uid)
        setProfile(profile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setProfile, setLoading])

  return <>{children}</>
}
