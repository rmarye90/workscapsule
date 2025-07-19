import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import type { User } from '~/types'

export const hashPassword = async (password: string): Promise<string> => {
  return await bcryptjs.hash(password, 12)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcryptjs.compare(password, hashedPassword)
}

export const generateToken = (user: Omit<User, 'password'>): string => {
  const config = useRuntimeConfig()
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  )
}

export const verifyToken = (token: string): any => {
  const config = useRuntimeConfig()
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch (error) {
    throw new Error('Invalid token')
  }
}