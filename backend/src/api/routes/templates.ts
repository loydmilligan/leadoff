import { FastifyInstance } from 'fastify'
import { getTemplates, getTemplate, replacePlaceholders } from '../../services/templateService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function templateRoutes(fastify: FastifyInstance) {
  // Get all templates (optionally filtered by type)
  fastify.get('/api/v1/templates', async (request, reply) => {
    const { type } = request.query as { type?: string }
    const templates = await getTemplates(type)
    return reply.code(200).send(templates)
  })

  // Get template by ID
  fastify.get('/api/v1/templates/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const template = await getTemplate(id)

    if (!template) {
      return reply.code(404).send({ error: 'Template not found' })
    }

    return reply.code(200).send(template)
  })

  // Get template with placeholders replaced for specific lead
  fastify.get('/api/v1/templates/:id/render/:leadId', async (request, reply) => {
    const { id, leadId } = request.params as { id: string; leadId: string }

    const template = await getTemplate(id)
    if (!template) {
      return reply.code(404).send({ error: 'Template not found' })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return reply.code(404).send({ error: 'Lead not found' })
    }

    const renderedBody = replacePlaceholders(template.body, lead)
    const renderedSubject = template.subject
      ? replacePlaceholders(template.subject, lead)
      : null

    return reply.code(200).send({
      ...template,
      body: renderedBody,
      subject: renderedSubject,
    })
  })
}
