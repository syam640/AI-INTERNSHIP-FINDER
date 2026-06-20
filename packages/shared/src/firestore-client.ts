import { db } from './firebase-client'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import { UserProfile, Internship } from './types'

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: new Date(),
  })
}

export async function saveInternships(internships: Internship[]) {
  for (const internship of internships) {
    await setDoc(doc(db, 'internships', internship.id), internship, { merge: true })
  }
}

export async function getInternships(filters?: {
  skills?: string[]
  location?: string
  source?: string
}): Promise<Internship[]> {
  let q = collection(db, 'internships') as any
  const constraints: any[] = []

  if (filters?.skills?.length) {
    constraints.push(where('skills', 'array-contains-any', filters.skills))
  }
  if (filters?.location) {
    constraints.push(where('location', '==', filters.location))
  }
  if (filters?.source) {
    constraints.push(where('source', '==', filters.source))
  }

  constraints.push(orderBy('postedAt', 'desc'))
  constraints.push(limit(50))

  const snap = await getDocs(query(q, ...constraints))
  return snap.docs.map((d) => d.data() as Internship)
}

