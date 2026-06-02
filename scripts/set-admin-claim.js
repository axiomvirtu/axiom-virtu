#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

// Load .env and .env.local if they exist
const envFiles = ['.env', '.env.local']
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=')
        if (parts.length >= 2) {
          const key = parts[0].trim()
          const value = parts.slice(1).join('=').trim()
          const cleanValue = value.replace(/^['"]|['"]$/g, '')
          if (!process.env[key] && cleanValue) {
            process.env[key] = cleanValue
          }
        }
      }
    })
  }
})

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

    const db = admin.firestore()
    const adminRef = db.collection('admins').doc(uid)

    if (adminFlag) {
      const snap = await adminRef.get()
      const now = admin.firestore.FieldValue.serverTimestamp()
      const adminData = {
        telegram_id: uid,
        role: 'admin',
        updated_at: now
      }
      if (!snap.exists) {
        adminData.created_at = now
      }
      await adminRef.set(adminData, { merge: true })
      console.log(`Document admins/${uid} successfully created/updated in Firestore.`)
    } else {
      await adminRef.delete()
      console.log(`Document admins/${uid} successfully deleted from Firestore.`)
    }

    process.exit(0)
  } catch (err) {
    console.error('Error setting custom claims / updating Firestore:', err)
    process.exit(1)
  }
}

main()
