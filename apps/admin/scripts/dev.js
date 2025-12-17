#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { spawn } = require('child_process')

const PORT = process.env.PORT || '3003'
const command = process.argv[2] || 'dev'

let nextCommand
switch (command) {
  case 'dev':
    nextCommand = ['next', 'dev', '--port', PORT]
    break
  case 'start':
    nextCommand = ['next', 'start', '--port', PORT]
    break
  case 'build':
    nextCommand = ['next', 'build']
    break
  default:
    console.error(`Unknown command: ${command}`)
    process.exit(1)
}

console.log(`Starting Next.js on port ${PORT}...`)

const child = spawn('npx', nextCommand, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT,
    NEXTAUTH_URL: `http://localhost:${PORT}`,
    NEXT_PUBLIC_API_URL: `http://localhost:${PORT}/api`
  }
})

child.on('close', (code) => {
  process.exit(code)
})

child.on('error', (err) => {
  console.error('Failed to start process:', err)
  process.exit(1)
})