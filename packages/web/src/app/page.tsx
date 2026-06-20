'use client'

import Link from 'next/link'
import { useStore } from '@/store'

export default function HomePage() {
  const { user } = useStore()

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find Your Dream{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Internship
              </span>{' '}
              with AI
            </h1>
            <p className="mt-6 text-xl text-gray-500 leading-relaxed">
              Upload your resume, set your preferences, and let our AI find the perfect
              internship opportunities tailored just for you.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              {user ? (
                <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
                    Get Started Free
                  </Link>
                  <Link href="/auth/login" className="btn-secondary text-lg px-8 py-3">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Set Up Profile',
                desc: 'Add your skills, experience, and preferences. Upload your resume for AI analysis.',
                icon: '👤',
              },
              {
                title: 'AI Matching',
                desc: 'Our AI analyzes your profile and finds internships that match your unique skill set.',
                icon: '🤖',
              },
              {
                title: 'Apply Smartly',
                desc: 'Get personalized cover letters, track applications, and receive daily alerts.',
                icon: '🎯',
              },
            ].map((item) => (
              <div key={item.title} className="card text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Powered By</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              'OpenAI',
              'Firebase',
              'Next.js',
              'Python',
            ].map((tech) => (
              <div key={tech} className="card font-semibold text-lg text-gray-700">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
