import type { AuthForm, AuthResponse, SignupForm, LogoutRequest, RefreshTokenRequest } from '~/types/auth'

export function useAuth() {
  const { post } = useApi()
  const authStore = useAuthStore()
  const router = useRouter()

  async function login(credentials: AuthForm): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>('/auth/login', credentials)
      authStore.setAuth(response)
      return response
    } catch (error) {
      throw error
    }
  }

  async function signup(userData: SignupForm): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>('/auth/signup', userData)
      authStore.setAuth(response)
      return response
    } catch (error) {
      throw error
    }
  }

  async function logout(): Promise<void> {
    try {
      if (authStore.accessToken) {
        const logoutData: LogoutRequest = {
          access_token: authStore.accessToken
        }
        await post('/auth/logout', logoutData)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authStore.clearAuth()
      await router.push('/login')
    }
  }

  async function refreshToken(): Promise<AuthResponse | null> {
    try {
      if (!authStore.refreshToken) return null
      
      const refreshData: RefreshTokenRequest = {
        refresh_token: authStore.refreshToken
      }
      
      const response = await post<AuthResponse>('/auth/refresh', refreshData)
      authStore.setAuth(response)
      return response
    } catch (error) {
      authStore.clearAuth()
      await router.push('/login')
      return null
    }
  }

  return {
    login,
    signup,
    logout,
    refreshToken
  }
}