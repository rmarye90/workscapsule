import prisma from '~/utils/prisma'
import { comparePassword, generateToken } from '~/utils/auth'
import type { LoginData, AuthResponse } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<LoginData>(event)
    
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email et mot de passe requis'
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Identifiants invalides'
      })
    }

    const isPasswordValid = await comparePassword(body.password, user.password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Identifiants invalides'
      })
    }

    const { password, ...userWithoutPassword } = user
    const token = generateToken(userWithoutPassword)

    const response: AuthResponse = {
      user: userWithoutPassword,
      token
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
})