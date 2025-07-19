import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { year } = query

    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear()
    const startDate = new Date(currentYear, 0, 1)
    const endDate = new Date(currentYear + 1, 0, 1)

    const leaveStats = await prisma.leaveRequest.groupBy({
      by: ['type', 'userId'],
      where: {
        status: 'APPROVED',
        OR: [
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
      },
      _sum: {
        daysCount: true
      }
    })

    const userStats = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rttDaysPerYear: true,
        seniorityDays: true,
        leaveRequests: {
          where: {
            status: 'APPROVED',
            OR: [
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
          },
          select: {
            type: true,
            daysCount: true
          }
        }
      }
    })

    const monthlyStats = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        OR: [
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
      },
      select: {
        startDate: true,
        endDate: true,
        daysCount: true,
        type: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return {
      leaveStats,
      userStats,
      monthlyStats,
      year: currentYear
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erreur serveur'
    })
  }
})