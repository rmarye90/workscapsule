export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Initialiser l'authentification côté client
  await authStore.initAuth()
})