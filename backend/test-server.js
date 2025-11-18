#!/usr/bin/env node
/**
 * Quick test script for Fastify server
 */

import { spawn } from 'child_process'

const server = spawn('npm', ['run', 'dev'], {
  cwd: '/home/mmariani/Projects/leadoff/worktrees/001-leadoff-crm/backend',
  stdio: ['ignore', 'pipe', 'pipe']
})

let started = false

server.stdout.on('data', (data) => {
  const output = data.toString()
  console.log('STDOUT:', output)
  if (output.includes('running on')) {
    started = true
  }
})

server.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString())
})

// Wait for server to start, then test
setTimeout(async () => {
  if (started) {
    console.log('\nTesting health endpoint...')
    try {
      const response = await fetch('http://localhost:3000/health')
      const data = await response.json()
      console.log('✓ Health check response:', JSON.stringify(data, null, 2))
      console.log('✓ Server is working!')
    } catch (err) {
      console.error('✗ Health check failed:', err.message)
    }
  } else {
    console.error('✗ Server did not start')
  }

  server.kill('SIGTERM')
  process.exit(started ? 0 : 1)
}, 5000)
