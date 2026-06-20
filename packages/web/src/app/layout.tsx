import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/auth/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import OfflineBanner from '@/components/common/OfflineBanner'
import { Toaster } from 'react-hot-toast'
import EnvGuard from '@/components/common/EnvGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InternAI - Smart Internship Finder',
  description: 'Find the perfect internship matching your skills with AI-powered recommendations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EnvGuard>
          <ErrorBoundary>
            <AuthProvider>
              <Navbar />
              <OfflineBanner />
              <main className="min-h-screen">{children}</main>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: { borderRadius: '10px', background: '#333', color: '#fff' },
                }}
              />
            </AuthProvider>
          </ErrorBoundary>
        </EnvGuard>
      </body>
    </html>
  )
}
