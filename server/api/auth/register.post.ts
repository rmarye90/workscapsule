import prisma from '~/utils/prisma'
import { hashPassword, generateToken } from '~/utils/auth'
import type { RegisterData, AuthResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<RegisterData>(event)
    
    // Validation des champs requis
    if (!body.email || !body.password || !body.firstName || !body.lastName || !body.startDate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tous les champs requis doivent être remplis'
      })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Un utilisateur avec cet email existe déjà'
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(body.password)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        password: hashedPassword,
        workSchedule: body.workSchedule || 'FIVE_DAYS',
        dailyHours: body.dailyHours || 8.0,
        startDate: new Date(body.startDate),
        role: 'EMPLOYEE' // Par défaut, nouvel utilisateur = employé
      }
    })

    const { password, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword)

    const response: AuthResponse = {
      user: userWithoutPassword,
      token
    }

    return response
  } catch (error) {
    console.error('Register error:', error)
    throw error
  }
})