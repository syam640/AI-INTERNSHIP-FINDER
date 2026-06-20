'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/store'
import { getInternships } from '@/lib/firestore'
import { StatsSkeleton, CardSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { analytics } from '@/lib/analytics'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, profile, loading, internships, setInternships } = useStore()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [user, loading, router])

  useEffect(() => {
    if (user) analytics.pageView()
  }, [user])

  useEffect(() => {
    if (user && profile?.skills?.length) {
      loadRecommendations()
    }
  }, [user, profile])

  const loadRecommendations = async () => {
    if (internships.length === 0) {
      const data = await getInternships()
      setInternships(data)
    }
    if (internships.length === 0) return

    setLoadingRecs(true)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: profile?.skills || [],
          preferredRoles: profile?.preferredRoles || [],
          experience: profile?.experience || '',
          internships: internships.slice(0, 10),
        }),
      })
      const data = await res.json()
      setRecommendations(Array.isArray(data) ? data : [])
    } catch {
      setRecommendations(
        internships.slice(0, 3).map((i) => ({
          internshipId: i.id,
          score: 85,
          reason: `This ${i.title} role at ${i.company} aligns with your ${profile?.skills?.[0] || 'technical'} skills`,
        }))
      )
    } finally {
      setLoadingRecs(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse mb-8">
          <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
        <StatsSkeleton />
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Profile Completion',
      value: profile?.skills?.length ? '80%' : '20%',
      color: profile?.skills?.length ? 'bg-green-500' : 'bg-yellow-500',
    },
    {
      label: 'Matched Internships',
      value: internships.length || '0',
      color: 'bg-primary-500',
    },
    {
      label: 'AI Recommendations',
      value: recommendations.length || '0',
      color: 'bg-purple-500',
    },
    {
      label: 'Resume',
      value: profile?.resumeURL ? 'Uploaded' : 'Upload',
      color: profile?.resumeURL ? 'bg-green-500' : 'bg-blue-500',
    },
  ]

  const quickActions = [
    { title: 'Update Profile', desc: 'Add skills and preferences', href: '/profile', icon: '👤' },
    { title: 'Find Internships', desc: 'Search matching opportunities', href: '/internships', icon: '🔍' },
    { title: 'Analyze Resume', desc: 'Get AI feedback on your resume', href: '/resume', icon: '📄' },
    { title: 'Generate Cover Letter', desc: 'AI-powered cover letters', href: '/cover-letter', icon: '✉️' },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.displayName || user.email?.split('@')[0]}
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your internship journey overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <div className={`w-2 h-2 rounded-full ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {loadingRecs && (
          <div className="mb-12">
            <div className="animate-pulse h-6 w-48 bg-gray-200 rounded mb-4" />
            <div className="grid md:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        )}

        {!loadingRecs && recommendations.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">AI Recommended for You</h2>
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                AI Powered
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map((rec) => {
                const internship = internships.find((i) => i.id === rec.internshipId)
                if (!internship) return null
                return (
                  <div key={rec.internshipId} className="card border-l-4 border-l-primary-500">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{internship.title}</h3>
                        <p className="text-sm text-gray-500">{internship.company}</p>
                      </div>
                      <span className={`font-bold text-lg ${getScoreColor(rec.score)}`}>
                        {rec.score}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{rec.reason}</p>
                    <Link
                      href={internship.applyURL || '#'}
                      target="_blank"
                      className="text-sm text-primary-600 hover:underline font-medium"
                    >
                      Apply Now →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!loadingRecs && recommendations.length === 0 && internships.length > 0 && (
          <EmptyState
            icon="🤖"
            title="No Recommendations Yet"
            description="Complete your profile with skills and preferences to get AI-matched recommendations."
            action={{ label: 'Update Profile', href: '/profile' }}
          />
        )}

        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} className="card hover:shadow-lg transition-shadow group">
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-semibold group-hover:text-primary-600 transition-colors">{action.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>

        {!profile?.skills?.length && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h3 className="font-semibold text-primary-800">Complete Your Profile</h3>
            <p className="text-primary-600 text-sm mt-1">Add your skills and preferences to get AI-matched internships.</p>
            <Link href="/profile" className="inline-block mt-3 btn-primary text-sm">
              Set Up Profile
            </Link>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
