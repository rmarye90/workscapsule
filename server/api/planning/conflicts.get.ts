import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { startDate, endDate } = query

    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token manquant'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

    const start = startDate ? new Date(startDate as string) : new Date()
    const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const conflicts = []

    const phoneSlots = await prisma.phoneSlot.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        assignedUser: true
      }
    })

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          {
            startDate: {
              gte: start,
              lte: end
            }
          },
          {
            endDate: {
              gte: start,
              lte: end
            }
          },
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: end } }
            ]
          }
        ]
      },
      include: {
        user: true
      }
    })

    for (const slot of phoneSlots) {
      if (!slot.assignedUser) continue

      const userLeave = leaveRequests.find(leave => 
        leave.userId === slot.assignedUserId &&
        new Date(slot.date) >= new Date(leave.startDate) &&
        new Date(slot.date) <= new Date(leave.endDate)
      )

      if (userLeave) {
        conflicts.push({
          id: `phone-leave-${slot.id}`,
          type: 'PHONE_LEAVE_CONFLICT',
          title: 'Conflit planning téléphonique / congé',
          description: `${slot.assignedUser.firstName} ${slot.assignedUser.lastName} est assigné(e) au planning téléphonique le ${slot.date} mais est en congé`,
          date: slot.date,
          severity: 'HIGH',
          data: {
            phoneSlot: slot,
            leaveRequest: userLeave
          }
        })
      }
    }

    const groupedSlots = phoneSlots.reduce((acc, slot) => {
      const key = `${slot.date}-${slot.startTime}-${slot.endTime}`
      if (!acc[key]) acc[key] = []
      acc[key].push(slot)
      return acc
    }, {})

    for (const [key, slots] of Object.entries(groupedSlots)) {
      if (slots.length > 1) {
        const assignedSlots = slots.filter(s => s.assignedUserId)
        if (assignedSlots.length > 1) {
          conflicts.push({
            id: `phone-overlap-${key}`,
            type: 'PHONE_OVERLAP',
            title: 'Créneaux téléphoniques en conflit',
            description: `Plusieurs personnes assignées sur le même créneau: ${slots[0].date} ${slots[0].startTime}-${slots[0].endTime}`,
            date: slots[0].date,
            severity: 'MEDIUM',
            data: { slots: assignedSlots }
          })
        }
      }
    }

    const teamLeaveConflicts = {}
    for (const leave of leaveRequests) {
      const dateKey = leave.startDate
      if (!teamLeaveConflicts[dateKey]) teamLeaveConflicts[dateKey] = []
      teamLeaveConflicts[dateKey].push(leave)
    }

    for (const [date, leaves] of Object.entries(teamLeaveConflicts)) {
      if (leaves.length >= 3) {
        conflicts.push({
          id: `team-leave-${date}`,
          type: 'TEAM_LEAVE_CONFLICT',
          title: 'Trop d\'absences simultanées',
          description: `${leaves.length} personnes en congé le ${date}`,
          date,
          severity: 'HIGH',
          data: { leaves }
        })
      }
    }

    return conflicts.sort((a, b) => {
      const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Erreur serveur'
    })
  }
})