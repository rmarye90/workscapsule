import prisma from '~/utils/prisma'
import { verifyToken } from '~/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Vérifier l'authentification
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token d\'authentification requis'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    // Récupérer les paramètres de query
    const query = getQuery(event)
    const { month, year, startDate, endDate } = query

    // Construire le filtre de date
    let dateFilter: any = {}
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      }
    } else if (month && year) {
      const monthNum = parseInt(month as string)
      const yearNum = parseInt(year as string)
      const startOfMonth = new Date(yearNum, monthNum, 1)
      const endOfMonth = new Date(yearNum, monthNum + 1, 0)
      
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }

    // Récupérer les entrées de temps
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: decoded.userId,
        ...dateFilter
      },
      orderBy: {
        date: 'desc'
      }
    })

    return timeEntries
  } catch (error) {
    console.error('Get time entries error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des entrées'
    })
  }
})