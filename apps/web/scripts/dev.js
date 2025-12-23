#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { spawn, execSync } = require('child_process')

const command = process.argv[2] || 'dev'

// Use the specified port or default to 3000, force kill any occupying processes
const PORT = process.env.PORT || '3000'

if (isPortInUse(PORT)) {
  console.log(`Port ${PORT} is in use, killing existing processes...`)
  killProcessOnPort(PORT)

  // Wait synchronously for port to be freed (max 5 seconds)
  console.log(`Waiting for port ${PORT} to be freed...`)
  let attempts = 0
  const maxAttempts = 50 // 5 seconds with 100ms intervals

  while (isPortInUse(PORT) && attempts < maxAttempts) {
    // Wait 100ms
    const start = Date.now()
    while (Date.now() - start < 100) {
      // Busy wait
    }
    attempts++
  }

  if (isPortInUse(PORT)) {
    console.error(`Failed to free port ${PORT} after 5 seconds. Please check manually.`)
    process.exit(1)
  }

  console.log(`Port ${PORT} is now available!`)
}

// Function to check if port is in use
function isPortInUse(port) {
  try {
    execSync(`lsof -i:${port}`, { stdio: 'pipe' })
    return true
  } catch (err) {
    return false
  }
}

// Function to kill process on specific port
function killProcessOnPort(port) {
  try {
    const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim()
    if (output) {
      const pids = output.split('\n')
      pids.forEach(pid => {
        try {
          process.kill(parseInt(pid), 'SIGKILL')
          console.log(`Killed process ${pid} on port ${port}`)
        } catch (err) {
          console.warn(`Failed to kill process ${pid}:`, err.message)
        }
      })
    }
  } catch (err) {
    // No process found on port, which is fine
  }
}

// Removed findAvailablePort function - now we force kill processes on preferred port

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

// Port handling is done above - we force kill any occupying processes

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
