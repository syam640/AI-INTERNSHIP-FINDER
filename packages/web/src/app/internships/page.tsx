'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { getInternships } from '@/lib/firestore'
import { CardSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { analytics } from '@/lib/analytics'
import toast from 'react-hot-toast'

const SOURCES = ['internshala', 'linkedin', 'aicte', 'other'] as const

export default function InternshipsPage() {
  const { user, internships, setInternships } = useStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    analytics.pageView()
    loadInternships()
  }, [user, router])

  const loadInternships = async () => {
    setLoading(true)
    try {
      const data = await getInternships()
      setInternships(data)
    } catch {
      toast.error('Failed to load internships')
    } finally {
      setLoading(false)
    }
  }

  const filtered = internships.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSource = sourceFilter === 'all' || i.source === sourceFilter
    return matchesSearch && matchesSource
  })

  const sourceColors: Record<string, string> = {
    internshala: 'bg-orange-100 text-orange-700',
    linkedin: 'bg-blue-100 text-blue-700',
    aicte: 'bg-green-100 text-green-700',
    other: 'bg-gray-100 text-gray-700',
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Internships</h1>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await fetch('/api/scrape-internships', { method: 'POST', body: JSON.stringify({ source: 'internshala' }) })
                  toast.success('Scraped fresh internships!')
                  analytics.track('internship_scrape')
                  loadInternships()
                } catch {
                  toast.error('Scrape failed')
                }
              }}
              className="btn-secondary text-sm"
            >
              Scrape Now
            </button>
            <button onClick={loadInternships} className="btn-secondary text-sm" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search internships by title, company, or skill..."
            className="input-field flex-1"
            aria-label="Search internships"
          />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="input-field w-48"
            aria-label="Filter by source"
          >
            <option value="all">All Sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Internships Found"
            description={
              searchTerm
                ? 'No internships match your search criteria. Try different keywords.'
                : 'No internships available yet. Try scraping for fresh listings.'
            }
            action={!searchTerm ? { label: 'Scrape Now', href: '#' } : undefined}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((internship) => (
              <div key={internship.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{internship.title}</h3>
                    <p className="text-gray-500 text-sm">{internship.company}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${sourceColors[internship.source]}`}
                  >
                    {internship.source}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{internship.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {internship.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                      {skill}
                    </span>
                  ))}
                  {internship.skills.length > 4 && (
                    <span className="px-2 py-0.5 text-xs text-gray-400">
                      +{internship.skills.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{internship.location}</span>
                  <span className="font-medium text-green-600">{internship.stipend || 'Unpaid'}</span>
                </div>

                {internship.duration && (
                  <p className="text-xs text-gray-400 mb-3">Duration: {internship.duration}</p>
                )}

                <a
                  href={internship.applyURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full text-center block text-sm"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
