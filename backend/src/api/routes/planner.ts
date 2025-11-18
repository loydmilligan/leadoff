import { FastifyInstance } from 'fastify'
import { getPlannerData } from '../../services/plannerService'

export async function plannerRoutes(fastify: FastifyInstance) {
  fastify.get('/api/v1/planner', async (request, reply) => {
    const data = await getPlannerData()
    return reply.code(200).send(data)
  })
}
