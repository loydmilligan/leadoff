/**
 * Lead API Routes
 * REST endpoints for lead management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { LeadService } from '../../services/leadService'
import { OrganizationService } from '../../services/organizationService'
import { DemoService } from '../../services/demoService'
import { ProposalService } from '../../services/proposalService'
import { Stage } from '@leadoff/types'

export async function leadRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/leads
   * Create a new lead
   */
  fastify.post('/api/v1/leads', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const lead = await LeadService.createLead(request.body)
      return reply.status(201).send(lead)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
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
   * GET /api/v1/leads
   * Get all leads with pagination and search
   */
  fastify.get('/api/v1/leads', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        search?: string
        stage?: Stage
        page?: string
        limit?: string
      }

      const params = {
        search: query.search,
        stage: query.stage,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      }

      const result = await LeadService.getLeads(params)
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
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
   * GET /api/v1/leads/:id
   * Get single lead by ID
   */
  fastify.get('/api/v1/leads/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const lead = await LeadService.getLeadById(id)

      if (!lead) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Lead not found',
        })
      }

      return reply.status(200).send(lead)
    } catch (error) {
      if (error instanceof Error) {
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
   * PATCH /api/v1/leads/:id/stage
   * Update lead stage
   */
  fastify.patch('/api/v1/leads/:id/stage', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const body = request.body as { stage: Stage; note?: string }

      const lead = await LeadService.updateLeadStage(id, body)
      return reply.status(200).send(lead)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Lead not found') {
          return reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'Lead not found',
          })
        }
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
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
   * PATCH /api/v1/leads/:id
   * Update lead details
   */
  fastify.patch('/api/v1/leads/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const lead = await LeadService.updateLead(id, request.body)
      return reply.status(200).send(lead)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
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
   * DELETE /api/v1/leads/:id
   * Delete a lead
   */
  fastify.delete('/api/v1/leads/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      await LeadService.deleteLead(id)
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Error) {
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
   * GET /api/v1/leads/follow-ups
   * Get leads categorized by follow-up urgency
   * Returns: { overdue: Lead[], today: Lead[], upcoming: Lead[] }
   */
  fastify.get('/api/v1/leads/follow-ups', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await LeadService.getFollowUpLeads()
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof Error) {
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
   * PUT /api/v1/leads/:id/organization
   * Create or update organization details for a lead
   */
  fastify.put('/api/v1/leads/:id/organization', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const organizationInfo = await OrganizationService.upsert(id, request.body as any)
      return reply.status(200).send(organizationInfo)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Lead not found') {
          return reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'Lead not found',
          })
        }
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
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
   * PUT /api/v1/leads/:id/demo
   * Create or update demo details for a lead
   */
  fastify.put('/api/v1/leads/:id/demo', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const demoDetails = await DemoService.upsert(id, request.body as any)
      return reply.status(200).send(demoDetails)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Lead not found') {
          return reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'Lead not found',
          })
        }
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
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
   * PUT /api/v1/leads/:id/proposal
   * Create or update proposal for a lead
   */
  fastify.put('/api/v1/leads/:id/proposal', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string }
      const proposal = await ProposalService.upsert(id, request.body as any)
      return reply.status(200).send(proposal)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Lead not found') {
          return reply.status(404).send({
            error: 'NOT_FOUND',
            message: 'Lead not found',
          })
        }
        if (error.message === 'Proposal date cannot be in the future') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Proposal date cannot be in the future',
          })
        }
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error,
          })
        }
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
