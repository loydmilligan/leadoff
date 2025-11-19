import { FastifyInstance } from 'fastify'
import {
  archiveLead,
  restoreLead,
  getArchivedLeads,
  deleteLead,
} from '../../services/archiveService'

export async function archiveRoutes(fastify: FastifyInstance) {
  // Get all archived leads
  fastify.get('/api/v1/archive', async (_request, reply) => {
    const leads = await getArchivedLeads()
    return reply.code(200).send(leads)
  })

  // Archive a lead
  fastify.post('/api/v1/leads/:id/archive', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { reason } = request.body as { reason?: string }

    const lead = await archiveLead(id, reason)
    return reply.code(200).send(lead)
  })

  // Restore a lead
  fastify.post('/api/v1/leads/:id/restore', async (request, reply) => {
    const { id } = request.params as { id: string }

    const lead = await restoreLead(id)
    return reply.code(200).send(lead)
  })

  // Permanently delete a lead
  fastify.delete('/api/v1/leads/:id/permanent', async (request, reply) => {
    const { id } = request.params as { id: string }

    await deleteLead(id)
    return reply.code(200).send({ success: true })
  })
}
