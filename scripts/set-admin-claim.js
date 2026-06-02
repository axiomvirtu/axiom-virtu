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
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error('Usage: node scripts/set-admin-claim.js <uid> [true|false]')
    process.exit(1)
  }

  const uid = args[0]
  const adminFlag = args[1] !== 'false'

  const serviceAccount = parseServiceAccount()

  if (!admin.apps?.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: adminFlag })
    console.log(`Set admin=${adminFlag} for uid=${uid}`)
    process.exit(0)
  } catch (err) {
    console.error('Error setting custom claims:', err)
    process.exit(1)
  }
}

main()
