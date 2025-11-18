import { FastifyInstance } from 'fastify'
import {
  closeAsWon,
  closeAsLost,
  moveToNurture,
  CloseAsWonInput,
  CloseAsLostInput,
  MoveToNurtureInput,
} from '../../services/leadActionService'

export async function leadActionRoutes(fastify: FastifyInstance) {
  // Close as Won
  fastify.post('/api/v1/leads/:id/close-won', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { notes } = request.body as { notes: string }

    if (!notes || notes.trim().length === 0) {
      return reply.code(400).send({ error: 'Notes are required' })
    }

    const input: CloseAsWonInput = { leadId: id, notes }
    const lead = await closeAsWon(input)
    return reply.code(200).send(lead)
  })

  // Close as Lost
  fastify.post('/api/v1/leads/:id/close-lost', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { competitorName, reason, notes } = request.body as {
      competitorName: string
      reason: string
      notes: string
    }

    if (!competitorName || !reason || !notes) {
      return reply.code(400).send({
        error: 'competitorName, reason, and notes are required',
      })
    }

    const input: CloseAsLostInput = {
      leadId: id,
      competitorName,
      reason,
      notes,
    }
    const lead = await closeAsLost(input)
    return reply.code(200).send(lead)
  })

  // Move to Nurture
  fastify.post('/api/v1/leads/:id/nurture', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { nurturePeriod, notes } = request.body as {
      nurturePeriod: 30 | 90
      notes: string
    }

    if (!notes || notes.trim().length === 0) {
      return reply.code(400).send({ error: 'Notes are required' })
    }

    if (nurturePeriod !== 30 && nurturePeriod !== 90) {
      return reply.code(400).send({
        error: 'nurturePeriod must be 30 or 90',
      })
    }

    const input: MoveToNurtureInput = {
      leadId: id,
      nurturePeriod,
      notes,
    }
    const lead = await moveToNurture(input)
    return reply.code(200).send(lead)
  })
}
