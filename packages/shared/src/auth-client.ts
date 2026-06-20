import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './firebase-client'

const googleProvider = new GoogleAuthProvider()

export async function signUp(email: string, password: string, name: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName: name })
  return credential.user
}

export async function login(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user
}

export async function logout() {
  await signOut(auth)
}

export function onAuthChange(callback: (user: any) => void) {
  return auth.onAuthStateChanged(callback)
}
