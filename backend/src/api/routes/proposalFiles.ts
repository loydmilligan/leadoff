import { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()

// Configure multer
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const proposalId = (req.params as any).id
    const dir = path.join(__dirname, '../../../uploads/proposals', proposalId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const url = req.url
    const isProposal = url.includes('upload-proposal')
    const ext = path.extname(file.originalname)
    const filename = isProposal ? `proposal${ext}` : `pricesheet${ext}`
    cb(null, filename)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF and Excel files allowed.'))
    }
  },
})

export async function proposalFileRoutes(fastify: FastifyInstance) {
  // Upload proposal PDF
  fastify.post('/api/v1/proposals/:id/upload-proposal', async (request, reply) => {
    const { id } = request.params as { id: string }

    return new Promise((_resolve, _reject) => {
      upload.single('file')(request as any, reply as any, async (err: any) => {
        if (err) {
          return reply.code(400).send({ error: err.message })
        }

        const file = (request as any).file
        if (!file) {
          return reply.code(400).send({ error: 'No file uploaded' })
        }

        await prisma.proposal.update({
          where: { id },
          data: {
            proposalFilePath: file.path,
            proposalFileName: file.originalname,
          },
        })

        reply.code(200).send({ success: true, filename: file.originalname })
      })
    })
  })

  // Upload price sheet
  fastify.post('/api/v1/proposals/:id/upload-price-sheet', async (request, reply) => {
    const { id } = request.params as { id: string }

    return new Promise((_resolve, _reject) => {
      upload.single('file')(request as any, reply as any, async (err: any) => {
        if (err) {
          return reply.code(400).send({ error: err.message })
        }

        const file = (request as any).file
        if (!file) {
          return reply.code(400).send({ error: 'No file uploaded' })
        }

        await prisma.proposal.update({
          where: { id },
          data: {
            priceSheetPath: file.path,
            priceSheetFileName: file.originalname,
          },
        })

        reply.code(200).send({ success: true, filename: file.originalname })
      })
    })
  })

  // Download/view proposal file
  fastify.get('/api/v1/proposals/:id/files/proposal', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.proposalFilePath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    if (!fs.existsSync(proposal.proposalFilePath)) {
      return reply.code(404).send({ error: 'File not found on disk' })
    }

    const stream = fs.createReadStream(proposal.proposalFilePath)
    const filename = proposal.proposalFileName || path.basename(proposal.proposalFilePath)
    reply.type('application/pdf')
    reply.header('Content-Disposition', `inline; filename="${filename}"`)
    return reply.send(stream)
  })

  // Download price sheet
  fastify.get('/api/v1/proposals/:id/files/price-sheet', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.priceSheetPath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    if (!fs.existsSync(proposal.priceSheetPath)) {
      return reply.code(404).send({ error: 'File not found on disk' })
    }

    const stream = fs.createReadStream(proposal.priceSheetPath)
    const filename = proposal.priceSheetFileName || path.basename(proposal.priceSheetPath)
    const ext = path.extname(proposal.priceSheetPath).toLowerCase()
    const contentType = ext === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    reply.type(contentType)
    reply.header('Content-Disposition', `inline; filename="${filename}"`)
    return reply.send(stream)
  })

  // Delete proposal file
  fastify.delete('/api/v1/proposals/:id/files/proposal', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.proposalFilePath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    if (fs.existsSync(proposal.proposalFilePath)) {
      fs.unlinkSync(proposal.proposalFilePath)
    }

    await prisma.proposal.update({
      where: { id },
      data: {
        proposalFilePath: null,
        proposalFileName: null,
      },
    })

    return reply.code(200).send({ success: true })
  })

  // Delete price sheet
  fastify.delete('/api/v1/proposals/:id/files/price-sheet', async (request, reply) => {
    const { id } = request.params as { id: string }

    const proposal = await prisma.proposal.findUnique({ where: { id } })
    if (!proposal || !proposal.priceSheetPath) {
      return reply.code(404).send({ error: 'File not found' })
    }

    if (fs.existsSync(proposal.priceSheetPath)) {
      fs.unlinkSync(proposal.priceSheetPath)
    }

    await prisma.proposal.update({
      where: { id },
      data: {
        priceSheetPath: null,
        priceSheetFileName: null,
      },
    })

    return reply.code(200).send({ success: true })
  })
}
