import { defineStore } from 'pinia'
import type { AuthResponse, User } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setAuth(authData: AuthResponse) {
    accessToken.value = authData.access_token
    refreshToken.value = authData.refresh_token
    user.value = authData.user || null
    
    // Store tokens in localStorage
    if (process.client) {
      localStorage.setItem('access_token', authData.access_token)
      localStorage.setItem('refresh_token', authData.refresh_token)
    }
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    
    // Clear tokens from localStorage
    if (process.client) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  function initAuth() {
    if (process.client) {
      const storedAccessToken = localStorage.getItem('access_token')
      const storedRefreshToken = localStorage.getItem('refresh_token')
      
      if (storedAccessToken && storedRefreshToken) {
        accessToken.value = storedAccessToken
        refreshToken.value = storedRefreshToken
      }
    }
  }

  return {
    user: readonly(user),
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    isAuthenticated,
    setAuth,
    clearAuth,
    initAuth
  }
})