import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { year, month, status, userId } = query

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

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur non trouvé'
      })
    }

    const whereClause: any = {}

    if (user.role !== 'ADMIN') {
      whereClause.userId = decoded.userId
    } else if (userId) {
      whereClause.userId = userId as string
    }

    if (status) {
      whereClause.status = status
    }

    if (year) {
      const startDate = new Date(parseInt(year as string), 0, 1)
      const endDate = new Date(parseInt(year as string) + 1, 0, 1)
      
      if (month) {
        startDate.setMonth(parseInt(month as string) - 1)
        endDate.setMonth(parseInt(month as string))
        endDate.setFullYear(parseInt(year as string))
      }

      whereClause.OR = [
        {
          startDate: {
            gte: startDate,
            lt: endDate
          }
        },
        {
          endDate: {
            gte: startDate,
            lt: endDate
          }
        }
      ]
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { startDate: 'asc' }
      ]
    })

    return leaveRequests
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erreur serveur'
    })
  }
})