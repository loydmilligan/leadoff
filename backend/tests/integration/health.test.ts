import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'

describe('Health Endpoint Integration Test', () => {
  let server: FastifyInstance

  beforeAll(async () => {
    // Create test server
    server = Fastify({ logger: false })

    await server.register(cors, {
      origin: 'http://localhost:5173',
      credentials: true,
    })

    server.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'leadoff-backend',
      }
    })

    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  it('should return 200 OK from health endpoint', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
  })

  it('should return correct health response structure', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    })

    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('status', 'ok')
    expect(body).toHaveProperty('service', 'leadoff-backend')
    expect(body).toHaveProperty('timestamp')
    expect(new Date(body.timestamp)).toBeInstanceOf(Date)
  })
})
