#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin')

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!raw) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set')
    process.exit(1)
  }
  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON:', err.message)
    process.exit(1)
  }
}

async function main() {
  const serviceAccount = parseServiceAccount()
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }

  const db = admin.firestore()
  const now = new Date()
  const snapshot = await db.collection('telegram_init_nonces')
    .where('expiresAt', '<=', now)
    .limit(500)
    .get()

  if (snapshot.empty) {
    console.log('No expired nonces found.')
    process.exit(0)
  }

  const batch = db.batch()
  snapshot.docs.forEach((doc) => batch.delete(doc.ref))
  await batch.commit()

  console.log(`Deleted ${snapshot.size} expired nonces.`)
  process.exit(0)
}

main().catch((error) => {
  console.error('Cleanup failed:', error)
  process.exit(1)
})
