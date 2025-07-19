import prisma from '~/utils/prisma'
import { verifyToken } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token d\'authentification requis'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        workSchedule: true,
        dailyHours: true,
        startDate: true,
        rttDaysPerYear: true,
        seniorityDays: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Utilisateur introuvable'
      })
    }

    return user
  } catch (error) {
    console.error('Auth me error:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Token invalide'
    })
  }
})