import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
}

let app: ReturnType<typeof initializeApp> | undefined
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
} catch (error) {
  console.warn('Firebase initialization error', error)
}

let analytics: ReturnType<typeof getAnalytics> | null = null
if (typeof window !== 'undefined' && app) {
  isSupported()
    .then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app)
      }
    })
    .catch(() => {
      // Analytics is optional and may not be available in all environments.
    })
}

let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getFirestore> | null = null

if (typeof window !== 'undefined' && app && firebaseConfig.apiKey) {
  try {
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (error) {
    console.warn('Firebase services initialization error', error)
  }
}

export { app, analytics, auth, db, firebaseConfig }
