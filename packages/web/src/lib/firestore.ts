import { db } from './firebase'
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
import { Internship } from './shared'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms}ms`)), ms)
    ),
  ])
}

export async function createUserProfile(uid: string, data: any) {
  await withTimeout(
    setDoc(doc(db, 'users', uid), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    15000
  )
}

export async function getUserProfile(uid: string): Promise<any | null> {
  const snap = await withTimeout(getDoc(doc(db, 'users', uid)), 15000)
  return snap.exists() ? snap.data() : null
}

export async function updateUserProfile(uid: string, data: any) {
  await withTimeout(
    updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: new Date(),
    }),
    15000
  )
}

export async function saveInternships(internships: Internship[]) {
  for (const internship of internships) {
    await withTimeout(
      setDoc(doc(db, 'internships', internship.id), internship as any, { merge: true }),
      15000
    )
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

  const snap = await withTimeout(getDocs(query(q, ...constraints)), 20000)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() ?? {} } as Internship))
}
