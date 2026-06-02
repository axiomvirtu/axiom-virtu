/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

// Load .env and .env.local if they exist before checking
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

const requiredEnv = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'FIREBASE_SERVICE_ACCOUNT_KEY',
  'ADMIN_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'CRON_SECRET',
]

function checkEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error('Missing required environment variables:')
    missing.forEach((key) => console.error(`- ${key}`))
  } else {
    console.log('All required environment variables are present.')
  }

  const serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (serviceKey) {
    try {
      JSON.parse(serviceKey)
      console.log('FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON.')
    } catch (error) {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON:', error.message)
    }
  }

  const rulesPath = path.join(process.cwd(), 'firestore.rules')
  if (fs.existsSync(rulesPath)) {
    console.log('firestore.rules file is present.')
  } else {
    console.warn('firestore.rules file is missing. Please create or add it before manual upload.')
  }

  if (missing.length > 0) {
    process.exit(1)
  }
}

checkEnv()
