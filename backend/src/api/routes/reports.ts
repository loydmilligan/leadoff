/**
 * Report API Routes
 * Business intelligence and analytics endpoints
 */

import { FastifyInstance } from 'fastify'
import {
  pipelineValue,
  leadAge,
  weeklySummary,
  winLossAnalysis,
} from '../../services/reportService'

export async function reportRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/v1/reports/pipeline-value
   * Returns stage-by-stage pipeline economics and conversion rates
   */
  fastify.get('/api/v1/reports/pipeline-value', async (_request, reply) => {
    try {
      const report = await pipelineValue()
      return reply.code(200).send(report)
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Failed to generate pipeline value report',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  /**
   * GET /api/v1/reports/lead-age
   * Identifies stale leads (>14 days) at risk
   */
  fastify.get('/api/v1/reports/lead-age', async (_request, reply) => {
    try {
      const report = await leadAge()
      return reply.code(200).send(report)
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Failed to generate lead age report',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  /**
   * GET /api/v1/reports/weekly-summary
   * Tracks team productivity week-over-week
   * Query params: startDate (ISO 8601), endDate (ISO 8601)
   */
  fastify.get<{
    Querystring: {
      startDate?: string
      endDate?: string
    }
  }>('/api/v1/reports/weekly-summary', async (request, reply) => {
    try {
      const { startDate, endDate } = request.query

      // Validate dates if provided
      if (startDate) {
        const date = new Date(startDate)
        if (isNaN(date.getTime())) {
          return reply.code(400).send({
            error: 'Invalid startDate format',
            message: 'startDate must be a valid ISO 8601 date string',
          })
        }
      }

      if (endDate) {
        const date = new Date(endDate)
        if (isNaN(date.getTime())) {
          return reply.code(400).send({
            error: 'Invalid endDate format',
            message: 'endDate must be a valid ISO 8601 date string',
          })
        }
      }

      const report = await weeklySummary(startDate, endDate)
      return reply.code(200).send(report)
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Failed to generate weekly summary report',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  /**
   * GET /api/v1/reports/win-loss
   * Reveals deal closure metrics and loss patterns
   * Query params: startDate (ISO 8601), endDate (ISO 8601)
   */
  fastify.get<{
    Querystring: {
      startDate?: string
      endDate?: string
    }
  }>('/api/v1/reports/win-loss', async (request, reply) => {
    try {
      const { startDate, endDate } = request.query

      // Validate dates if provided
      if (startDate) {
        const date = new Date(startDate)
        if (isNaN(date.getTime())) {
          return reply.code(400).send({
            error: 'Invalid startDate format',
            message: 'startDate must be a valid ISO 8601 date string',
          })
        }
      }

      if (endDate) {
        const date = new Date(endDate)
        if (isNaN(date.getTime())) {
          return reply.code(400).send({
            error: 'Invalid endDate format',
            message: 'endDate must be a valid ISO 8601 date string',
          })
        }
      }

      const report = await winLossAnalysis(startDate, endDate)
      return reply.code(200).send(report)
    } catch (error) {
      fastify.log.error(error)
      return reply.code(500).send({
        error: 'Failed to generate win/loss analysis report',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
}
