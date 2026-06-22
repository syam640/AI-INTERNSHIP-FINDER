'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { updateUserProfile } from '@/lib/firestore'
import { useDropzone } from 'react-dropzone'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { analytics } from '@/lib/analytics'
import toast from 'react-hot-toast'

const SKILL_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Flutter', 'Dart', 'Firebase', 'AWS', 'Docker', 'Kubernetes',
  'Machine Learning', 'Data Science', 'NLP', 'Computer Vision',
  'Java', 'C++', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL',
  'HTML/CSS', 'Tailwind CSS', 'Git', 'Linux',
]

const ROLE_OPTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer', 'Data Scientist', 'ML Engineer',
  'DevOps Engineer', 'UI/UX Designer', 'Software Engineer',
  'Data Analyst', 'Product Manager', 'Cloud Engineer',
]

export default function ProfilePage() {
  const { user, profile, setProfile } = useStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)

  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [experience, setExperience] = useState(profile?.experience || '')
  const [skills, setSkills] = useState<string[]>(profile?.skills || [])
  const [preferredRoles, setPreferredRoles] = useState<string[]>(profile?.preferredRoles || [])

  useEffect(() => {
    if (!user) router.push('/auth/login')
  }, [user, router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: async (files) => {
      if (!user) return
      setUploadingResume(true)
      try {
        const formData = new FormData()
        formData.append('file', files[0])
        formData.append('uid', user.uid)
        const res = await fetch('/api/upload-resume', { method: 'POST', body: formData })
        if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
        const { url } = await res.json()
        await updateUserProfile(user.uid, { resumeURL: url })
        setProfile({ ...profile!, resumeURL: url })
        analytics.track('resume_upload')
        toast.success('Resume uploaded!')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploadingResume(false)
      }
    },
  })

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const toggleRole = (role: string) => {
    setPreferredRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      await updateUserProfile(user.uid, {
        displayName,
        location,
        experience,
        skills,
        preferredRoles,
      })
      setProfile({ ...profile!, displayName, location, experience, skills, preferredRoles })
      analytics.track('profile_update')
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <div className="space-y-8">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  id="name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                    placeholder="Mumbai, India"
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} className="input-field">
                    <option value="">Select experience</option>
                    <option value="fresher">Fresher</option>
                    <option value="1-year">1 Year</option>
                    <option value="2-years">2 Years</option>
                    <option value="3+">3+ Years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    skills.includes(skill)
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Preferred Roles</h2>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    preferredRoles.includes(role)
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Resume</h2>
            {profile?.resumeURL ? (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-green-600">✓ Resume uploaded</span>
                <a href={profile.resumeURL} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">
                  View
                </a>
              </div>
            ) : null}
            <div
              {...getRootProps()}
              className={`mt-3 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
              } ${uploadingResume ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">
                {uploadingResume ? 'Uploading...' : isDragActive ? 'Drop your resume here' : 'Drag & drop your resume (PDF), or click to select'}
              </p>
            </div>
          </div>

          <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </ErrorBoundary>
  )
}
