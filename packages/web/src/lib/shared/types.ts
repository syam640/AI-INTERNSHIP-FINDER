export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  skills: string[]
  resumeURL?: string
  preferredRoles: string[]
  location: string
  experience: string
  createdAt: Date
  updatedAt: Date
}

export interface Internship {
  id: string
  title: string
  company: string
  location: string
  description: string
  skills: string[]
  stipend: string
  duration: string
  applyURL: string
  source: 'internshala' | 'linkedin' | 'aicte' | 'other'
  postedAt: Date
  deadline?: Date
}

export interface Recommendation {
  internshipId: string
  score: number
  reason: string
}

export interface ResumeAnalysis {
  atsScore: number
  missingSkills: string[]
  suggestions: string[]
  strengths: string[]
}

export interface CoverLetter {
  content: string
  internshipId: string
  userId: string
}

export type AuthProvider = 'email' | 'google'
