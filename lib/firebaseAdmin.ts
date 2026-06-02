import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

let initialized = false

function parseServiceAccount(): Record<string, unknown> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not defined')
  }

  try {
    return JSON.parse(raw)
  } catch (error) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON: ${(error as Error).message}`)
  }
}

function initFirebaseAdmin() {
  if (initialized || getApps().length) {
    initialized = true
    return
  }

  initializeApp({
    credential: cert(parseServiceAccount()),
  })
  initialized = true
}

export function getAdminAuth() {
  initFirebaseAdmin()
  return getAuth()
}

export function getAdminDb() {
  initFirebaseAdmin()
  return getFirestore()
}
