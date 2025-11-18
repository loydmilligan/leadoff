import { FastifyInstance } from 'fastify'
import { summarizeActivityNotes } from '../../services/aiService'

export async function aiRoutes(fastify: FastifyInstance) {
  // Summarize activity notes
  fastify.post('/api/v1/activities/:id/summarize', async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const summary = await summarizeActivityNotes(id)
      return reply.code(200).send({ summary })
    } catch (error: any) {
      return reply.code(500).send({ error: error.message })
    }
  })
}
