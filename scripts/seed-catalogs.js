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
  const serviceAccount = parseServiceAccount()

  if (!admin.apps?.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }

  const db = admin.firestore()
  const collectionRef = db.collection('asset_catalogs')

  const items = [
    {
      name: 'Spark Alpha',
      level_name: 'Virtu Spark - Sesi 1',
      image_url: '/images/virtu-spark.png',
      capital_min: 10.00,
      capital_max: 39.99,
      ticket_time_start: '09:00',
      ticket_time_end: '09:20',
      trading_time_start: '12:00',
      trading_time_end: '13:30',
      order_index: 0,
      is_active: true
    },
    {
      name: 'Spark Beta',
      level_name: 'Virtu Spark - Sesi 2',
      image_url: '/images/virtu-spark.png',
      capital_min: 10.00,
      capital_max: 39.99,
      ticket_time_start: '09:00',
      ticket_time_end: '09:20',
      trading_time_start: '19:30',
      trading_time_end: '21:30',
      order_index: 1,
      is_active: true
    },
    {
      name: 'Core Nexus',
      level_name: 'Axiom Core - Sesi 1',
      image_url: '/images/axiom-core.png',
      capital_min: 40.00,
      capital_max: 99.99,
      ticket_time_start: '09:25',
      ticket_time_end: '09:45',
      trading_time_start: '14:00',
      trading_time_end: '15:30',
      order_index: 2,
      is_active: true
    },
    {
      name: 'Core Prime',
      level_name: 'Axiom Core - Sesi 2',
      image_url: '/images/axiom-core.png',
      capital_min: 40.00,
      capital_max: 99.99,
      ticket_time_start: '09:25',
      ticket_time_end: '09:45',
      trading_time_start: '21:40',
      trading_time_end: '23:40',
      order_index: 3,
      is_active: true
    },
    {
      name: 'Pulse Horizon',
      level_name: 'Aether Pulse',
      image_url: '/images/aether-pulse.png',
      capital_min: 100.00,
      capital_max: 299.99,
      ticket_time_start: '09:50',
      ticket_time_end: '10:15',
      trading_time_start: '15:40',
      trading_time_end: '17:40',
      order_index: 4,
      is_active: true
    },
    {
      name: 'Chronos Vortex',
      level_name: 'Chronos Shift',
      image_url: '/images/chronos-shift.png',
      capital_min: 300.00,
      capital_max: 799.99,
      ticket_time_start: '10:20',
      ticket_time_end: '10:40',
      trading_time_start: '17:45',
      trading_time_end: '19:15',
      order_index: 5,
      is_active: true
    },
    {
      name: 'Apex Titan',
      level_name: 'Nova Apex',
      image_url: '/images/nova-apex.png',
      capital_min: 800.00,
      capital_max: 2500.00, // Representing 800++
      ticket_time_start: '10:45',
      ticket_time_end: '11:00',
      trading_time_start: '00:00',
      trading_time_end: '02:00',
      order_index: 6,
      is_active: true
    }
  ]

  try {
    console.log('Fetching existing catalogs...')
    const snapshot = await collectionRef.get()
    
    if (!snapshot.empty) {
      console.log(`Deleting ${snapshot.size} existing catalogs...`)
      const batch = db.batch()
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      console.log('Existing catalogs deleted.')
    }

    console.log('Seeding new catalogs...')
    const batch = db.batch()
    items.forEach((item) => {
      const docRef = collectionRef.doc()
      batch.set(docRef, {
        ...item,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      })
    })

    await batch.commit()
    console.log('Database successfully seeded with Blueprint Asset Catalog!')
    process.exit(0)
  } catch (err) {
    console.error('Error seeding database:', err)
    process.exit(1)
  }
}

main()
