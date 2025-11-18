import { FastifyInstance } from 'fastify'
import { importLeadsFromCSV } from '../../services/importService'

export async function importRoutes(fastify: FastifyInstance) {
  fastify.post('/api/v1/leads/import', async (request, reply) => {
    const { csvContent } = request.body as { csvContent: string }

    if (!csvContent) {
      return reply.code(400).send({ error: 'csvContent is required' })
    }

    const result = await importLeadsFromCSV(csvContent)
    return reply.code(200).send(result)
  })
}
