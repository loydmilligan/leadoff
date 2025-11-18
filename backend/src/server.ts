/**
 * LeadOff CRM Backend Server
 * Fastify REST API server
 */

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { leadRoutes } from './api/routes/leads'
import { reportRoutes } from './api/routes/reports'
import { leadActionRoutes } from './api/routes/leadActions'
import { archiveRoutes } from './api/routes/archive'
import { plannerRoutes } from './api/routes/planner'
import { importRoutes } from './api/routes/import'

const SERVER_PORT = 3000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5174'

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
})

// Register CORS plugin for frontend origin
await server.register(cors, {
  origin: FRONTEND_ORIGIN,
  credentials: true,
})

// Health check endpoint
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'leadoff-backend',
  }
})

// Register API routes
await server.register(leadRoutes)
await server.register(reportRoutes)
await server.register(leadActionRoutes)
await server.register(archiveRoutes)
await server.register(plannerRoutes)
await server.register(importRoutes)

// Start server
const start = async () => {
  try {
    await server.listen({ port: SERVER_PORT, host: '0.0.0.0' })
    console.log(`✓ LeadOff Backend running on http://localhost:${SERVER_PORT}`)
    console.log(`✓ CORS enabled for: ${FRONTEND_ORIGIN}`)
    console.log(`✓ Health check: http://localhost:${SERVER_PORT}/health`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

// Handle graceful shutdown
const signals = ['SIGINT', 'SIGTERM']
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server gracefully...`)
    await server.close()
    process.exit(0)
  })
})

start()

export { server }
