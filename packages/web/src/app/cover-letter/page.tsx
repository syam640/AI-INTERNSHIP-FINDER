'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { analytics } from '@/lib/analytics'
import toast from 'react-hot-toast'

export default function CoverLetterPage() {
  const { user, profile } = useStore()
  const router = useRouter()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user, router])

  const generate = async () => {
    if (!company || !role) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          role,
          skills: profile?.skills || [],
          name: profile?.displayName || '',
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      setCoverLetter(data.content)
      analytics.track('cover_letter_generate')
      toast.success('Cover letter generated!')
    } catch {
      const fallback = `Dear Hiring Manager at ${company},

I am writing to express my strong interest in the ${role} position. With my background in ${(profile?.skills || ['relevant technologies']).slice(0, 3).join(', ')}, I am confident that I would be a valuable addition to your team.

Throughout my experience, I have developed strong technical and problem-solving skills that align perfectly with this role. I am particularly excited about the opportunity to contribute to ${company}'s innovative projects and growth.

I would welcome the opportunity to discuss how my qualifications match your needs. Thank you for your consideration.

Best regards,
${profile?.displayName || 'Your Name'}`
      setCoverLetter(fallback)
      toast.success('Cover letter generated!')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter)
    toast.success('Copied to clipboard!')
  }

  return (
    <ErrorBoundary>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">AI Cover Letter Generator</h1>

        <div className="card mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input-field"
                placeholder="Google"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
                placeholder="Software Engineer Intern"
              />
            </div>
          </div>
          <button onClick={generate} disabled={loading || !company || !role} className="btn-primary w-full">
            {loading ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>

        {coverLetter && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Cover Letter</h2>
              <button onClick={copyToClipboard} className="btn-secondary text-sm py-1 px-3">
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
              {coverLetter}
            </pre>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
