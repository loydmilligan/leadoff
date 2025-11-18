/**
 * Lead Action API Routes
 * Endpoints for lead stage transitions (won, lost, nurture)
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import {
  closeAsWon,
  closeAsLost,
  moveToNurture,
  CloseAsWonInput,
  CloseAsLostInput,
  MoveToNurtureInput,
} from '../../services/leadActionService'

// Zod validation schemas
const CloseAsWonSchema = z.object({
  notes: z.string().min(1, 'Notes are required'),
})

const CloseAsLostSchema = z.object({
  competitorName: z.string().min(1, 'Competitor name is required'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().min(1, 'Notes are required'),
})

const MoveToNurtureSchema = z.object({
  nurturePeriod: z.union([z.literal(30), z.literal(90)], {
    errorMap: () => ({ message: 'nurturePeriod must be 30 or 90' }),
  }),
  notes: z.string().min(1, 'Notes are required'),
})

export async function leadActionRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/leads/:id/close-won
   * Close a lead as won
   */
  fastify.post('/api/v1/leads/:id/close-won', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }

      // Validate request body with Zod
      const validatedBody = CloseAsWonSchema.parse(request.body)

      const input: CloseAsWonInput = { leadId: id, notes: validatedBody.notes }
      const lead = await closeAsWon(input)
      return reply.status(200).send(lead)
    } catch (error) {
      if (error instanceof Error) {
        // Handle "not found" errors from service
        if (error.message.includes('not found')) {
          return reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'Lead not found',
          })
        }
        // Handle Zod validation errors
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
        // Generic errors
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unknown error occurred',
      })
    }
  })

  /**
   * POST /api/v1/leads/:id/close-lost
   * Close a lead as lost with competitor and reason
   */
  fastify.post('/api/v1/leads/:id/close-lost', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }

      // Validate request body with Zod
      const validatedBody = CloseAsLostSchema.parse(request.body)

      const input: CloseAsLostInput = {
        leadId: id,
        competitorName: validatedBody.competitorName,
        reason: validatedBody.reason,
        notes: validatedBody.notes,
      }
      const lead = await closeAsLost(input)
      return reply.status(200).send(lead)
    } catch (error) {
      if (error instanceof Error) {
        // Handle "not found" errors from service
        if (error.message.includes('not found')) {
          return reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'Lead not found',
          })
        }
        // Handle Zod validation errors
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
        // Generic errors
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unknown error occurred',
      })
    }
  })

  /**
   * POST /api/v1/leads/:id/nurture
   * Move a lead to nurture workflow (30 or 90 days)
   */
  fastify.post('/api/v1/leads/:id/nurture', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }

      // Validate request body with Zod
      const validatedBody = MoveToNurtureSchema.parse(request.body)

      const input: MoveToNurtureInput = {
        leadId: id,
        nurturePeriod: validatedBody.nurturePeriod,
        notes: validatedBody.notes,
      }
      const lead = await moveToNurture(input)
      return reply.status(200).send(lead)
    } catch (error) {
      if (error instanceof Error) {
        // Handle "not found" errors from service
        if (error.message.includes('not found')) {
          return reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'Lead not found',
          })
        }
        // Handle Zod validation errors
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
        // Generic errors
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: error.message,
        })
      }
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'An unknown error occurred',
      })
    }
  })
}
