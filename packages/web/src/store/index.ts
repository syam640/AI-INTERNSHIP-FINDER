import { create } from 'zustand'
import { UserProfile, Internship, ResumeAnalysis } from '@/lib/shared'
import { User } from 'firebase/auth'

interface AppState {
  user: User | null
  profile: UserProfile | null
  internships: Internship[]
  recommendations: any[]
  resumeAnalysis: ResumeAnalysis | null
  loading: boolean

  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setInternships: (internships: Internship[]) => void
  setRecommendations: (recommendations: any[]) => void
  setResumeAnalysis: (analysis: ResumeAnalysis | null) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  profile: null,
  internships: [],
  recommendations: [],
  resumeAnalysis: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInternships: (internships) => set({ internships }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setResumeAnalysis: (analysis) => set({ resumeAnalysis: analysis }),
  setLoading: (loading) => set({ loading }),
}))
