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

    const entryId = getRouterParam(event, 'id')
    
    if (!entryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de l\'entrée requis'
      })
    }

    // Vérifier que l'entrée appartient à l'utilisateur
    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: entryId }
    })

    if (!timeEntry) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Entrée introuvable'
      })
    }

    if (timeEntry.userId !== decoded.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès non autorisé'
      })
    }

    // Supprimer l'entrée
    await prisma.timeEntry.delete({
      where: { id: entryId }
    })

    return { success: true, message: 'Entrée supprimée avec succès' }
  } catch (error) {
    console.error('Delete time entry error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la suppression de l\'entrée'
    })
  }
})