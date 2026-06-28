import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'REMOVED',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'REMOVED',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'REMOVED',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'REMOVED',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'REMOVED',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'REMOVED',
}

const hasConfig = Object.values(firebaseConfig).every((value) => Boolean(value))

export const app: FirebaseApp | null = hasConfig ? initializeApp(firebaseConfig) : null
export const auth: Auth | null = app ? getAuth(app) : null
export const db: Firestore | null = app ? getFirestore(app) : null
export const isFirebaseConfigured = Boolean(app && auth && db)
