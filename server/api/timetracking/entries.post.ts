import prisma from '~/utils/prisma'
import { verifyToken } from '~/utils/auth'
import { calculateWorkTime } from '~/utils/timeCalculations'

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

    const body = await readBody(event)
    const { date, startTime, endTime, breakTime, notes } = body

    if (!date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La date est requise'
      })
    }

    // Calculer le temps de travail si startTime et endTime sont fournis
    let workTime: number | undefined
    if (startTime && endTime) {
      workTime = calculateWorkTime(startTime, endTime, breakTime || 0)
    }

    // Créer ou mettre à jour l'entrée
    const timeEntry = await prisma.timeEntry.upsert({
      where: {
        userId_date: {
          userId: decoded.userId,
          date: new Date(date)
        }
      },
      update: {
        startTime: startTime ? new Date(`${date}T${startTime}:00`) : null,
        endTime: endTime ? new Date(`${date}T${endTime}:00`) : null,
        breakTime: breakTime || 0,
        workTime,
        notes: notes || null
      },
      create: {
        userId: decoded.userId,
        date: new Date(date),
        startTime: startTime ? new Date(`${date}T${startTime}:00`) : null,
        endTime: endTime ? new Date(`${date}T${endTime}:00`) : null,
        breakTime: breakTime || 0,
        workTime,
        notes: notes || null
      }
    })

    return timeEntry
  } catch (error) {
    console.error('Create/update time entry error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la sauvegarde de l\'entrée'
    })
  }
})