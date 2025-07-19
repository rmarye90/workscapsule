export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
  
  if (!authStore.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Accès réservé aux administrateurs'
    })
  }
})