import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'VITE_FIREBASE_API_KEY_PLACEHOLDER',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'VITE_FIREBASE_AUTH_DOMAIN_PLACEHOLDER',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'VITE_FIREBASE_PROJECT_ID_PLACEHOLDER',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'VITE_FIREBASE_PROJECT_ID_PLACEHOLDER.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'VITE_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:VITE_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER:web:5c477fc4a980cf0c8c1b82',
}

const hasConfig = Object.values(firebaseConfig).every((value) => Boolean(value))

export const app: FirebaseApp | null = hasConfig ? initializeApp(firebaseConfig) : null
export const auth: Auth | null = app ? getAuth(app) : null
export const db: Firestore | null = app ? getFirestore(app) : null
export const isFirebaseConfigured = Boolean(app && auth && db)
