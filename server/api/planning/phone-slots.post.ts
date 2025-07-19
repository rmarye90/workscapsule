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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès non autorisé'
      })
    }

    const body = await readBody(event)
    const { date, startTime, endTime, assignedUserId, isRecurring, dayOfWeek, description } = body

    if (!date || !startTime || !endTime) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Champs requis manquants'
      })
    }

    const phoneSlot = await prisma.phoneSlot.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        assignedUserId: assignedUserId || null,
        isRecurring: isRecurring || false,
        dayOfWeek,
        description
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return phoneSlot
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erreur serveur'
    })
  }
})