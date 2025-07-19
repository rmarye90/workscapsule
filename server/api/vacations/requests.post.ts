import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const body = await readBody(event)
    const { startDate, endDate, type, reason, daysCount } = body

    if (!startDate || !endDate || !type || daysCount === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Champs requis manquants'
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La date de fin doit être après la date de début'
      })
    }

    const existingRequest = await prisma.leaveRequest.findFirst({
      where: {
        userId: decoded.userId,
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } }
            ]
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ],
        status: { in: ['PENDING', 'APPROVED'] }
      }
    })

    if (existingRequest) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Une demande de congé existe déjà pour cette période'
      })
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: decoded.userId,
        startDate: start,
        endDate: end,
        type,
        reason,
        daysCount,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return leaveRequest
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erreur serveur'
    })
  }
})