'use client'

import Link from 'next/link'
import { useStore } from '@/store'
import { logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, profile } = useStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              InternAI
            </span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/internships" className="text-gray-600 hover:text-gray-900 font-medium">
                Internships
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium">
                Profile
              </Link>
              <Link href="/resume" className="text-gray-600 hover:text-gray-900 font-medium">
                Resume
              </Link>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">{profile?.displayName || user.email}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="btn-secondary text-sm py-1.5 px-4">
                Login
              </Link>
              <Link href="/auth/signup" className="btn-primary text-sm py-1.5 px-4">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
