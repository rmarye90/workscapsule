import { defineStore } from 'pinia'
import type { User, LoginData, RegisterData, AuthResponse } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // Actions
  const login = async (credentials: LoginData) => {
    isLoading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      
      user.value = response.user
      token.value = response.token
      
      // Stocker le token dans le localStorage
      if (import.meta.client) {
        localStorage.setItem('auth-token', response.token)
      }
      
      return response
    } catch (error: any) {
      throw new Error(error.data?.message || 'Erreur de connexion')
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    isLoading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: userData
      })
      
      user.value = response.user
      token.value = response.token
      
      // Stocker le token dans le localStorage
      if (import.meta.client) {
        localStorage.setItem('auth-token', response.token)
      }
      
      return response
    } catch (error: any) {
      throw new Error(error.data?.message || 'Erreur d\'inscription')
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    user.value = null
    token.value = null
    
    if (import.meta.client) {
      localStorage.removeItem('auth-token')
    }
    
    await navigateTo('/login')
  }

  const fetchUser = async () => {
    if (!token.value) return null
    
    try {
      const userData = await $fetch<User>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      user.value = userData
      return userData
    } catch (error) {
      // Token invalide, déconnecter l'utilisateur
      await logout()
      throw error
    }
  }

  const initAuth = async () => {
    if (import.meta.client) {
      const storedToken = localStorage.getItem('auth-token')
      if (storedToken) {
        token.value = storedToken
        try {
          await fetchUser()
        } catch (error) {
          // Token invalide, nettoyer
          token.value = null
          localStorage.removeItem('auth-token')
        }
      }
    }
  }

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    
    // Computed
    isAuthenticated,
    isAdmin,
    
    // Actions
    login,
    register,
    logout,
    fetchUser,
    initAuth
  }
})