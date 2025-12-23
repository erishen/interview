#!/usr/bin/env node

const { execSync } = require('child_process')

// Common development ports used in this monorepo
const COMMON_PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 6006]

console.log('🔍 Checking for processes on common development ports...\n')

let foundProcesses = false

COMMON_PORTS.forEach(port => {
  try {
    const output = execSync(`lsof -i:${port}`, { encoding: 'utf8', stdio: 'pipe' })
    const lines = output.trim().split('\n').slice(1) // Skip header

    if (lines.length > 0 && lines[0].trim() !== '') {
      foundProcesses = true
      console.log(`📍 Port ${port}:`)

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/)
        if (parts.length >= 2) {
          const pid = parts[1]
          const command = parts[0]
          console.log(`   ${command} (PID: ${pid})`)
        }
      })
    }
  } catch (err) {
    // No process on this port
  }
})

if (!foundProcesses) {
  console.log('✅ No processes found on common development ports.')
  process.exit(0)
}

console.log('\n🛑 Killing all Node.js processes on development ports...')

COMMON_PORTS.forEach(port => {
  try {
    const output = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim()
    if (output) {
      const pids = output.split('\n').filter(pid => pid.trim())
      pids.forEach(pid => {
        try {
          execSync(`kill -9 ${pid}`)
          console.log(`✅ Killed process ${pid} on port ${port}`)
        } catch (err) {
          console.warn(`⚠️  Failed to kill process ${pid}:`, err.message)
        }
      })
    }
  } catch (err) {
    // No process on this port
  }
})

console.log('\n🎉 Port cleanup complete!')
